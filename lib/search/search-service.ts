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
  const offset = (page - 1) * limit;

  // Calculate Bounding Box to use Indexes
  const latDelta = radiusKm / 111.32; // 1 degree lat is ~111.32km
  const lonDelta = radiusKm / (111.32 * Math.cos(userLat * (Math.PI / 180)));

  const minLat = userLat - latDelta;
  const maxLat = userLat + latDelta;
  const minLon = userLon - lonDelta;
  const maxLon = userLon + lonDelta;

  // Build SQL for distance calculation
  const distanceFormula = `
    (6371 * acos(
      cos(radians(${userLat})) *
      cos(radians(latitude)) *
      cos(radians(longitude) - radians(${userLon})) +
      sin(radians(${userLat})) *
      sin(radians(latitude))
    ))
  `;

  // Get business IDs within radius using raw SQL
  // Added Bounding Box Check: latitude BETWEEN ${minLat} AND ${maxLat} ...
  const businessIdsInRadius: any[] = await prisma.$queryRaw`
    SELECT
      id,
      ${Prisma.raw(distanceFormula)} as distance
    FROM businesses
    WHERE
      latitude BETWEEN ${minLat} AND ${maxLat}
      AND longitude BETWEEN ${minLon} AND ${maxLon}
      AND ${Prisma.raw(distanceFormula)} <= ${radiusKm}
      AND status IN ('ACTIVE', 'CLAIMED')
      AND "deletedAt" IS NULL
    ORDER BY distance ASC
    LIMIT 100 -- Limit potential intermediate matches
  `;

  const businessIds = businessIdsInRadius.map((b) => b.id);

  if (businessIds.length === 0) {
    return { businesses: [], totalCount: 0 };
  }

  // Add ID filter to where clause
  // IMPORTANT: We must merge this with the existing where clause carefully
  // But wait, 'where' argument is Prisma.BusinessWhereInput.
  // We should create a new object.
  const finalWhere: Prisma.BusinessWhereInput = {
    ...where,
    id: { in: businessIds },
  };

  // Get total count AND businesses in parallel
  const [totalCount, businesses] = await Promise.all([
    prisma.business.count({ where: finalWhere }),
    prisma.business.findMany({
      where: finalWhere,
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
                      }
                  }
              }
          },
          hours: true,
      },
      skip: offset,
      take: limit,
    })
  ]);

  // Helper to calculate Open Status
  const businessesWithStatus = businesses.map(business => {
     return {
       ...business,
       isOpen: isOpenNow(business.hours)
     };
  });

  // Add distance to each business
  const businessesWithDistance = businessesWithStatus.map((business) => {
    const distanceData = businessIdsInRadius.find((b) => b.id === business.id);
    return {
      ...business,
      distance: distanceData ? Number(distanceData.distance.toFixed(1)) : null,
    };
  });

  // Sort based on sortBy parameter
  if (sortBy === "distance") {
    businessesWithDistance.sort(
      (a, b) => (a.distance || 999) - (b.distance || 999)
    );
  } else if (sortBy === "rating") {
    businessesWithDistance.sort(
      (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
    );
  } else if (sortBy === "reviews") {
    businessesWithDistance.sort((a, b) => b.totalReviews - a.totalReviews);
  }

  return { businesses: businessesWithDistance, totalCount };
}

/**
 * Regular search without distance calculation
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
    // Relevance: prioritize verified, then rating
    orderBy = [
      { isVerified: "desc" },
      { averageRating: "desc" },
      { totalReviews: "desc" },
    ];
  }

  // Get total count AND businesses in parallel
  const [totalCount, businesses] = await Promise.all([
    prisma.business.count({ where: where }),
    prisma.business.findMany({
      where,
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
                      }
                  }
              }
          },
          hours: true,
      },
      orderBy,
      skip: offset,
      take: limit,
    })
  ]);

  // Helper to calculate Open Status
  const businessesWithStatus = businesses.map(b => ({
    ...b,
    isOpen: isOpenNow(b.hours)
  }));

  return { businesses: businessesWithStatus, totalCount };
}
