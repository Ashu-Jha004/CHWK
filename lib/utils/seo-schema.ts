// lib/utils/seo-schema.ts

import { BusinessDetail } from "@/types/customer/business/business-detail";
import {
  formatFullAddress,
  formatPhoneNumber,
  generatePageTitle,
  generatePageDescription,
  calculateBusinessStats,
  isBusinessOpenNow,
} from "./business-detail-utils";
import { BusinessHours } from "@prisma/client";

// ===========================
// JSON-LD Schema Types
// ===========================

interface ImageObject {
  "@type": "ImageObject";
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

interface PostalAddress {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

interface GeoCoordinates {
  "@type": "GeoCoordinates";
  latitude: number;
  longitude: number;
}

interface OpeningHoursSpecification {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

interface AggregateRating {
  "@type": "AggregateRating";
  ratingValue: number;
  bestRating: number;
  worstRating: number;
  ratingCount: number;
}

interface Review {
  "@type": "Review";
  author: {
    "@type": "Person";
    name: string;
  };
  datePublished: string;
  reviewBody: string;
  reviewRating: {
    "@type": "Rating";
    ratingValue: number;
    bestRating: number;
  };
}

interface LocalBusiness {
  "@context": "https://schema.org";
  "@type": string;
  "@id": string;
  name: string;
  image: string | ImageObject[];
  description: string;
  url: string;
  telephone: string;
  email?: string;
  address: PostalAddress;
  geo: GeoCoordinates;
  openingHoursSpecification?: OpeningHoursSpecification[];
  priceRange?: string;
  aggregateRating?: AggregateRating;
  review?: Review[];
  servesCuisine?: string[];
  paymentAccepted?: string[];
  currenciesAccepted?: string;
  areaServed?: string[];
  hasMap?: string;
  logo?: string;
  slogan?: string;
  FoundingDate?: string;
  knowsAbout?: string[];
  keywords?: string;
  sameAs?: string[];
}

interface BreadcrumbList {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

interface FAQPage {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

// ===========================
// Schema Generator Functions
// ===========================

/**
 * Generate LocalBusiness Schema (Primary)
 */
export const generateLocalBusinessSchema = (
  business: BusinessDetail,
  hours: BusinessHours[],
  baseUrl: string
): LocalBusiness => {
  try {
    const stats = calculateBusinessStats(business);
    const businessUrl = `${baseUrl}/business_service/${business.slug}`;

    // Determine business type (more specific than just "LocalBusiness")
    const businessType = determineBusinessType(business);

    // Generate image objects
    const images: ImageObject[] = business.images
      .slice(0, 5)
      .map((img) => ({
        "@type": "ImageObject",
        url: img.imageUrl,
        width: img.width || undefined,
        height: img.height || undefined,
        caption: img.caption || undefined,
      }));

    // Generate opening hours
    const openingHours = generateOpeningHoursSchema(hours, business.is24x7);

    // Generate reviews (top 5)
    const reviewSchemas = business.reviews
      .filter((r) => r.isPublished && r.status === "APPROVED")
      .slice(0, 5)
      .map((review) => ({
        "@type": "Review" as const,
        author: {
          "@type": "Person" as const,
          name: `${review.user.firstName || ""} ${review.user.lastName || ""}`.trim() || "Anonymous",
        },
        datePublished: review.createdAt.toISOString(),
        reviewBody: review.content || "",
        reviewRating: {
          "@type": "Rating" as const,
          ratingValue: review.rating,
          bestRating: 5,
        },
      }));

    // Payment methods
    const paymentMethods: string[] = [];
    if (business.acceptsCash) paymentMethods.push("Cash");
    if (business.acceptsUPI) paymentMethods.push("UPI");
    if (business.acceptsCards) paymentMethods.push("Credit Card", "Debit Card");
    if (business.acceptsNetBanking) paymentMethods.push("Net Banking");
    if (business.acceptsWallets) paymentMethods.push("Digital Wallet");

    // Service areas
    const serviceAreas = business.serviceAreas.map(
      (area) => area.city || area.areaName || ""
    ).filter(Boolean);

    // Social media links (if available from website)
    const sameAs: string[] = [];
    if (business.website) sameAs.push(business.website);

    const schema: LocalBusiness = {
      "@context": "https://schema.org",
      "@type": businessType,
      "@id": businessUrl,
      name: business.name,
      image: images.length > 0 ? images : business.logo || "",
      description: business.description || business.shortDescription || "",
      url: businessUrl,
      telephone: business.phone,
      email: business.email || undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: [business.addressLine1, business.addressLine2]
          .filter(Boolean)
          .join(", "),
        addressLocality: business.city,
        addressRegion: business.state,
        postalCode: business.pincode,
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: business.latitude,
        longitude: business.longitude,
      },
      openingHoursSpecification: openingHours.length > 0 ? openingHours : undefined,
      priceRange: business.priceRange ? getPriceRangeSymbol(business.priceRange) : undefined,
      aggregateRating:
        stats.totalReviews > 0
          ? {
              "@type": "AggregateRating",
              ratingValue: stats.averageRating,
              bestRating: 5,
              worstRating: 1,
              ratingCount: stats.totalReviews,
            }
          : undefined,
      review: reviewSchemas.length > 0 ? reviewSchemas : undefined,
      paymentAccepted: paymentMethods.length > 0 ? paymentMethods : undefined,
      currenciesAccepted: "INR",
      areaServed: serviceAreas.length > 0 ? serviceAreas : undefined,
      hasMap: `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`,
      logo: business.logo || undefined,
      keywords: business.metadataKeywords.join(", ") || undefined,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
    };

    return schema;
  } catch (error) {
    console.error("[generateLocalBusinessSchema] Error:", error);
    throw new Error("Failed to generate LocalBusiness schema");
  }
};

/**
 * Determine specific business type for schema.org
 */
const determineBusinessType = (business: BusinessDetail): string => {
  try {
    const categories = business.categories.map((c) => c.category.name.toLowerCase());

    // Restaurant & Food
    if (
      categories.some((c) =>
        ["restaurant", "cafe", "food", "dining", "bakery"].includes(c)
      )
    ) {
      return "Restaurant";
    }

    // Health & Medical
    if (
      categories.some((c) =>
        ["hospital", "clinic", "doctor", "dental", "pharmacy"].includes(c)
      )
    ) {
      return "MedicalBusiness";
    }

    // Automotive
    if (
      categories.some((c) => ["garage", "auto", "car", "mechanic"].includes(c))
    ) {
      return "AutoRepair";
    }

    // Lodging
    if (categories.some((c) => ["hotel", "lodge", "resort"].includes(c))) {
      return "LodgingBusiness";
    }

    // Store/Retail
    if (
      categories.some((c) =>
        ["store", "shop", "retail", "boutique", "mall"].includes(c)
      )
    ) {
      return "Store";
    }

    // Professional Services
    if (
      categories.some((c) =>
        ["lawyer", "attorney", "accountant", "consultant"].includes(c)
      )
    ) {
      return "ProfessionalService";
    }

    // Home Services
    if (
      categories.some((c) =>
        ["plumber", "electrician", "carpenter", "cleaning"].includes(c)
      )
    ) {
      return "HomeAndConstructionBusiness";
    }

    // Entertainment
    if (
      categories.some((c) =>
        ["entertainment", "theater", "cinema", "event"].includes(c)
      )
    ) {
      return "EntertainmentBusiness";
    }

    // Sports & Fitness
    if (categories.some((c) => ["gym", "fitness", "yoga", "sports"].includes(c))) {
      return "SportsActivityLocation";
    }

    // Salon/Spa
    if (categories.some((c) => ["salon", "spa", "beauty", "parlour"].includes(c))) {
      return "BeautySalon";
    }

    return "LocalBusiness";
  } catch (error) {
    console.error("[determineBusinessType] Error:", error);
    return "LocalBusiness";
  }
};

/**
 * Generate opening hours schema
 */
const generateOpeningHoursSchema = (
  hours: BusinessHours[],
  is24x7: boolean
): OpeningHoursSpecification[] => {
  try {
    if (is24x7) {
      return [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "00:00",
          closes: "23:59",
        },
      ];
    }

    const dayMap: Record<string, string> = {
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
      SATURDAY: "Saturday",
      SUNDAY: "Sunday",
    };

    return hours
      .filter((h) => !h.isClosed && !h.isOverride)
      .map((h) => ({
        "@type": "OpeningHoursSpecification" as const,
        dayOfWeek: dayMap[h.dayOfWeek],
        opens: h.openTime,
        closes: h.closeTime,
      }));
  } catch (error) {
    console.error("[generateOpeningHoursSchema] Error:", error);
    return [];
  }
};

/**
 * Get price range symbol
 */
const getPriceRangeSymbol = (priceRange: string): string => {
  const symbols: Record<string, string> = {
    BUDGET: "₹",
    MODERATE: "₹₹",
    EXPENSIVE: "₹₹₹",
    LUXURY: "₹₹₹₹",
  };
  return symbols[priceRange] || "₹₹";
};

/**
 * Generate Breadcrumb Schema
 */
export const generateBreadcrumbSchema = (
  business: BusinessDetail,
  baseUrl: string
): BreadcrumbList => {
  try {
    const primaryCategory = business.categories[0]?.category;

    const items = [
      {
        "@type": "ListItem" as const,
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem" as const,
        position: 2,
        name: business.city,
        item: `${baseUrl}/city/${business.city.toLowerCase()}`,
      },
    ];

    if (primaryCategory) {
      items.push({
        "@type": "ListItem" as const,
        position: 3,
        name: primaryCategory.name,
        item: `${baseUrl}/category/${primaryCategory.slug}`,
      });
    }

    items.push({
      "@type": "ListItem" as const,
      position: items.length + 1,
      name: business.name,
      item: `${baseUrl}/business_service/${business.slug}`,
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    };
  } catch (error) {
    console.error("[generateBreadcrumbSchema] Error:", error);
    throw new Error("Failed to generate Breadcrumb schema");
  }
};

/**
 * Generate FAQ Schema (for common questions)
 */
export const generateFAQSchema = (
  business: BusinessDetail,
  hours: BusinessHours[]
): FAQPage | null => {
  try {
    const isOpen = isBusinessOpenNow(business, hours);
    const faqs = [];

    // Common FAQ: Is business open now?
    if (!business.is24x7) {
      faqs.push({
        "@type": "Question" as const,
        name: `Is ${business.name} open now?`,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: isOpen
            ? `Yes, ${business.name} is currently open.`
            : `No, ${business.name} is currently closed.`,
        },
      });
    }

    // FAQ: Address
    faqs.push({
      "@type": "Question" as const,
      name: `Where is ${business.name} located?`,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: `${business.name} is located at ${formatFullAddress(business)}.`,
      },
    });

    // FAQ: Contact
    faqs.push({
      "@type": "Question" as const,
      name: `What is the contact number of ${business.name}?`,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: `You can contact ${business.name} at ${formatPhoneNumber(business.phone)}.`,
      },
    });

