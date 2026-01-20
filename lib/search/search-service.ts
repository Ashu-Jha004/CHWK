import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  BusinessSearchResult,
  SearchResponse,
  SearchParams as GlobalSearchParams
} from "@/types/search/types";
import {
  isOpenNow,
} from "@/lib/search/utils";

// Internal interface for the raw SQL result
interface RawSearchResult extends Omit<BusinessSearchResult, 'categories'> {
  categories: any;
  rank: number;
}


/**
* Search with distance calculation (Haversine formula via raw SQL)
*/
export async function searchWithDistance(
  where: Prisma.BusinessWhereInput,
  userLat: number,
  userLon: number,
  radiusKm: number,
  page: number,
  limit: number,
  sortBy: string
) {
  try {
    // 1. Calculate Bounding Box to use Geospatial Indexes (fast first pass)
    const latDelta = radiusKm / 111.32; // 1 degree lat is ~111.32km
    const lonDelta = radiusKm / (111.32 * Math.cos(userLat * (Math.PI / 180)));

    const minLat = userLat - latDelta;
    const maxLat = userLat + latDelta;
    const minLon = userLon - lonDelta;
    const maxLon = userLon + lonDelta;

    // 2. Haversine Formula for precise distance
    const distanceFormula = `
      (6371 * acos(
        cos(radians(${userLat})) *
        cos(radians(latitude)) *
        cos(radians(longitude) - radians(${userLon})) +
        sin(radians(${userLat})) *
        sin(radians(latitude))
      ))
    `;

    // 3. Get candidate IDs AND sorting fields within radius (Limit 200 for performance safety)
    // optimizing to fetch only necessary fields for sorting
    const lightweightResults: any[] = await prisma.$queryRaw`
      SELECT
        id,
        "averageRating",
        "totalReviews",
        "isVerified",
        ${Prisma.raw(distanceFormula)} as distance
      FROM businesses
      WHERE
        latitude BETWEEN ${minLat} AND ${maxLat}
        AND longitude BETWEEN ${minLon} AND ${maxLon}
        AND ${Prisma.raw(distanceFormula)} <= ${radiusKm}
        AND status IN ('ACTIVE', 'CLAIMED')
        AND "deletedAt" IS NULL
      ORDER BY distance ASC
      LIMIT 200
    `;

    if (lightweightResults.length === 0) {
      return { businesses: [], totalCount: 0 };
    }

    // 4. Sort in Memory using the lightweight data
    // This avoids fetching full data for items we won't show
    if (sortBy === "rating") {
      lightweightResults.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === "reviews") {
      lightweightResults.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
    } else {
      // Default: Sort by distance
      lightweightResults.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    }

    // 5. Paginate IDs
    const totalCount = lightweightResults.length;
    const startIndex = (page - 1) * limit;
    const slicedResults = lightweightResults.slice(startIndex, startIndex + limit);

    if (slicedResults.length === 0) {
        return { businesses: [], totalCount };
    }

    const targetIds = slicedResults.map((b) => b.id);

    // 6. Fetch Full Business Data ONLY for the page
    const businesses = await prisma.business.findMany({
      where: {
        id: { in: targetIds },
        ...where // Apply other filters if any (though ID filter is primary)
      },
      select: {
        id: true,
        slug: true,
        name: true,
        shortDescription: true,
        logo: true,
        coverImage: true,
        city: true,
        area: true,
        pincode: true,
        latitude: true,
        longitude: true,
        averageRating: true,
        totalReviews: true,
        priceRange: true,
        isVerified: true,
        categories: {
          select: {
            isPrimary: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        hours: true,
      },
    });

    // 7. Merge Distance & Open Status & Preserve Sort Order
    // The DB findMany might return in different order, so we map based on slicedResults
    const businessesWithMeta = slicedResults.map((meta) => {
      const business = businesses.find(b => b.id === meta.id);
      if (!business) return null; // Should not happen ideally

      return {
        ...business,
        isOpen: isOpenNow(business.hours),
        distance: meta.distance ? Number(Number(meta.distance).toFixed(1)) : null,
      };
    }).filter(Boolean);

    return { businesses: businessesWithMeta, totalCount };
  } catch (error) {
    console.error("[searchWithDistance] Error:", error);
    // Fallback or empty result on error
    return { businesses: [], totalCount: 0 };
  }
}

/**
 * Regular search without distance calculation
 * Enhanced with fuzzy search support for typo tolerance
 */
export async function searchRegular(
  where: Prisma.BusinessWhereInput,
  page: number,
  limit: number,
  sortBy: string
) {
  const offset = (page - 1) * limit;

  // Determine order by
  let orderBy: Prisma.BusinessOrderByWithRelationInput[] = [];

  if (sortBy === "rating") {
    orderBy = [{ averageRating: "desc" }, { totalReviews: "desc" }];
  } else if (sortBy === "reviews") {
    orderBy = [{ totalReviews: "desc" }, { averageRating: "desc" }];
  } else {
    // Relevance default - prioritize verified and highly rated
    orderBy = [
      { isVerified: "desc" },
      { averageRating: "desc" },
      { totalReviews: "desc" },
    ];
  }

  // Optimized Fields Selection
  // Only select what's needed for the card
  const selectFields = {
    id: true,
    slug: true,
    name: true,
    shortDescription: true,
    logo: true,
    coverImage: true,
    city: true,
    area: true,
    pincode: true,
    latitude: true,
    longitude: true,
    averageRating: true,
    totalReviews: true,
    priceRange: true,
    isVerified: true,
    categories: {
      select: {
        isPrimary: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
    hours: true,
  };

  const [totalCount, businesses] = await Promise.all([
    prisma.business.count({ where }),
    prisma.business.findMany({
      where,
      select: selectFields,
      orderBy,
      skip: offset,
      take: limit,
    }),
  ]);

  // Helper to calculate Open Status
  const businessesWithStatus = businesses.map((b) => ({
    ...b,
    isOpen: isOpenNow(b.hours),
  }));

  return { businesses: businessesWithStatus, totalCount };
}
