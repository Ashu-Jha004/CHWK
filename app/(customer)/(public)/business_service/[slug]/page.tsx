// app/business_service/[slug]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BusinessDetail } from "@/types/customer/business/business-detail";
import { generateMetaTags, generateAllSchemas } from "@/lib/utils/seo-schema";
import { isValidBusiness } from "@/lib/utils/business-detail-utils";
import { BusinessPageClient } from "./_components/business-page-client";
import { Suspense } from "react";
import { BusinessPageSkeleton } from "./_components/business-page-skeleton";

// ===========================
// Page Configuration
// ===========================

// Enable ISR with 1 hour revalidation
export const revalidate = 3600; // 1 hour

// Enable dynamic params
export const dynamicParams = true;

// ===========================
// Metadata Generation (SEO)
// ===========================

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const business = await fetchBusinessBySlug(slug);

    if (!business) {
      return {
        title: "Business Not Found",
        description: "The business you are looking for does not exist.",
        robots: "noindex, nofollow",
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://chwk.vercel.app/";
    const metaTags = generateMetaTags(business, baseUrl);

    return {
      title: metaTags.title,
      description: metaTags.description,
      keywords: metaTags.keywords,
      authors: [{ name: business.name }],
      creator: business.name,
      publisher: business.name,
      robots: metaTags.robots,
      alternates: {
        canonical: metaTags.canonical,
      },
      openGraph: {
        type: "website",
        url: metaTags.ogUrl,
        title: metaTags.ogTitle,
        description: metaTags.ogDescription,
        siteName: "CHWK", // TODO : Replace with your site name
        images: metaTags.ogImage
          ? [
              {
                url: metaTags.ogImage,
                width: 1200,
                height: 630,
                alt: business.name,
              },
            ]
          : [],
        locale: "en_IN",
      },
      twitter: {
        card: "summary_large_image",
        title: metaTags.twitterTitle,
        description: metaTags.twitterDescription,
        images: metaTags.twitterImage ? [metaTags.twitterImage] : [],
      },
      other: {
        "geo.region": `IN-${getStateCode(business.state)}`,
        "geo.placename": business.city,
        "geo.position": `${business.latitude};${business.longitude}`,
        "ICBM": `${business.latitude}, ${business.longitude}`,
      },
    };
  } catch (error) {
    console.error("[generateMetadata] Error:", error);
    return {
      title: "Error Loading Business",
      description: "An error occurred while loading the business.",
      robots: "noindex, nofollow",
    };
  }
}

// ===========================
// Static Params Generation
// ===========================

export async function generateStaticParams() {
  try {
    // Generate static pages for top businesses
    // Limit to prevent excessive build times
    const businesses = await prisma.business.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        slug: true,
      },
      take: 1000, // Generate first 1000 businesses statically
      orderBy: [
        { averageRating: "desc" },
        { totalReviews: "desc" },
      ],
    });

    return businesses.map((business) => ({
      slug: business.slug,
    }));
  } catch (error) {
    console.error("[generateStaticParams] Error:", error);
    return [];
  }
}

// ===========================
// Data Fetching Functions
// ===========================

/**
 * Fetch complete business data with all relations
 */
