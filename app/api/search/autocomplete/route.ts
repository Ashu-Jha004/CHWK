import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() || "";
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lon = parseFloat(searchParams.get("lon") || "0");

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // 1. Categories (Start with or contains)
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { searchKeywords: { has: query.toLowerCase() } }
        ],
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        totalBusinesses: true,
      },
      take: 3,
      orderBy: { totalBusinesses: 'desc' }
    });

    // 2. Businesses (Name match)
    // If we have location, prioritize nearby? For now simple text match.
    const businesses = await prisma.business.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
        status: { in: ["ACTIVE", "CLAIMED"] },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        coverImage: true,
        logo: true,
        area: true,
        city: true,
        averageRating: true,
        totalReviews: true,
      },
      take: 4,
      orderBy: [
        { isVerified: 'desc' },
        { averageRating: 'desc' },
      ]
    });

    // Format suggestions
    const suggestions = [
      ...categories.map(c => ({
        type: "category",
        id: c.id,
        text: c.name,
        subText: `${c.totalBusinesses} places`,
        slug: c.slug
      })),
      ...businesses.map(b => ({
        type: "business",
        id: b.id,
        text: b.name,
        subText: `${b.area}, ${b.city} • ⭐ ${b.averageRating?.toFixed(1) || "New"}`,
        slug: b.slug,
        image: b.coverImage || b.logo
      }))
    ];

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
