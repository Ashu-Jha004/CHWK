/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/business/onboarding/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { DayOfWeek, PriceRange } from "@prisma/client";

// ==================== TYPE DEFINITIONS ====================

interface BasicInfo {
  name: string;
  email: string;
  phone: string;
  description?: string;
  shortDescription?: string;
  alternatePhone?: string;
  whatsappNumber?: string;
  website?: string;
  chainId?: string;
  chainName?: string;
  branchName?: string;
}

interface Location {
  latitude: number;
  longitude: number;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  area?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
}

interface Categories {
  primaryCategoryId: string;
  additionalCategoryIds?: string[];
}

interface BusinessHour {
  dayOfWeek: DayOfWeek;
  isClosed: boolean;
  openTime?: string;
  closeTime?: string;
  hasSplitShift: boolean;
  splitCloseTime?: string;
  splitReopenTime?: string;
}

interface BusinessDetails {
  priceRange?: PriceRange;
  acceptsBookings: boolean;
  acceptsOrders: boolean;
  hasDelivery: boolean;
  hasPickup: boolean;
  hasDineIn: boolean;
  hasEmergencyService: boolean;
  deliveryRadius?: number;
  minOrderAmount?: number;
  deliveryFee?: number;
  emergencyContactNumber?: string;
  emergencyExtraCharge?: number;
  minAdvanceBookingHours?: number;
  maxAdvanceBookingDays?: number;
  cancellationPolicy?: string;
  amenityIds?: string[];
}

interface Documentation {
  gstNumber?: string;
  panNumber?: string;
  documents: Array<{
    type: string;
    url: string;
    name?: string;
  }>;
}

interface Photos {
  logoUrl: string;
  coverImageUrl?: string;
  photoUrls: string[];
}

