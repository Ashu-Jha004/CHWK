// app/actions/amenities.actions.ts
// Server actions for fetching amenities

"use server";

import { prisma } from "@/lib/prisma";

export interface AmenityOption {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  category: string | null;
  description: string | null;
}

/**
 * Fetch all active amenities grouped by category
 */
export async function getActiveAmenities(): Promise<AmenityOption[]> {
  try {
    const amenities = await prisma.amenity.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        category: true,
        description: true,
      },
      orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
    });

    return amenities as AmenityOption[];
  } catch (error) {
    console.error("[Amenities] Error fetching amenities:", error);
    throw new Error("Failed to fetch amenities");
  }
}

/**
 * Get amenities grouped by category
 */
export async function getAmenitiesByCategory(): Promise<
  Record<string, AmenityOption[]>
> {
  const amenities = await getActiveAmenities();

  const grouped: Record<string, AmenityOption[]> = {};

  amenities.forEach((amenity) => {
    const category = amenity.category || "Other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(amenity);
  });

  return grouped;
}
