
import { MetadataRoute } from "next";
import { SEO_CONFIG } from "@/lib/(landing_page)/constants";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SEO_CONFIG.url.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
