// app/api/amenities/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const amenities = await prisma.amenity.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { isPopular: "desc" },
        { displayOrder: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        category: true,
        isPopular: true,
      },
    });

    return NextResponse.json(amenities);
  } catch (error) {
    console.error("[AMENITIES_API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch amenities" },
      { status: 500 }
    );
  }
}