async function fetchBusinessBySlug(slug: string): Promise<BusinessDetail | null> {
  try {
    console.log(`[fetchBusinessBySlug] Fetching business: ${slug}`);

    const business = await prisma.business.findUnique({
      where: {
        slug: slug,
        deletedAt: null,
      },
      include: {
        // Images
        images: {
          where: {
            deletedAt: null,
            isApproved: true,
          },
          orderBy: [
            { isFeatured: "desc" },
            { displayOrder: "asc" },
          ],
          take: 50, // Limit images for performance
        },

        // Documents
        documents: {
          where: {
            status: "VERIFIED",
          },
          orderBy: {
            createdAt: "desc",
          },
        },

        // Categories with category details
        categories: {
          include: {
            category: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },

        // Amenities with amenity details
        amenities: {
          include: {
            amenity: true,
          },
        },

        // Service Areas
        serviceAreas: {
          where: {
            isActive: true,
          },
          orderBy: {
            city: "asc",
          },
        },

        // Business Service Areas (different from ServiceArea model)
        serviceArea: {
          where: {
            isActive: true,
          },
          orderBy: {
            city: "asc",
          },
        },

        // Staff
        staff: {
          where: {
            deletedAt: null,
            isActive: true,
          },
          take: 20,
        },

        // Business Hours
        hours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },

        // Menu Items (Products & Services)
        menuItems: {
          where: {
            deletedAt: null,
          },
          orderBy: [
            { isFeatured: "desc" },
            { displayOrder: "asc" },
          ],
          take: 100, // Limit for performance
        },

        // Reviews with user info and photos
        reviews: {
          where: {
            deletedAt: null,
            status: "APPROVED",
            isPublished: true,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            photos: {
              where: {
                deletedAt: null,
                isApproved: true,
              },
              take: 5,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50, // Limit reviews for initial load
        },

        // User Photos (separate from review photos)
        photos: {
          where: {
            deletedAt: null,
            isApproved: true,
            isFlagged: false,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        },

        // Chain Information
        chain: true,

        // Count relationships
        _count: {
          select: {
            reviews: {
              where: {
                deletedAt: null,
                status: "APPROVED",
              },
            },
            photos: {
              where: {
                deletedAt: null,
                isApproved: true,
              },
            },
            menuItems: {
              where: {
                deletedAt: null,
              },
            },
            staff: {
              where: {
                deletedAt: null,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!business) {
      console.log(`[fetchBusinessBySlug] Business not found: ${slug}`);
      return null;
    }

    // Validate business data
    if (!isValidBusiness(business as BusinessDetail)) {
      console.error(`[fetchBusinessBySlug] Invalid business data: ${slug}`);
      return null;
    }

    console.log(`[fetchBusinessBySlug] Successfully fetched: ${business.name}`);
    return business as BusinessDetail;
  } catch (error) {
    console.error(`[fetchBusinessBySlug] Error fetching ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch related/similar businesses for recommendations
 */
async function fetchRelatedBusinesses(
  business: BusinessDetail,
  limit: number = 6
): Promise<Partial<BusinessDetail>[]> {
  try {
    console.log(`[fetchRelatedBusinesses] Fetching related businesses for: ${business.name}`);

    // Get category IDs
    const categoryIds = business.categories.map((c) => c.categoryId);

    const relatedBusinesses = await prisma.business.findMany({
      where: {
        AND: [
          { id: { not: business.id } }, // Exclude current business
          { deletedAt: null },
          { status: "ACTIVE" },
          {
            OR: [
              // Same categories
              {
                categories: {
                  some: {
                    categoryId: { in: categoryIds },
                  },
                },
              },
              // Same city
              { city: business.city },
              // Nearby (within ~5km)
              {
                AND: [
                  { latitude: { gte: business.latitude - 0.045 } },
                  { latitude: { lte: business.latitude + 0.045 } },
                  { longitude: { gte: business.longitude - 0.045 } },
                  { longitude: { lte: business.longitude + 0.045 } },
                ],
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        logo: true,
        city: true,
        area: true,
        averageRating: true,
        totalReviews: true,
        priceRange: true,
        categories: {
          include: {
            category: true,
          },
          take: 1,
        },
      },
      orderBy: [
        { averageRating: "desc" },
        { totalReviews: "desc" },
      ],
      take: limit,
    });

    console.log(`[fetchRelatedBusinesses] Found ${relatedBusinesses.length} related businesses`);
    return relatedBusinesses as Partial<BusinessDetail>[];
  } catch (error) {
    console.error("[fetchRelatedBusinesses] Error:", error);
    return [];
  }
}

// ===========================
// Main Page Component
// ===========================

export default async function BusinessDetailPage({ params }: PageProps) {
  try {
    // Await params to get slug (Next.js 15+)
    const { slug } = await params;

    // Fetch business data
    const business = await fetchBusinessBySlug(slug);

    // Handle not found
    if (!business) {
      notFound();
    }

    // Fetch related businesses in parallel (optional, doesn't block render)
    const relatedBusinessesPromise = fetchRelatedBusinesses(business);

    // Generate JSON-LD schemas
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://chwk.vercel.app/";
    const schemas = generateAllSchemas(business, business.hours, baseUrl);

    return (
      <>
        {/* JSON-LD Schema for SEO */}
        {schemas.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        {/* Main Business Page */}
        <Suspense fallback={<BusinessPageSkeleton />}>
          <BusinessPageClient
            business={business}
            relatedBusinessesPromise={relatedBusinessesPromise}
          />
        </Suspense>
      </>
    );
  } catch (error) {
    console.error("[BusinessDetailPage] Unexpected error:", error);
    throw error; // Will be caught by error.tsx
  }
}

// ===========================
// Helper Functions
// ===========================

/**
 * Get state code for geo meta tags
 */
function getStateCode(state: string): string {
  const stateCodes: Record<string, string> = {
    "Andhra Pradesh": "AP",
    "Arunachal Pradesh": "AR",
    "Assam": "AS",
    "Bihar": "BR",
    "Chhattisgarh": "CT",
    "Goa": "GA",
    "Gujarat": "GJ",
    "Haryana": "HR",
    "Himachal Pradesh": "HP",
    "Jharkhand": "JH",
    "Karnataka": "KA",
    "Kerala": "KL",
    "Madhya Pradesh": "MP",
    "Maharashtra": "MH",
    "Manipur": "MN",
    "Meghalaya": "ML",
    "Mizoram": "MZ",
    "Nagaland": "NL",
    "Odisha": "OR",
    "Punjab": "PB",
    "Rajasthan": "RJ",
    "Sikkim": "SK",
    "Tamil Nadu": "TN",
    "Telangana": "TG",
    "Tripura": "TR",
    "Uttar Pradesh": "UP",
    "Uttarakhand": "UT",
    "West Bengal": "WB",
    "Delhi": "DL",
  };

  return stateCodes[state] || "UN";
}