    // FAQ: Payment methods
    const paymentMethods: string[] = [];
    if (business.acceptsCash) paymentMethods.push("Cash");
    if (business.acceptsUPI) paymentMethods.push("UPI");
    if (business.acceptsCards) paymentMethods.push("Cards");

    if (paymentMethods.length > 0) {
      faqs.push({
        "@type": "Question" as const,
        name: `What payment methods does ${business.name} accept?`,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: `${business.name} accepts ${paymentMethods.join(", ")}.`,
        },
      });
    }

    if (faqs.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs,
    };
  } catch (error) {
    console.error("[generateFAQSchema] Error:", error);
    return null;
  }
};

/**
 * Generate all schemas combined
 */
export const generateAllSchemas = (
  business: BusinessDetail,
  hours: BusinessHours[],
  baseUrl: string
): Record<string, any>[] => {
  try {
    const schemas: Record<string, any>[] = [];

    // LocalBusiness schema (primary)
    schemas.push(generateLocalBusinessSchema(business, hours, baseUrl));

    // Breadcrumb schema
    schemas.push(generateBreadcrumbSchema(business, baseUrl));

    // FAQ schema (if applicable)
    const faqSchema = generateFAQSchema(business, hours);
    if (faqSchema) {
      schemas.push(faqSchema);
    }

    return schemas;
  } catch (error) {
    console.error("[generateAllSchemas] Error:", error);
    return [];
  }
};

