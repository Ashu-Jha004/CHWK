// app/api/reviews/upload-photo/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/reviews/upload-photo
 * Uploads verification photo for a review (captured via camera)
 */
export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 1. AUTHENTICATION CHECK
    // ============================================
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be signed in to upload photos" },
        { status: 401 }
      );
    }

    // ============================================
    // 2. GET USER FROM DATABASE
    // ============================================
    const dbUser = await prisma.user.findUnique({
      where: { email: user.emailAddresses[0].emailAddress },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found", message: "User account not found in database" },
        { status: 404 }
      );
    }

    // ============================================
    // 3. PARSE FORM DATA
    // ============================================
    const formData = await request.formData();
    const reviewId = formData.get("reviewId") as string;
    const photo = formData.get("photo") as File;

    if (!reviewId || !photo) {
      return NextResponse.json(
        { error: "Missing data", message: "Review ID and photo are required" },
        { status: 400 }
      );
    }

    // ============================================
    // 4. VALIDATE FILE TYPE
    // ============================================
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: "Invalid file type", message: "Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    // ============================================
    // 5. VALIDATE FILE SIZE (max 5MB)
    // ============================================
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (photo.size > maxSize) {
      return NextResponse.json(
        { error: "File too large", message: "Photo must be less than 5MB" },
        { status: 400 }
      );
    }

    // ============================================
    // 6. FETCH REVIEW AND VERIFY OWNERSHIP
    // ============================================
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true, businessId: true, deletedAt: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found", message: "The review does not exist" },
        { status: 404 }
      );
    }

    if (review.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "Forbidden", message: "You can only upload photos to your own review" },
        { status: 403 }
      );
    }

    if (review.deletedAt) {
      return NextResponse.json(
        { error: "Review deleted", message: "Cannot upload photos to a deleted review" },
        { status: 410 }
      );
    }

    // ============================================
    // 7. CONVERT FILE TO BASE64 FOR CLOUDINARY
    // ============================================
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${photo.type};base64,${buffer.toString("base64")}`;

    // ============================================
    // 8. UPLOAD TO CLOUDINARY
    // ============================================
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: `chwk/reviews/${review.businessId}`,
      resource_type: "image",
      transformation: [
        { width: 800, height: 800, crop: "limit", quality: "auto:good" },
      ],
    });

    // Generate thumbnail
    const thumbnailUrl = cloudinary.url(uploadResult.public_id, {
      width: 200,
      height: 200,
      crop: "fill",
      quality: "auto:low",
    });

    // ============================================
    // 9. CREATE PHOTO RECORD IN DATABASE
    // ============================================
    const photoRecord = await prisma.photo.create({
      data: {
        url: uploadResult.secure_url,
        thumbnailUrl,
        type: "IMAGE",
        fileSize: photo.size,
        mimeType: photo.type,
        width: uploadResult.width,
        height: uploadResult.height,
        businessId: review.businessId,
        reviewId: review.id,
        userId: dbUser.id,
        isApproved: true, // Auto-approve review photos
        isFlagged: false,
      },
    });

    // ============================================
    // 10. UPDATE REVIEW VERIFICATION STATUS
    // ============================================
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        verificationStatus: "PHOTO_VERIFIED",
      },
    });

    // ============================================
    // 11. UPDATE BUSINESS PHOTO COUNT
    // ============================================
    await prisma.business.update({
      where: { id: review.businessId },
      data: {
        totalPhotos: { increment: 1 },
      },
    });

    // ============================================
    // 12. RETURN SUCCESS RESPONSE
    // ============================================
    return NextResponse.json({
      success: true,
      message: "Photo uploaded successfully",
      photo: {
        id: photoRecord.id,
        url: photoRecord.url,
        thumbnailUrl: photoRecord.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error("[Review Photo Upload] Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to upload photo. Please try again later.",
      },
      { status: 500 }
    );
  }
}
