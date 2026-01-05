// app/api/businesses/popular/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/businesses/popular
 * Fetches popular businesses in the user's city (fallback when radius search fails)
 *
 * Query params:
 * - city: User's city
 * - state: User's state
 * - categoryId: Category ID (optional)
 * - limit: Number of results (default: 8)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';
    const categoryId = searchParams.get('categoryId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20);

    if (!city || !state) {
      return NextResponse.json(
        {
          success: false,
          error: 'City and state are required',
          code: 'MISSING_PARAMETERS',
        },
        { status: 400 }
      );
    }

    console.log('[API Popular Businesses] 📍 Request:', {
      city,
      state,
      categoryId,
      limit,
    });

    // Build where clause
    const whereClause: any = {
      status: 'ACTIVE',
      deletedAt: null,
      city,
      state,
    };

    // Add category filter if provided
    if (categoryId) {
      whereClause.categories = {
        some: {
          categoryId,
        },
      };
    }

    // Fetch popular businesses (by rating and review count)
    const businesses = await prisma.business.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        city: true,
        state: true,
        area: true,
        averageRating: true,
        totalReviews: true,
        isVerified: true,
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
            thumbnailUrl: true,
            caption: true,
            type: true,
          },
          orderBy: [
            { type: 'desc' },
            { isFeatured: 'desc' },
          ],
          take: 3,
        },
      },
      orderBy: [
        { averageRating: 'desc' },
        { totalReviews: 'desc' },
      ],
      take: limit,
    });

    const responseTime = Date.now() - startTime;

    console.log('[API Popular Businesses] ✅ Success:', {
      count: businesses.length,
      city,
      state,
      responseTime: `${responseTime}ms`,
    });

    return NextResponse.json(
      {
        success: true,
        data: businesses,
        count: businesses.length,
        location: { city, state },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error('[API Popular Businesses] ❌ Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch popular businesses',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

export const revalidate = 1800; // 30 minutes
