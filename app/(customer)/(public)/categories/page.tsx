// app/categories/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import CategoryGrid from '@/components/categories/category-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/LandingPage/layout/header';

/**
 * Generate metadata for SEO
 */
export const metadata: Metadata = {
  title: 'Browse Categories | CHWK - Discover Local Businesses',
  description:
    'Explore all business categories on CHWK. Find restaurants, gyms, salons, hotels, and more local services near you.',
  keywords: [
    'business categories',
    'local services',
    'restaurants',
    'gyms',
    'salons',
    'hotels',
    'CHWK',
    'local businesses',
  ],
  openGraph: {
    title: 'Browse Categories | CHWK',
    description: 'Discover local businesses across all categories',
    type: 'website',
    url: '/categories',
  },
  alternates: {
    canonical: '/categories',
  },
};

/**
 * Fetch categories directly from database (optimized)
 * This runs on the server only, no HTTP overhead
 */
async function getCategories() {
  const startTime = Date.now();

  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null, // Only parent categories
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

    const responseTime = Date.now() - startTime;

    console.log('[Categories Page] ✅ Data fetched directly from DB:', {
      count: categories.length,
      responseTime: `${responseTime}ms`,
    });

    return categories;

  } catch (error) {
    console.error('[Categories Page] ❌ Database Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return [];
  }
}

/**
 * Loading Skeleton Component
 */
function CategoriesLoading() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border/50 bg-card p-6"
        >
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main Categories Page Component
 * Now fetches directly from database (no API call)
 */
// Enable ISR with short revalidation for production
export const revalidate = 60; // Revalidate every 60 seconds

export default async function CategoriesPage() {
  // Fetch directly from database - single query
  const categories = await getCategories();

  console.log('[CategoriesPage] Rendered with count:', categories.length);

  return (
    <main className="min-h-screen bg-background">
      {/* ... previous content ... */}
      <section className="border-b border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Header />
        <div className="container-padding section-spacing-tight mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-responsive-2xl font-bold tracking-tight text-foreground">
              Explore Categories
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Discover local businesses and services near you
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="section-spacing">
        <div className="container-padding mx-auto max-w-7xl">
          <Suspense fallback={<CategoriesLoading />}>
            <CategoryGrid categories={categories} />
          </Suspense>
        </div>
      </section>

      {/* Info Section */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="container-padding section-spacing-tight mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground md:text-2xl">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="mt-3 text-muted-foreground">
              We&apos;re constantly adding new categories and businesses to serve you better.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