interface OnboardingData {
  basicInfo: BasicInfo;
  location: Location;
  categories: Categories;
  businessHours: {
    is24x7: boolean;
    hours: BusinessHour[];
  };
  businessDetails: BusinessDetails;
  documentation: Documentation;
  photos: Photos;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate URL-friendly slug with random suffix
 */
function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Convert empty strings and undefined to null for database
 */
function sanitizeValue(value: any): any {
  if (value === "" || value === undefined) return null;
  return value;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indian phone number (10 digits)
 */
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
}

/**
 * Validate Indian PIN code (6 digits)
 */
function isValidPincode(pincode: string): boolean {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
}

// ==================== MAIN HANDLER ====================

export async function POST(request: NextRequest) {
  try {
    // ========== STEP 1: AUTHENTICATION ==========
    const { userId } = await auth();

    if (!userId) {
      console.error("[Onboarding] Unauthorized request - no userId");
      return NextResponse.json(
        { success: false, error: "Authentication required. Please sign in." },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();

    if (!clerkUser) {
      console.error("[Onboarding] Clerk user not found for userId:", userId);
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    console.log(`[Onboarding] 🚀 Starting onboarding for user: ${userId}`);

    // ========== STEP 2: GET OR CREATE USER ==========
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("[Onboarding] Creating new user record...");

      user = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          avatar: clerkUser.imageUrl || null,
          role: "BUSINESS_OWNER",
        },
      });

      console.log(`[Onboarding] ✅ User created: ${user.id}`);
    } else {
      console.log(`[Onboarding] ✅ User found: ${user.id}`);
    }

    // ========== STEP 3: PARSE AND SANITIZE REQUEST DATA ==========
    const rawData: any = await request.json();

    console.log("[Onboarding] 📦 Raw data received");

    // Clean and structure data - remove frontend-only fields
    const data: OnboardingData = {
      basicInfo: {
        name: rawData.basicInfo.name?.trim(),
        email: rawData.basicInfo.email?.trim(),
        phone: rawData.basicInfo.phone?.replace(/\s+/g, ""),
        description: sanitizeValue(rawData.basicInfo.description?.trim()),
        shortDescription: sanitizeValue(
          rawData.basicInfo.shortDescription?.trim()
        ),
        alternatePhone: sanitizeValue(
          rawData.basicInfo.alternatePhone?.replace(/\s+/g, "")
        ),
        whatsappNumber: sanitizeValue(
          rawData.basicInfo.whatsappNumber?.replace(/\s+/g, "")
        ),
        website: sanitizeValue(rawData.basicInfo.website?.trim()),
        chainId: sanitizeValue(rawData.basicInfo.chainId),
        chainName: sanitizeValue(rawData.basicInfo.chainName?.trim()),
        branchName: sanitizeValue(rawData.basicInfo.branchName?.trim()),
      },
      location: {
        latitude: parseFloat(rawData.location.latitude),
        longitude: parseFloat(rawData.location.longitude),
        addressLine1: rawData.location.addressLine1?.trim(),
        addressLine2: sanitizeValue(rawData.location.addressLine2?.trim()),
        landmark: sanitizeValue(rawData.location.landmark?.trim()),
        area: sanitizeValue(rawData.location.area?.trim()),
        city: rawData.location.city?.trim(),
        district: sanitizeValue(rawData.location.district?.trim()),
        state: rawData.location.state?.trim(),
        pincode: rawData.location.pincode?.replace(/\s+/g, ""),
      },
      categories: {
        primaryCategoryId: rawData.categories.primaryCategoryId,
        additionalCategoryIds: rawData.categories.additionalCategoryIds || [],
      },
      businessHours: {
        is24x7: rawData.businessHours.is24x7 || false,
        hours: rawData.businessHours.hours || [],
      },
      businessDetails: {
        priceRange: rawData.businessDetails.priceRange || null,
        acceptsBookings: rawData.businessDetails.acceptsBookings || false,
        acceptsOrders: rawData.businessDetails.acceptsOrders || false,
        hasDelivery: rawData.businessDetails.hasDelivery || false,
        hasPickup: rawData.businessDetails.hasPickup || false,
        hasDineIn: rawData.businessDetails.hasDineIn || false,
        hasEmergencyService:
          rawData.businessDetails.hasEmergencyService || false,
        deliveryRadius: rawData.businessDetails.deliveryRadius || null,
        minOrderAmount: rawData.businessDetails.minOrderAmount || null,
        deliveryFee: rawData.businessDetails.deliveryFee || null,
        emergencyContactNumber: sanitizeValue(
          rawData.businessDetails.emergencyContactNumber?.replace(/\s+/g, "")
        ),
        emergencyExtraCharge:
          rawData.businessDetails.emergencyExtraCharge || null,
        minAdvanceBookingHours:
          rawData.businessDetails.minAdvanceBookingHours || null,
        maxAdvanceBookingDays:
          rawData.businessDetails.maxAdvanceBookingDays || null,
        cancellationPolicy: sanitizeValue(
          rawData.businessDetails.cancellationPolicy?.trim()
        ),
        amenityIds: rawData.businessDetails.amenityIds || [],
      },
      documentation: {
        gstNumber: sanitizeValue(
          rawData.documentation.gstNumber?.trim().toUpperCase()
        ),
        panNumber: sanitizeValue(
          rawData.documentation.panNumber?.trim().toUpperCase()
        ),
        documents: rawData.documentation.documents || [],
      },
      photos: {
        logoUrl: rawData.photos.logoUrl,
        coverImageUrl: sanitizeValue(rawData.photos.coverImageUrl),
        photoUrls: rawData.photos.photoUrls || [],
      },
    };

    console.log("[Onboarding] ✅ Data cleaned and sanitized");

    // ========== STEP 4: VALIDATE DATA ==========
    const validation = validateOnboardingData(data);

    if (!validation.valid) {
      console.error("[Onboarding] ❌ Validation failed:", validation.error);
      return NextResponse.json(
        { success: false, error: validation.error, field: validation.field },
        { status: 400 }
      );
    }

    console.log("[Onboarding] ✅ Validation passed");

    // ========== STEP 5: CHECK FOR EXISTING BUSINESS ==========
    const existingBusiness = await prisma.business.findFirst({
      where: {
        ownerId: user.id,
        deletedAt: null,
      },
    });

    if (existingBusiness) {
      console.warn(
        "[Onboarding] ⚠️ User already has a business:",
        existingBusiness.id
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "You already have a registered business. Contact support for multiple businesses.",
          businessId: existingBusiness.id,
          businessName: existingBusiness.name,
        },
        { status: 400 }
      );
    }

