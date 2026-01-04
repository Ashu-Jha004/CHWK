import { NextRequest, NextResponse } from "next/server";
import { verifyBusinessAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateImageSchema = z.object({
  imageUrl: z.string().url(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: businessId, itemId } = await params;

    // 1. Verify Access
    const access = await verifyBusinessAccess(businessId);
    if (!access.success) {
      return NextResponse.json(
        { error: access.message || "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateImageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid image URL" },
        { status: 400 }
      );
    }

    const { imageUrl } = validation.data;

    // 2. Verify Item ownership and Update
    // Ensure the menu item belongs to the business
    const updatedItem = await prisma.menuItem.updateMany({
        where: {
            id: itemId,
            businessId: businessId
        },
        data: {
            image: imageUrl,
            // Optionally add to images array if that was the goal, but 'image' is the main one
            // images: { push: imageUrl }
        }
    });

    if (updatedItem.count === 0) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[API] Update Menu Image Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
