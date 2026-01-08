// app/api/upload/route.ts
// Secured API route for Cloudinary uploads

import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/utils/cloudinary-server.utils";
import { auth } from "@clerk/nextjs/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // 1. Security Check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized upload attempt" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No asset provided" }, { status: 400 });
    }

    // 2. Resource Validation
    const maxSize = 12 * 1024 * 1024; // 12MB limit
    if (file.size > maxSize) {
       return NextResponse.json({ error: "Asset exceeds 12MB security limit" }, { status: 413 });
    }

    // Convert file to buffer for Node.js environment
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Streaming Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `chwk/onboarding/${userId}`, // User-specific folder for security & organization
          resource_type: "auto",
          allowed_formats: ["jpg", "png", "webp", "pdf", "jpeg"],
          transformation: [
            { quality: "auto", fetch_format: "auto" } // Automatic optimization on upload
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Upload API] Critical Failure:", error);
    return NextResponse.json({ error: "Asset processing failed" }, { status: 500 });
  }
}
