import { MetadataRoute } from "next";
import { TIER_1_CITIES, CATEGORIES } from "@/lib/(landing_page)/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://chwk.vercel.app";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/business/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
  ];

  // Category pages
  const categoryPages = CATEGORIES.map((category) => ({
    url: `${baseUrl}/categories/${category.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // City pages
  const cityPages = TIER_1_CITIES.map((city) => ({
    url: `${baseUrl}/city/${city.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...cityPages];
}
