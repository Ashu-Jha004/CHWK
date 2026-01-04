// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { searchKeywords: { hasSome: [search.toLowerCase()] } },
              ],
            }
          : {}),
      },
      orderBy: [
        { isFeatured: "desc" },
        { displayOrder: "asc" },
        { name: "asc" },
      ],
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        parentId: true,
        isFeatured: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
