/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/business/onboarding-v2/route.ts
// Optimized production-ready onboarding handler

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { MediaType } from "@prisma/client";
import { completeOnboardingSchema } from "@/lib/validations/business-onboarding.validation";
import { ZodError } from "zod";

/**
 * Generate a unique slug with collision protection
 */
async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  // Quick check for collision (rare given the random suffix but good practice)
  const existing = await prisma.business.findUnique({ where: { slug }, select: { id: true } });
  if (existing) {
    return `${baseSlug}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 4)}`;
  }

  return slug;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Authentication & ID Extraction
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ success: false, message: "User profile not accessible" }, { status: 403 });
    }

    // 2. Data Parsing & Validation
    const rawBody = await request.json();
    let validatedData;

    try {
      // We use the same schema as high-quality frontend validation to ensure parity
      validatedData = completeOnboardingSchema.parse(rawBody);
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json({
          success: false,
          message: "Validation failed",
          error: "Validation failed",
          details: err.issues.map(e => ({ path: e.path.join('.'), message: e.message }))
        }, { status: 400 });
      }
      throw err;
    }

    const {
      basicInfo,
      location,
      categories,
      businessHours,
      businessDetails,
      documentation,
      photos
    } = validatedData as any; // Cast to bypass strict intersection types for nested prisma create

    // 3. Prevent Duplicates (One business per user in this version)
    const existingBusiness = await prisma.business.findFirst({
        where: { ownerId: userId, deletedAt: null },
        select: { id: true, name: true }
    });

    if (existingBusiness) {
        return NextResponse.json({
            success: false,
            message: `Registration conflict: You already represent "${existingBusiness.name}".`,
            error: `Registration conflict: You already represent "${existingBusiness.name}".`,
            businessId: existingBusiness.id
        }, { status: 409 });
    }

    // 4. Atomic Transaction for Business Ecosystem Creation
    const businessSlug = await generateUniqueSlug(basicInfo.name);

    const result = await prisma.$transaction(async (tx) => {
      // A. Ensure User exists and has correct role
      const user = await tx.user.upsert({
        where: { id: userId },
        update: { role: "BUSINESS_OWNER" },
        create: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          avatar: clerkUser.imageUrl || null,
          role: "BUSINESS_OWNER",
        }
      });

      // B. Handle Chain Logic
      let finalChainId = basicInfo.chainId || null;
      if (!finalChainId && basicInfo.isPartOfChain && basicInfo.chainName) {
        // Create new chain if name provided but no ID selected
        const chainSlug = `${basicInfo.chainName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
        const chain = await tx.businessChain.create({
          data: {
            name: basicInfo.chainName,
            slug: chainSlug,
          }
        });
        finalChainId = chain.id;
      }

      // C. Create Business with NESTED Relations (Highly Optimized)
      return await tx.business.create({
        data: {
          // Flattened Basic Info
          name: basicInfo.name,
          slug: businessSlug,
          email: basicInfo.email,
          phone: basicInfo.phone,
          description: basicInfo.description || null,
          shortDescription: basicInfo.shortDescription || null,
          alternatePhone: basicInfo.alternatePhone || null,
          whatsappNumber: basicInfo.whatsappNumber || null,
          website: basicInfo.website || null,
          chainId: finalChainId,
          branchName: basicInfo.branchName || null,
          logo: photos.logoUrl || null,
          coverImage: photos.coverImageUrl || null,

          // Flattened Location Info
          latitude: location.latitude,
          longitude: location.longitude,
          addressLine1: location.addressLine1,
          addressLine2: location.addressLine2 || null,
          landmark: location.landmark || null,
          area: location.area || null,
          city: location.city,
          district: location.district || null,
          state: location.state,
          pincode: location.pincode,

          // Flattened Details
          priceRange: businessDetails.priceRange || null,
          acceptsBookings: businessDetails.acceptsBookings,
          acceptsOrders: businessDetails.acceptsOrders,
          hasDelivery: businessDetails.hasDelivery,
          hasPickup: businessDetails.hasPickup,
          hasDineIn: businessDetails.hasDineIn,
          hasEmergencyService: businessDetails.hasEmergencyService,
          deliveryRadius: businessDetails.deliveryRadius || null,
          minOrderAmount: businessDetails.minOrderAmount || null,
          deliveryFee: businessDetails.deliveryFee || null,
          emergencyContactNumber: businessDetails.emergencyContactNumber || null,
          emergencyExtraCharge: businessDetails.emergencyExtraCharge || null,
          minAdvanceBookingHours: businessDetails.minAdvanceBookingHours || null,
          maxAdvanceBookingDays: businessDetails.maxAdvanceBookingDays || null,
          cancellationPolicy: businessDetails.cancellationPolicy || null,

          // Verification Data
          gstNumber: documentation.gstNumber || null,
          panNumber: documentation.panNumber || null,
          businessDocuments: documentation.documents.map((d: any) => d.url),

          // Ownership & Status
          ownerId: user.id,
          status: "PENDING", // Start in PENDING for review
          is24x7: businessHours.is24x7,

          // NESTED: Business Hours
          hours: {
            create: businessHours.is24x7 ? [] : businessHours.hours.filter((h: any) => !h.isClosed).map((h: any) => ({
              dayOfWeek: h.dayOfWeek,
              openTime: h.openTime,
              closeTime: h.closeTime,
              hasSplitShift: h.hasSplitShift,
              splitCloseTime: h.splitCloseTime,
              splitReopenTime: h.splitReopenTime,
            }))
          },

          // NESTED: Categories
          categories: {
            create: [
              { categoryId: categories.primaryCategoryId, isPrimary: true, displayOrder: 0 },
              ...(categories.additionalCategoryIds || []).map((id: string, idx: number) => ({
                categoryId: id,
                isPrimary: false,
                displayOrder: idx + 1
              }))
            ]
          },

          // NESTED: Amenities
          amenities: {
            create: (businessDetails.amenityIds || []).map((id: string) => ({
              amenityId: id
            }))
          },

          // NESTED: Photos (Legacy Photo model)
          photos: {
            create: [
              { url: photos.logoUrl, type: MediaType.LOGO, isFeatured: true, userId: userId, isApproved: true },
              ...(photos.coverImageUrl ? [{ url: photos.coverImageUrl, type: MediaType.COVER, isFeatured: false, userId: userId, isApproved: true }] : []),
              ...(photos.photoUrls || []).map((url: string, idx: number) => ({
                url,
                type: MediaType.IMAGE,
                isFeatured: false,
                userId: userId,
                displayOrder: idx + 2,
                isApproved: true
              }))
            ]
          }
        }
      });
    });

    const duration = Date.now() - startTime;
    console.log(`[Onboarding] ✅ Success: ${result.name} created in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        slug: result.slug,
        status: result.status
      }
    }, { status: 201 });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[Onboarding] ❌ Failed after ${duration}ms:`, error);

    if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'unique field';
        return NextResponse.json({
            success: false,
            message: `Conflict: This ${field} is already in use.`,
            error: `Conflict: This ${field} is already in use.`
        }, { status: 409 });
    }

    return NextResponse.json({
        success: false,
        message: "Internal server processing error. Our engineers have been notified.",
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
