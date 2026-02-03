export function StructuredData() {
  const baseUrl = "https://chwk.vercel.app";

  // 1. Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "CHWK",
    legalName: "CHWK India Private Limited",
    alternateName: ["chwk","chock", "chowk","choque" , "choque","chowk india", "choque india", "chwk.com", "justdial","choque.in", "choque.com", "CHWK India", "chwk.in", "CHWK App"],
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    slogan: "India's #1 Local Business Discovery Platform",
    description:
      "CHWK is India's most trusted local business discovery platform connecting customers with verified local businesses and services across 25+ cities.",
    foundingDate: "2024",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-123-456-7890",
        contactType: "Customer Support",
        email: "ashujha009322@gmail.com",
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

  // 6. SiteNavigationElement (Helps with Sitelinks)
  const navigationSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "SiteNavigationElement",
        "position": 1,
        "name": "About Us",
        "description": "Learn about CHWK mission and team",
        "url": `${baseUrl}/about`
      },
      {
        "@type": "SiteNavigationElement",
        "position": 2,
        "name": "Local Search",
        "description": "Find businesses and services near you",
        "url": `${baseUrl}/search`
      },
      {
        "@type": "SiteNavigationElement",
        "position": 3,
        "name": "Categories",
        "description": "Browse businesses by category",
        "url": `${baseUrl}/categories`
      },
      {
        "@type": "SiteNavigationElement",
        "position": 4,
        "name": "Sign up as Business",
        "description": "Register your business on CHWK",
        "url": `${baseUrl}/business/signup`
      }
    ]
  };

  // 7. FAQPage Schema (for rich snippets)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is CHWK?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CHWK is India's leading local business discovery platform that helps customers find and connect with verified local businesses across 25+ cities. From restaurants and salons to healthcare and home services, CHWK makes it easy to discover trusted local services."
        }
      },
      {
        "@type": "Question",
        "name": "How do I list my business on CHWK?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can list your business on CHWK by visiting chwk.vercel.app/business/signup and completing the simple 5-minute onboarding process. Your business will be verified and published within 24 hours."
        }
      },
      {
        "@type": "Question",
        "name": "Is CHWK free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, CHWK is completely free for customers to search, discover, and connect with local businesses. Business owners can also list their business for free with basic features."
        }
      },
      {
        "@type": "Question",
        "name": "How does CHWK verify businesses?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CHWK uses a multi-step verification process including GST/Business ID validation, phone verification, and manual community checks to ensure all listed businesses are authentic and trustworthy."
        }
      },
      {
        "@type": "Question",
        "name": "What cities does CHWK cover?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CHWK is available in 25+ cities across India including Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, and Ahmedabad, with more cities being added regularly."
        }
      }
    ]
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

      {/* Site Navigation Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(navigationSchema),
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
}

