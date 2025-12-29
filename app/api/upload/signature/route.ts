// app/api/upload/signature/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUploadSignature } from "@/app/(businesses)/business/actions/upload-signature";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, folder } = body;

    if (!businessId || !folder) {
      return NextResponse.json(
        { error: "Missing businessId or folder" },
        { status: 400 }
      );
    }

    const result = await getUploadSignature(businessId, folder);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("[SIGNATURE_API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}
