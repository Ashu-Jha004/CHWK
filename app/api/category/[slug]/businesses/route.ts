// app/api/categories/[slug]/businesses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Haversine formula to calculate distance between two coordinates
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * GET /api/categories/[slug]/businesses
 * Fetches businesses within radius from user's location
 *
 * Query params:
 * - lat: User's latitude (required)
 * - lng: User's longitude (required)
 * - radius: Search radius in km (default: 20, max: 50)
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20, max: 50)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> } // ✅ FIXED: params is now a Promise
) {
  const startTime = Date.now();

  // ✅ FIXED: Await params
  const { slug } = await context.params;

  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = Math.min(
      parseFloat(searchParams.get('radius') || '20'),
      50 // Max 50km
    );
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20'),
      50 // Max 50 per page
    );

    // Validate required parameters
    if (isNaN(lat) || isNaN(lng)) {
      console.error('[API Businesses] ❌ Missing or invalid coordinates:', {
        lat: searchParams.get('lat'),
        lng: searchParams.get('lng'),
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or missing location coordinates',
          code: 'INVALID_COORDINATES',
        },
        { status: 400 }
      );
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          success: false,
          error: 'Coordinates out of valid range',
          code: 'INVALID_RANGE',
        },
        { status: 400 }
      );
    }

    // Log request hash to track duplicates/frequency
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[API Businesses] 📍 [${requestId}] Request:`, {
      slug,
      lat,
      lng,
      radius: `${radius}km`,
      page,
      limit,
      ua: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    });

    // 1. Find category by slug (FIXED)
    const category = await prisma.category.findUnique({
      where: { slug }, // ✅ slug now has value
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      },
    });

    // Check if category exists and is active
    if (!category || !category.isActive) {
      console.warn('[API Businesses] ⚠️ Category not found or inactive:', slug);
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 2. Calculate bounding box for initial filter (optimization)
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos(toRad(lat)));

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    // 3. Fetch businesses within bounding box
    const businesses = await prisma.business.findMany({
      where: {
        categories: {
          some: {
            categoryId: category.id,
          },
        },
        status: 'ACTIVE',
        deletedAt: null,
        latitude: {
          gte: minLat,
          lte: maxLat,
        },
        longitude: {
          gte: minLng,
          lte: maxLng,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        latitude: true,
        longitude: true,
        city: true,
        state: true,
        area: true,
        averageRating: true,
        totalReviews: true,
        isVerified: true,
        is24x7: true,
        hasEmergencyService: true,
        acceptsBookings: true,
        acceptsOrders: true,
        priceRange: true,
        photos: {
          where: {
            isApproved: true,
            isFlagged: false,
            deletedAt: null,
          },
          select: {
            id: true,
            url: true,
            // Minimal fields for grid
            type: true,
            // thumbnailUrl: true, // Derived or unused
            // caption: true, // Unused in grid
            // width: true, // Masonry handles this
            // height: true, // Masonry handles this
            isFeatured: true, // Needed for sorting
            displayOrder: true // Needed for sorting
          },
          orderBy: [
  { isFeatured: 'desc' }, // Featured items first
  { displayOrder: 'asc' }, // Then by display order
  { type: 'desc' }, // Then by type (COVER > LOGO > VIDEO > IMAGE)
],
          take: 50, // Increased limit to show more assets
        },
      },
    });

    console.log('[API Businesses] 📊 Initial fetch:', {
      count: businesses.length,
    });

    // 4. Calculate exact distances
    let results = businesses.map((business) => ({
      ...business,
      distance: calculateDistance(
        lat,
        lng,
        business.latitude,
        business.longitude
      ),
    }));

    // Filter by radius
    results = results.filter((b) => b.distance <= radius);

    // 5. Apply Sorting
    const sort = searchParams.get('sort') || 'distance';

    switch (sort) {
      case 'rating':
        results.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'reviews':
        results.sort((a, b) => b.totalReviews - a.totalReviews);
        break;
      case 'distance':
      default:
        results.sort((a, b) => a.distance - b.distance);
    }

    console.log('[API Businesses] ✅ After distance filter:', {
      count: results.length,
      radius: `${radius}km`,
    });

    // 6. Pagination
    const totalResults = results.length;
    const totalPages = Math.ceil(totalResults / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    // 6. Format response
    const formattedResults = paginatedResults.map((business) => ({
      id: business.id,
      name: business.name,
      slug: business.slug,
      description: business.shortDescription,
      distance: business.distance,
      location: {
        city: business.city,
        state: business.state,
        area: business.area,
      },
      rating: business.averageRating,
      reviewCount: business.totalReviews,
      isVerified: business.isVerified,
      quickStats: {
        is24x7: business.is24x7,
        hasEmergencyService: business.hasEmergencyService,
        acceptsBookings: business.acceptsBookings,
        acceptsOrders: business.acceptsOrders,
      },
      priceRange: business.priceRange,
      media: business.photos,
    }));

    const responseTime = Date.now() - startTime;

    console.log('[API Businesses] ✅ Success:', {
      category: category.name,
      totalResults,
      page,
      resultsInPage: paginatedResults.length,
      responseTime: `${responseTime}ms`,
    });

    return NextResponse.json(
      {
        success: true,
        data: formattedResults,
        pagination: {
          page,
          limit,
          totalResults,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
        searchParams: {
          latitude: lat,
          longitude: lng,
          radius,
        },
        responseTime: `${responseTime}ms`,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Response-Time': `${responseTime}ms`,
        },
      }
    );

  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error('[API Businesses] ❌ Error:', {
      slug,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
    });

    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('connection')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Database connection failed',
            code: 'DB_CONNECTION_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
          { status: 503 }
        );
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Request timeout',
            code: 'TIMEOUT_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch businesses',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development'
          ? error instanceof Error ? error.message : 'Unknown error'
          : undefined,
      },
      { status: 500 }
    );
  }
}

export const revalidate = 300;