    console.log("[Onboarding] ✅ No existing business found");

    // ========== STEP 6: CREATE BUSINESS IN TRANSACTION ==========
    console.log("[Onboarding] 💾 Starting database transaction...");

    const business = await prisma.$transaction(async (tx) => {
      // Create main business record
      const biz = await tx.business.create({
        data: {
          // Basic Info
          name: data.basicInfo.name,
          slug: generateSlug(data.basicInfo.name),
          email: data.basicInfo.email,
          phone: data.basicInfo.phone,
          description: data.basicInfo.description,
          shortDescription: data.basicInfo.shortDescription,
          alternatePhone: data.basicInfo.alternatePhone,
          whatsappNumber: data.basicInfo.whatsappNumber,
          website: data.basicInfo.website,

          // Location
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          addressLine1: data.location.addressLine1,
          addressLine2: data.location.addressLine2,
          landmark: data.location.landmark,
          area: data.location.area,
          city: data.location.city,
          district: data.location.district,
          state: data.location.state,
          pincode: data.location.pincode,

          // Business Settings
          priceRange: data.businessDetails.priceRange,
          acceptsBookings: data.businessDetails.acceptsBookings,
          acceptsOrders: data.businessDetails.acceptsOrders,
          hasDelivery: data.businessDetails.hasDelivery,
          hasPickup: data.businessDetails.hasPickup,
          hasDineIn: data.businessDetails.hasDineIn,
          hasEmergencyService: data.businessDetails.hasEmergencyService,

          // Delivery Settings
          deliveryRadius: data.businessDetails.deliveryRadius,
          minOrderAmount: data.businessDetails.minOrderAmount,
          deliveryFee: data.businessDetails.deliveryFee,

          // Emergency Settings
          emergencyContactNumber: data.businessDetails.emergencyContactNumber,
          emergencyExtraCharge: data.businessDetails.emergencyExtraCharge,

          // Booking Policies
          minAdvanceBookingHours: data.businessDetails.minAdvanceBookingHours,
          maxAdvanceBookingDays: data.businessDetails.maxAdvanceBookingDays,
          cancellationPolicy: data.businessDetails.cancellationPolicy,

          // Documentation
          gstNumber: data.documentation.gstNumber,
          panNumber: data.documentation.panNumber,
          businessDocuments:
            data.documentation.documents.length > 0
              ? data.documentation.documents.map((doc) => doc.url)
              : [],

          // Chain Information
          chainId: data.basicInfo.chainId,
          branchName: data.basicInfo.branchName,

          // Status
          status: "PENDING",
          isVerified: false,
          is24x7: data.businessHours.is24x7,

          // Owner
          ownerId: user.id,
        },
      });

      console.log(`[Onboarding] ✅ Business created: ${biz.id}`);

      // Create business hours
      const openHours = data.businessHours.hours.filter((h) => !h.isClosed);

      if (openHours.length > 0) {
        await tx.businessHours.createMany({
          data: openHours.map((hour) => ({
            businessId: biz.id,
            dayOfWeek: hour.dayOfWeek,
            openTime: hour.openTime!,
            closeTime: hour.closeTime!,
            isClosed: false,
            hasSplitShift: hour.hasSplitShift,
            splitCloseTime: hour.splitCloseTime || null,
            splitReopenTime: hour.splitReopenTime || null,
          })),
        });

        console.log(
          `[Onboarding] ✅ Created ${openHours.length} business hours`
        );
      }

      // Create primary category link
      await tx.businessCategory.create({
        data: {
          businessId: biz.id,
          categoryId: data.categories.primaryCategoryId,
          isPrimary: true,
          displayOrder: 0,
        },
      });

      // Create additional category links
      if (
        data.categories.additionalCategoryIds &&
        data.categories.additionalCategoryIds.length > 0
      ) {
        await tx.businessCategory.createMany({
          data: data.categories.additionalCategoryIds.map((catId, index) => ({
            businessId: biz.id,
            categoryId: catId,
            isPrimary: false,
            displayOrder: index + 1,
          })),
        });
      }

      const totalCategories =
        1 + (data.categories.additionalCategoryIds?.length || 0);
      console.log(`[Onboarding] ✅ Linked ${totalCategories} categories`);

      // Create logo photo
      await tx.photo.create({
        data: {
          businessId: biz.id,
          userId: user.id,
          url: data.photos.logoUrl,
          type: "LOGO",
          isApproved: true,
          isFeatured: true,
          displayOrder: 0,
        },
      });

      let photoCount = 1;

      // Create cover photo if provided
      if (data.photos.coverImageUrl) {
        await tx.photo.create({
          data: {
            businessId: biz.id,
            userId: user.id,
            url: data.photos.coverImageUrl,
            type: "COVER",
            isApproved: true,
            isFeatured: false,
            displayOrder: 1,
          },
        });
        photoCount++;
      }

      // Create gallery photos
      if (data.photos.photoUrls.length > 0) {
        await tx.photo.createMany({
          data: data.photos.photoUrls.map((url, index) => ({
            businessId: biz.id,
            userId: user.id,
            url,
            type: "IMAGE",
            isApproved: true,
            isFeatured: false,
            displayOrder: photoCount + index,
          })),
        });
        photoCount += data.photos.photoUrls.length;
      }

      console.log(`[Onboarding] ✅ Created ${photoCount} photos`);

      // Link amenities
      if (
        data.businessDetails.amenityIds &&
        data.businessDetails.amenityIds.length > 0
      ) {
        await tx.businessAmenity.createMany({
          data: data.businessDetails.amenityIds.map((amenityId) => ({
            businessId: biz.id,
            amenityId,
          })),
        });

        console.log(
          `[Onboarding] ✅ Linked ${data.businessDetails.amenityIds.length} amenities`
        );
      }

      return biz;
    });

