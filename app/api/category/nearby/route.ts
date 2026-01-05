// app/api/categories/nearby/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/categories/nearby
 * Suggests related/nearby categories that have businesses
 *
 * Query params:
 * - currentSlug: Current category slug (to exclude)
 * - limit: Number of suggestions (default: 4)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const currentSlug = searchParams.get('currentSlug') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 10);

    console.log('[API Nearby Categories] 📍 Request:', {
      currentSlug,
      limit,
    });

    // Fetch active categories with business count, excluding current
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        slug: {
          not: currentSlug,
        },
        totalBusinesses: {
          gt: 0, // Only categories with businesses
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        totalBusinesses: true,
      },
      orderBy: {
        totalBusinesses: 'desc', // Popular categories first
      },
      take: limit,
    });

    const responseTime = Date.now() - startTime;

    console.log('[API Nearby Categories] ✅ Success:', {
      count: categories.length,
      responseTime: `${responseTime}ms`,
    });

    return NextResponse.json(
      {
        success: true,
        data: categories,
        count: categories.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error('[API Nearby Categories] ❌ Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch nearby categories',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

export const revalidate = 3600; // 1 hour
