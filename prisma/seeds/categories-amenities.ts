// prisma/seeds/categories-amenities.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCategoriesAndAmenities() {
  console.log("🌱 Seeding Categories and Amenities...");

  // Categories
  const categories = [
    {
      name: "Restaurant",
      slug: "restaurant",
      description: "Dining establishments serving food and beverages",
      icon: "🍽️",
      isFeatured: true,
      displayOrder: 1,
    },
    {
      name: "Cafe",
      slug: "cafe",
      description: "Coffee shops and casual cafes",
      icon: "☕",
      isFeatured: true,
      displayOrder: 2,
    },
    {
      name: "Bar & Pub",
      slug: "bar-pub",
      description: "Bars, pubs, and lounges",
      icon: "🍺",
      isFeatured: true,
      displayOrder: 3,
    },
    {
      name: "Fast Food",
      slug: "fast-food",
      description: "Quick service restaurants",
      icon: "🍔",
      isFeatured: false,
      displayOrder: 4,
    },
    {
      name: "Bakery",
      slug: "bakery",
      description: "Bakeries and dessert shops",
      icon: "🥐",
      isFeatured: false,
      displayOrder: 5,
    },
    {
      name: "Food Truck",
      slug: "food-truck",
      description: "Mobile food vendors",
      icon: "🚚",
      isFeatured: false,
      displayOrder: 6,
    },
    {
      name: "Hotel",
      slug: "hotel",
      description: "Hotels and accommodations",
      icon: "🏨",
      isFeatured: true,
      displayOrder: 7,
    },
    {
      name: "Gym & Fitness",
      slug: "gym-fitness",
      description: "Gyms, fitness centers, and sports facilities",
      icon: "💪",
      isFeatured: true,
      displayOrder: 8,
    },
    {
      name: "Spa & Salon",
      slug: "spa-salon",
      description: "Beauty and wellness centers",
      icon: "💆",
      isFeatured: false,
      displayOrder: 9,
    },
    {
      name: "Shopping",
      slug: "shopping",
      description: "Retail stores and shopping centers",
      icon: "🛍️",
      isFeatured: false,
      displayOrder: 10,
    },
  ];

  // Amenities
  const amenities = [
    // Payment
    {
      name: "UPI Payment",
      slug: "upi-payment",
      icon: "📱",
      category: "Payment",
      isPopular: true,
      displayOrder: 1,
    },
    {
      name: "Card Payment",
      slug: "card-payment",
      icon: "💳",
      category: "Payment",
      isPopular: true,
      displayOrder: 2,
    },
    {
      name: "Cash Only",
      slug: "cash-only",
      icon: "💵",
      category: "Payment",
      isPopular: false,
      displayOrder: 3,
    },
    {
      name: "Online Payment",
      slug: "online-payment",
      icon: "💻",
      category: "Payment",
      isPopular: true,
      displayOrder: 4,
    },

    // Facilities
    {
      name: "WiFi",
      slug: "wifi",
      icon: "📶",
      category: "Facilities",
      isPopular: true,
      displayOrder: 1,
    },
    {
      name: "Parking",
      slug: "parking",
      icon: "🅿️",
      category: "Facilities",
      isPopular: true,
      displayOrder: 2,
    },
    {
      name: "Air Conditioning",
      slug: "ac",
      icon: "❄️",
      category: "Facilities",
      isPopular: true,
      displayOrder: 3,
    },
    {
      name: "Wheelchair Accessible",
      slug: "wheelchair-accessible",
      icon: "♿",
      category: "Facilities",
      isPopular: false,
      displayOrder: 4,
    },
    {
      name: "Pet Friendly",
      slug: "pet-friendly",
      icon: "🐕",
      category: "Facilities",
      isPopular: false,
      displayOrder: 5,
    },
    {
      name: "Outdoor Seating",
      slug: "outdoor-seating",
      icon: "🌳",
      category: "Facilities",
      isPopular: false,
      displayOrder: 6,
    },
    {
      name: "Private Rooms",
      slug: "private-rooms",
      icon: "🚪",
      category: "Facilities",
      isPopular: false,
      displayOrder: 7,
    },
    {
      name: "Smoking Area",
      slug: "smoking-area",
      icon: "🚬",
      category: "Facilities",
      isPopular: false,
      displayOrder: 8,
    },

    // Dining
    {
      name: "Dine-in",
      slug: "dine-in",
      icon: "🍽️",
      category: "Dining",
      isPopular: true,
      displayOrder: 1,
    },
    {
      name: "Takeaway",
      slug: "takeaway",
      icon: "🥡",
      category: "Dining",
      isPopular: true,
      displayOrder: 2,
    },
    {
      name: "Home Delivery",
      slug: "home-delivery",
      icon: "🛵",
      category: "Dining",
      isPopular: true,
      displayOrder: 3,
    },
    {
      name: "Table Booking",
      slug: "table-booking",
      icon: "📅",
      category: "Dining",
      isPopular: false,
      displayOrder: 4,
    },
    {
      name: "Buffet",
      slug: "buffet",
      icon: "🍱",
      category: "Dining",
      isPopular: false,
      displayOrder: 5,
    },

    // Services
    {
      name: "Live Music",
      slug: "live-music",
      icon: "🎵",
      category: "Services",
      isPopular: false,
      displayOrder: 1,
    },
    {
      name: "Live Sports Screening",
      slug: "live-sports",
      icon: "📺",
      category: "Services",
      isPopular: false,
      displayOrder: 2,
    },
    {
      name: "Catering Services",
      slug: "catering",
      icon: "🍴",
      category: "Services",
      isPopular: false,
      displayOrder: 3,
    },
    {
      name: "Event Space",
      slug: "event-space",
      icon: "🎉",
      category: "Services",
      isPopular: false,
      displayOrder: 4,
    },

    // Safety
    {
      name: "Sanitization",
      slug: "sanitization",
      icon: "🧼",
      category: "Safety",
      isPopular: true,
      displayOrder: 1,
    },
    {
      name: "Temperature Check",
      slug: "temperature-check",
      icon: "🌡️",
      category: "Safety",
      isPopular: false,
      displayOrder: 2,
    },
    {
      name: "Contactless Service",
      slug: "contactless-service",
      icon: "🤝",
      category: "Safety",
      isPopular: true,
      displayOrder: 3,
    },
    {
      name: "CCTV Surveillance",
      slug: "cctv",
      icon: "📹",
      category: "Safety",
      isPopular: false,
      displayOrder: 4,
    },

    // India Specific
    {
      name: "Veg Only",
      slug: "veg-only",
      icon: "🥗",
      category: "Food Type",
      isPopular: false,
      displayOrder: 1,
    },
    {
      name: "Non-Veg Available",
      slug: "non-veg",
      icon: "🍖",
      category: "Food Type",
      isPopular: false,
      displayOrder: 2,
    },
    {
      name: "Jain Food",
      slug: "jain-food",
      icon: "🌿",
      category: "Food Type",
      isPopular: false,
      displayOrder: 3,
    },
    {
      name: "Halal Certified",
      slug: "halal",
      icon: "☪️",
      category: "Food Type",
      isPopular: false,
      displayOrder: 4,
    },
    {
      name: "Swiggy Partner",
      slug: "swiggy",
      icon: "🛵",
      category: "Delivery Partners",
      isPopular: true,
      displayOrder: 1,
    },
    {
      name: "Zomato Partner",
      slug: "zomato",
      icon: "🍔",
      category: "Delivery Partners",
      isPopular: true,
      displayOrder: 2,
    },
  ];

  // Create categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log(`✅ Created ${categories.length} categories`);

  // Create amenities - use name for upsert since it has unique constraint
  for (const amenity of amenities) {
    await prisma.amenity.upsert({
      where: { name: amenity.name }, // ✅ Changed from slug to name
      update: amenity,
      create: amenity,
    });
  }

  console.log(`✅ Created ${amenities.length} amenities`);
  console.log("🎉 Categories and Amenities seeded successfully!");
}

seedCategoriesAndAmenities()
  .catch((e) => {
    console.error("❌ Error seeding categories and amenities:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