    console.log(`[Onboarding] 🎉 SUCCESS! Business registered: ${business.id}`);

    // ========== STEP 7: RETURN SUCCESS RESPONSE ==========
    return NextResponse.json(
      {
        success: true,
        message:
          "Business registered successfully! Your submission is pending review.",
        data: {
          businessId: business.id,
          businessName: business.name,
          slug: business.slug,
          status: business.status,
          createdAt: business.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Onboarding] ❌ FATAL ERROR:", error);

    // Handle specific Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; meta?: any };

      // Unique constraint violation
      if (prismaError.code === "P2002") {
        const target = prismaError.meta?.target || "field";
        return NextResponse.json(
          {
            success: false,
            error: `A business with this ${target} already exists.`,
          },
          { status: 409 }
        );
      }

      // Foreign key constraint violation
      if (prismaError.code === "P2003") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid category or amenity selected. Please refresh and try again.",
          },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to register business. Please try again or contact support.",
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

// ==================== VALIDATION FUNCTION ====================

function validateOnboardingData(data: OnboardingData): {
  valid: boolean;
  error?: string;
  field?: string;
} {
  // Validate Basic Info
  if (!data.basicInfo.name || data.basicInfo.name.length < 3) {
    return {
      valid: false,
      error: "Business name must be at least 3 characters long",
      field: "basicInfo.name",
    };
  }

  if (!data.basicInfo.email || !isValidEmail(data.basicInfo.email)) {
    return {
      valid: false,
      error: "Please provide a valid email address",
      field: "basicInfo.email",
    };
  }

  if (!data.basicInfo.phone || !isValidPhone(data.basicInfo.phone)) {
    return {
      valid: false,
      error: "Please provide a valid 10-digit Indian phone number",
      field: "basicInfo.phone",
    };
  }

  // Validate Location
  if (!data.location.latitude || !data.location.longitude) {
    return {
      valid: false,
      error:
        "Location coordinates are required. Please select your location on the map.",
      field: "location",
    };
  }

  if (data.location.latitude < -90 || data.location.latitude > 90) {
    return {
      valid: false,
      error: "Invalid latitude value",
      field: "location.latitude",
    };
  }

  if (data.location.longitude < -180 || data.location.longitude > 180) {
    return {
      valid: false,
      error: "Invalid longitude value",
      field: "location.longitude",
    };
  }

  if (!data.location.addressLine1 || data.location.addressLine1.length < 5) {
    return {
      valid: false,
      error: "Please provide a complete address",
      field: "location.addressLine1",
    };
  }

  if (!data.location.city || data.location.city.length < 2) {
    return {
      valid: false,
      error: "City is required",
      field: "location.city",
    };
  }

  if (!data.location.state || data.location.state.length < 2) {
    return {
      valid: false,
      error: "State is required",
      field: "location.state",
    };
  }

  if (!data.location.pincode || !isValidPincode(data.location.pincode)) {
    return {
      valid: false,
      error: "Please provide a valid 6-digit PIN code",
      field: "location.pincode",
    };
  }

  // Validate Categories
  if (!data.categories.primaryCategoryId) {
    return {
      valid: false,
      error: "Please select a business category",
      field: "categories.primaryCategoryId",
    };
  }

  // Validate Business Hours (if not 24x7)
  if (!data.businessHours.is24x7) {
    const openHours = data.businessHours.hours.filter((h) => !h.isClosed);

    if (openHours.length === 0) {
      return {
        valid: false,
        error: "Please provide business hours or select 24x7 operation",
        field: "businessHours",
      };
    }

    // Validate each open hour has required times
    for (const hour of openHours) {
      if (!hour.openTime || !hour.closeTime) {
        return {
          valid: false,
          error: `Please provide opening and closing times for ${hour.dayOfWeek}`,
          field: "businessHours",
        };
      }

      if (
        hour.hasSplitShift &&
        (!hour.splitCloseTime || !hour.splitReopenTime)
      ) {
        return {
          valid: false,
          error: `Please provide split shift times for ${hour.dayOfWeek}`,
          field: "businessHours",
        };
      }
    }
  }

  // Validate Photos
  if (!data.photos.logoUrl) {
    return {
      valid: false,
      error: "Business logo is required",
      field: "photos.logoUrl",
    };
  }

  if (!data.photos.photoUrls || data.photos.photoUrls.length < 3) {
    return {
      valid: false,
      error: `Please upload at least 3 business photos. Currently: ${
        data.photos.photoUrls?.length || 0
      } photos`,
      field: "photos.photoUrls",
    };
  }

  // Validate Delivery Settings (if delivery is enabled)
  if (data.businessDetails.hasDelivery) {
    if (
      !data.businessDetails.deliveryRadius ||
      data.businessDetails.deliveryRadius <= 0
    ) {
      return {
        valid: false,
        error: "Please specify delivery radius",
        field: "businessDetails.deliveryRadius",
      };
    }
  }

  // Validate GST format if provided
  if (data.documentation.gstNumber) {
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(data.documentation.gstNumber)) {
      return {
        valid: false,
        error: "Invalid GST number format",
        field: "documentation.gstNumber",
      };
    }
  }

  // Validate PAN format if provided
  if (data.documentation.panNumber) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(data.documentation.panNumber)) {
      return {
        valid: false,
        error: "Invalid PAN number format",
        field: "documentation.panNumber",
      };
    }
  }

  return { valid: true };
}
