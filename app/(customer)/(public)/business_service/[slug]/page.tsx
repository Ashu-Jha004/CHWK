import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";

import { prisma } from "@/lib/prisma";
import { BusinessDetail } from "@/types/customer/business/business-detail";
import { BusinessPageClient } from "./_components/business-page-client";
import { BusinessPageSkeleton } from "./_components/business-page-skeleton";
import { generateAllSchemas } from "@/lib/utils/seo-schema";
import { isValidBusiness } from "@/lib/utils/business-detail-utils";

/* =====================================================
   CONFIG
===================================================== */

export const revalidate = 3600; // 1 hour ISR

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* =====================================================
   METADATA (SEO)
===================================================== */

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { slug } = await params;
  const business = await fetchBusinessMetadata(slug);

  if (!business) {
    return {
      title: "Business Not Found",
      description: "The business you are looking for does not exist.",
      robots: "noindex, nofollow",
    };
  }

  const service =
    business.categories?.[0]?.category?.name ?? "Professional Service";

  const location = `${business.area}, ${business.city}`;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://chwk.vercel.app";

  const title = `${service} in ${location} | ${business.name}`;
  const description = `Looking for trusted ${service} in ${location}? ${business.name} offers verified services with ${business.totalReviews}+ reviews and reliable local support.`;

  return {
    title,
    description,
    keywords: [
      service,
      `${service} in ${business.city}`,
      `${service} near ${business.area}`,
      business.name,
      business.city,
      business.state,
    ],
    robots: "index, follow",
    alternates: {
      canonical: `${baseUrl}/business_service/${business.slug}`,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${baseUrl}/business_service/${business.slug}`,
      siteName: "CHWK",
      locale: "en_IN",
      images: business.logo
        ? [
            {
              url: business.logo,
              width: 1200,
              height: 630,
              alt: business.name,
            },
            ...(business.images?.[0]?.imageUrl
                ? [{
                    url: business.images[0].imageUrl,
                    width: 1200,
                    height: 630,
                    alt: business.name,
                  }]
                : [])
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: business.logo ? [business.logo] : [],
    },
    other: {
      "geo.region": `IN-${getStateCode(business.state)}`,
      "geo.placename": business.city,
      "geo.position": `${business.latitude};${business.longitude}`,
      ICBM: `${business.latitude}, ${business.longitude}`,
    },
  };
}

/* =====================================================
   STATIC PARAMS
===================================================== */

export async function generateStaticParams() {
    // Only pre-render the top 10 businesses to speed up dev/build
    const businesses = await prisma.business.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null
      },
      select: { slug: true },
      take: 10, // Reduced from 200 to 10 for Dev Performance
      orderBy: [
        { averageRating: "desc" },
        { totalReviews: "desc" }
      ],
    });

  return businesses.map((b) => ({ slug: b.slug }));
}

/* =====================================================
   DATA FETCHING (SPLIT FOR PERFORMANCE)
===================================================== */

// 1. Lightweight Metadata Fetcher (For fast TTFB)
const fetchBusinessMetadata = cache(async (slug: string) => {
  try {
    return await prisma.business.findUnique({
      where: { slug, deletedAt: null },
      include: {
        images: { where: { deletedAt: null, isApproved: true }, take: 1 },
        categories: { include: { category: true } },
      },
    });
  } catch (error) {
    console.error("Fetch Business Metadata Error:", error);
    return null;
  }
});

// 2. Full Consolidated fetcher (Deduplicated by React cache)
const fetchBusinessData = cache(async (slug: string): Promise<BusinessDetail | null> => {
  try {
    const business = await prisma.business.findUnique({
      where: { slug, deletedAt: null },
      include: {
        // Optimized: Reduced limits for initial page load
        images: { where: { deletedAt: null, isApproved: true }, take: 4 }, // Carousel usually needs just a few or loads more
        documents: { where: { status: "VERIFIED" }, take: 1 }, // Just need existence check mostly
        categories: { include: { category: true } },
        amenities: { include: { amenity: true } },
        serviceAreas: { where: { isActive: true }, take: 3 }, // reduced
        serviceArea: { where: { isActive: true }, take: 3 }, // reduced
        staff: {
          where: { deletedAt: null, isActive: true },
          take: 4, // Top staff only
          include: {
            workingHours: {
              orderBy: { dayOfWeek: "asc" },
            },
          },
        },
        hours: { orderBy: { dayOfWeek: "asc" } },
        menuItems: { where: { deletedAt: null }, take: 50 }, // Needed for BookingWizard selection
        reviews: {
          where: {
            deletedAt: null,
            status: "APPROVED",
            isPublished: true,
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            photos: { where: { deletedAt: null, isApproved: true }, take: 1 } // Just 1 thumbnail per review
          }
        },
        photos: {
          where: { deletedAt: null, isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 8 // Reduced from 20
        },
        chain: true,
        _count: { select: { reviews: true, photos: true, menuItems: true, staff: true } },
      },
    });

    if (!business || !isValidBusiness(business as BusinessDetail)) {
      return null;
    }

    return business as BusinessDetail;
  } catch (error) {
    console.error("Fetch Business Data Error:", error);
    return null;
  }
});

async function fetchRelatedBusinesses(business: BusinessDetail) {
  try {
    const categoryIds = business.categories.map((c) => c.categoryId);

    return await prisma.business.findMany({
      where: {
        AND: [
          { id: { not: business.id } },
          { status: "ACTIVE" },
          { deletedAt: null },
          {
            OR: [
              { city: business.city },
              {
                categories: {
                  some: {
                    categoryId: { in: categoryIds },
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        city: true,
        area: true,
        averageRating: true,
        totalReviews: true,
        categories: {
          take: 1,
          include: { category: true },
        },
      },
      take: 6,
      orderBy: [{ averageRating: "desc" }, { totalReviews: "desc" }],
    });
  } catch (error) {
    console.error("Failed to fetch related businesses:", error);
    return [];
  }
}

/* =====================================================
   PAGE
===================================================== */

export default async function BusinessDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Note: We intentionally do NOT await the heavy data fetch here.
  // We let the Suspense boundary handle the loading state while the data streams in.

  return (
    <Suspense fallback={<BusinessPageSkeleton />}>
      <BusinessPageContent slug={slug} />
    </Suspense>
  );
}

async function BusinessPageContent({ slug }: { slug: string }) {
  const business = await fetchBusinessData(slug);

  if (!business) notFound();

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://chwk.vercel.app";

  const schemas = generateAllSchemas(
    business,
    business.hours,
    baseUrl
  );

  return (
    <>
      {/* JSON-LD */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}

      {/* SERVER-RENDERED SEO CONTENT */}
      <section className="sr-only">
        <h1>
          {business.categories?.[0]?.category?.name} in{" "}
          {business.area}, {business.city}
        </h1>
        <p>
          {business.name} is a trusted service provider offering{" "}
          {business.categories?.[0]?.category?.name} in{" "}
          {business.area}, {business.city}, {business.state}. Rated{" "}
          {business.averageRating} stars by{" "}
          {business.totalReviews}+ customers.
        </p>
      </section>

      <Suspense fallback={<BusinessPageSkeleton />}>
        <BusinessPageClient
          business={business}
          relatedBusinessesPromise={fetchRelatedBusinesses(business)}
        />
      </Suspense>
    </>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function getStateCode(state: string): string {
  const map: Record<string, string> = {
    "Uttar Pradesh": "UP",
    Delhi: "DL",
    Maharashtra: "MH",
    Karnataka: "KA",
    TamilNadu: "TN",
    Gujarat: "GJ",
    Rajasthan: "RJ",
    Punjab: "PB",
    Haryana: "HR",
    Bihar: "BR",
    WestBengal: "WB",
  };

  return map[state] || "IN";
}