// ===========================
// Meta Tags Generator
// ===========================

export interface MetaTags {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

/**
 * Generate complete meta tags for SEO
 */
export const generateMetaTags = (
  business: BusinessDetail,
  baseUrl: string
): MetaTags => {
  try {
    const businessUrl = `${baseUrl}/business_service/${business.slug}`;
    const title = generatePageTitle(business);
    const description = generatePageDescription(business);
    const keywords = business.metadataKeywords.join(", ") ||
      `${business.name}, ${business.city}, ${business.categories.map(c => c.category.name).join(", ")}`;
    const ogImage = business.coverImage || business.logo || business.images[0]?.imageUrl || "";

    return {
      title,
      description,
      keywords,
      canonical: businessUrl,
      robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      ogTitle: title,
      ogDescription: description,
      ogImage,
      ogUrl: businessUrl,
      ogType: "business.business",
      twitterCard: "summary_large_image",
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: ogImage,
    };
  } catch (error) {
    console.error("[generateMetaTags] Error:", error);
    return {
      title: business.name,
      description: business.shortDescription || "",
      keywords: "",
      canonical: `${baseUrl}/business_service/${business.slug}`,
      robots: "index, follow",
      ogTitle: business.name,
      ogDescription: business.shortDescription || "",
      ogImage: "",
      ogUrl: `${baseUrl}/business_service/${business.slug}`,
      ogType: "website",
      twitterCard: "summary",
      twitterTitle: business.name,
      twitterDescription: business.shortDescription || "",
      twitterImage: "",
    };
  }
};
