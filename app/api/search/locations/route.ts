// API endpoint for location autocomplete suggestions
// Returns cities, areas, and pincodes matching the query

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMMON_INDIAN_CITIES, normalizeLocationName } from "@/lib/search/utils";

/**
 * GET /api/search/locations?q=bang
 * Returns location suggestions for autocomplete
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q")?.trim() || "";

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const lowerQuery = query.toLowerCase();

    // 1. Get unique cities and areas from database
    const [businessLocations] = await Promise.all([
      prisma.business.findMany({
        where: {
          OR: [
            { city: { contains: query, mode: "insensitive" } },
            { area: { contains: query, mode: "insensitive" } },
            { pincode: { startsWith: query } },
          ],
          status: { in: ["ACTIVE", "CLAIMED"] },
          deletedAt: null,
        },
        select: {
          city: true,
          area: true,
          pincode: true,
        },
        take: 100, // Get enough data to deduplicate
      }),
    ]);

    // 2. Extract unique locations
    const cities = new Set<string>();
    const areas = new Set<string>();
    const pincodes = new Set<string>();

    businessLocations.forEach((business) => {
      if (business.city && business.city.toLowerCase().includes(lowerQuery)) {
        cities.add(business.city);
      }
      if (business.area && business.area.toLowerCase().includes(lowerQuery)) {
        areas.add(`${business.area}, ${business.city}`);
      }
      if (business.pincode && business.pincode.startsWith(query)) {
        pincodes.add(`${business.pincode} (${business.city})`);
      }
    });

    // 3. Add common cities if they match
    COMMON_INDIAN_CITIES.forEach((city) => {
      if (city.toLowerCase().includes(lowerQuery)) {
        cities.add(city);
      }
    });

    // 4. Format suggestions
    const suggestions = [
      // Cities first
      ...Array.from(cities).slice(0, 5).map((city) => ({
        type: "city" as const,
        value: city,
        label: city,
        metadata: { type: "City" },
      })),
      // Then areas
      ...Array.from(areas).slice(0, 5).map((area) => ({
        type: "area" as const,
        value: area.split(",")[0].trim(),
        label: area,
        metadata: { type: "Area" },
      })),
      // Then pincodes
      ...Array.from(pincodes).slice(0, 3).map((pincode) => ({
        type: "pincode" as const,
        value: pincode.split(" ")[0],
        label: pincode,
        metadata: { type: "Pincode" },
      })),
    ];

    return NextResponse.json({
      suggestions: suggestions.slice(0, 10), // Limit to 10 total
      query,
    });
  } catch (error) {
    console.error("[Location Suggestions] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch location suggestions",
        suggestions: [],
      },
      { status: 500 }
    );
  }
}
