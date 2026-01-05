// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust path to your Prisma client

/**
 * GET /api/categories
 * Fetches all active categories for the category listing page
 * Caches for 1 hour, revalidates every 3600 seconds
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Fetch all active categories with only required fields
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null, // Only fetch parent categories (no nested for now)
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        displayOrder: true,
        description: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    // Check if no categories found
    if (!categories || categories.length === 0) {
      console.warn('[API Categories] No active categories found in database');
      return NextResponse.json(
        {
          success: true,
          data: [],
          count: 0,
          message: 'No categories available',
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        }
      );
    }

    const responseTime = Date.now() - startTime;

    console.log(`[API Categories] ✅ Success: ${categories.length} categories fetched in ${responseTime}ms`);

    return NextResponse.json(
      {
        success: true,
        data: categories,
        count: categories.length,
        responseTime: `${responseTime}ms`,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Response-Time': `${responseTime}ms`,
        },
      }
    );

  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Detailed error logging for debugging
    console.error('[API Categories] ❌ Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
    });

    // Check for specific Prisma errors
    if (error instanceof Error) {
      // Database connection error
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

      // Query timeout error
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Database query timeout',
            code: 'DB_TIMEOUT_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
          { status: 504 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development'
          ? error instanceof Error ? error.message : 'Unknown error'
          : undefined,
      },
      { status: 500 }
    );
  }
}

// Enable static generation with revalidation
export const revalidate = 3600; // Revalidate every 1 hour
export const dynamic = 'force-static'; // Pre-render at build time
