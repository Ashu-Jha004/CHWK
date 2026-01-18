import { MetadataRoute } from "next";
import { TIER_1_CITIES, CATEGORIES } from "@/lib/(landing_page)/constants";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://chwk.vercel.app";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/business/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${baseUrl}/categories/${category.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // City pages
  const cityPages: MetadataRoute.Sitemap = TIER_1_CITIES.map((city) => ({
    url: `${baseUrl}/city/${city.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Dynamic business pages (fetch from database)
  let businessPages: MetadataRoute.Sitemap = [];
  try {
    const businesses = await prisma.business.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
         // We remove the strict 'isVerified' filter for sitemap to ensure ALL active businesses are crawled
         // as long as they are not deleted or banned.
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        averageRating: "desc", // Prioritize high-rated businesses
      },
      take: 20000, // Increased limit
    });

    businessPages = businesses.map((business) => ({
      url: `${baseUrl}/business_service/${business.slug}`.replace(/&/g, "&amp;"),
      lastModified: business.updatedAt,
      changeFrequency: "daily", // Business info can change frequently
      priority: 0.8, // High priority for business pages
    }));
  } catch (error) {
    console.error("Error fetching businesses for sitemap:", error);
    // Continue with empty business pages if database is unavailable
  }

  // Search result pages for popular combinations (helps with SEO)
  const popularSearches: MetadataRoute.Sitemap = [
    { query: "restaurants", city: "mumbai" },
    { query: "plumbers", city: "delhi" },
    { query: "electricians", city: "bangalore" },
    { query: "cafes", city: "pune" },
    { query: "doctors", city: "hyderabad" },
  ].map(({ query, city }) => ({
    url: `${baseUrl}/search?q=${query}&city=${city}`.replace(/&/g, "&amp;"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...cityPages,
    ...businessPages,
    ...popularSearches,
  ];
}
