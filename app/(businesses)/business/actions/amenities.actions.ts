// app/actions/amenities.actions.ts
// Server actions for fetching amenities with grouped caching

"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export interface AmenityOption {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  category: string | null;
  description: string | null;
}

/**
 * Fetch all active amenities (Cached for 1 hour)
 */
export const getActiveAmenities = unstable_cache(
  async (): Promise<AmenityOption[]> => {
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
  },
  ["active-amenities-list"],
  { revalidate: 3600, tags: ["amenities"] }
);

/**
 * Get amenities grouped by category (Uses the cached base function)
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
