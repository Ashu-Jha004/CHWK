// app/categories/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DiscoveryPageClient from '@/components/discovery/discovery-page-client';

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      select: {
        name: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
      },
    });

    if (!category) {
      return {
        title: 'Category Not Found | CHWK',
      };
    }

    return {
      title: category.metaTitle || `${category.name} Near You | CHWK`,
      description:
        category.metaDescription ||
        `Discover the best ${category.name.toLowerCase()} businesses near you. Browse photos, videos, ratings, and reviews on CHWK.`,
      keywords: [
        category.name,
        'local businesses',
        'near me',
        'CHWK',
        'reviews',
        'ratings',
      ],
      openGraph: {
        title: `${category.name} Near You | CHWK`,
        description: category.description || `Find ${category.name.toLowerCase()} near you`,
        type: 'website',
      },
      alternates: {
        canonical: `/categories/${slug}`,
      },
    };
  } catch (error) {
    console.error('[Discovery Page] Metadata error:', error);
    return {
      title: 'Discover Businesses | CHWK',
    };
  }
}

/**
 * Main Discovery Page (Server Component)
 * Validates category and delegates to client component
 */
export default async function DiscoveryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    // Validate category exists and is active
    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
      },
    });

    if (!category) {
      notFound();
    }

    // Pass to client component for interactive features
    return <DiscoveryPageClient category={category} />;
  } catch (error) {
    console.error('[Discovery Page] Error:', error);
    throw error;
  }
}

// Revalidate every 5 minutes
export const revalidate = 300;
