export function StructuredData() {
  const baseUrl = "https://chwk.vercel.app";

  // 1. Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "CHWK",
    legalName: "CHWK India Private Limited",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "India's most trusted local business discovery platform connecting customers with verified local businesses and services",
    foundingDate: "2024",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-123-456-7890",
        contactType: "Customer Support",
        email: "support@chwk.com",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+91-123-456-7891",
        contactType: "Business Inquiries",
        email: "business@chwk.com",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.facebook.com/chwk",
      "https://twitter.com/chwk_india",
      "https://www.instagram.com/chwk_india",
      "https://www.linkedin.com/company/chwk",
      "https://www.youtube.com/@chwk",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "850000",
      bestRating: "5",
      worstRating: "1",
    },
  };

  // 2. WebSite Schema with SearchAction
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: "CHWK",
    alternateName: "CHWK India",
    url: baseUrl,
    description:
      "Find the best local businesses and services in India. Read reviews, compare ratings, and connect with verified businesses.",
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}&location={location}`,
      },
      "query-input": [
        {
          "@type": "PropertyValueSpecification",
          valueName: "search_term_string",
          valueRequired: true,
        },
        {
          "@type": "PropertyValueSpecification",
          valueName: "location",
          valueRequired: false,
        },
      ],
    },
    inLanguage: "en-IN",
  };

  // 3. WebApplication Schema
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${baseUrl}/#webapp`,
    name: "CHWK",
    url: baseUrl,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Local Business Directory",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    description:
      "Discover local businesses and services across India with CHWK. Connect with 61,000+ verified businesses in 25+ cities.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2025-12-31",
    },
    featureList: [
      "Search verified local businesses",
      "Read authentic customer reviews",
      "Compare ratings and services",
      "Direct business contact",
      "Location-based discovery",
      "Business profile management",
      "Review management tools",
      "Analytics dashboard",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "850000",
      bestRating: "5",
      worstRating: "1",
    },
    creator: {
      "@id": `${baseUrl}/#organization`,
    },
  };

  // 4. Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${baseUrl}/#service`,
    name: "Local Business Discovery & Connection Service",
    provider: {
      "@id": `${baseUrl}/#organization`,
    },
    serviceType: "Business Directory & Local Search",
    description:
      "Connect customers with verified local businesses across India through our comprehensive directory platform",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Business Categories",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Restaurants & Dining",
            description: "Find local restaurants, cafes, and food services",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Salons & Beauty Services",
            description: "Discover salons, spas, and beauty services",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Healthcare Services",
            description:
              "Connect with clinics, hospitals, and healthcare providers",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Home Services",
            description:
              "Find plumbers, electricians, and home repair services",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Professional Services",
            description:
              "Discover IT, legal, and business professional services",
          },
        },
      ],
    },
    audience: {
      "@type": "Audience",
      audienceType: "Consumers and Business Owners",
      geographicArea: {
        "@type": "AdministrativeArea",
        name: "India",
      },
    },
  };

  // 5. BreadcrumbList for homepage
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
    ],
  };

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      {/* WebSite Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />

      {/* WebApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />

      {/* Service Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  );
}
