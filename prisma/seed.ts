// prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await seedCategories();
  await seedAmenities();

  console.log("✅ Seeding complete!");
}

async function seedCategories() {
  console.log("📂 Seeding categories...");

  const foodDining = await prisma.category.upsert({
    where: { slug: "food-dining" },
    update: {},
    create: {
      name: "Food & Dining",
      slug: "food-dining",
      description: "Restaurants, cafes, bakeries, and food services",
      icon: "🍽️",
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
      searchKeywords: ["food", "restaurant", "cafe", "dining", "eat"],
    },
  });

  const restaurants = await prisma.category.upsert({
    where: { slug: "restaurants" },
    update: {},
    create: {
      name: "Restaurants",
      slug: "restaurants",
      description: "All types of restaurants",
      icon: "🍴",
      parentId: foodDining.id,
      displayOrder: 1,
      isActive: true,
      searchKeywords: ["restaurant", "dining", "food"],
    },
  });

  const cuisines = [
    {
      name: "North Indian Restaurant",
      slug: "north-indian-restaurant",
      keywords: ["north indian", "punjabi"],
    },
    {
      name: "South Indian Restaurant",
      slug: "south-indian-restaurant",
      keywords: ["south indian", "dosa"],
    },
    {
      name: "Chinese Restaurant",
      slug: "chinese-restaurant",
      keywords: ["chinese", "noodles"],
    },
    {
      name: "Italian Restaurant",
      slug: "italian-restaurant",
      keywords: ["italian", "pizza"],
    },
    { name: "Bakery", slug: "bakery", keywords: ["bakery", "cake", "bread"] },
  ];

  for (const [index, cuisine] of cuisines.entries()) {
    await prisma.category.upsert({
      where: { slug: cuisine.slug },
      update: {},
      create: {
        name: cuisine.name,
        slug: cuisine.slug,
        parentId: restaurants.id,
        displayOrder: index + 1,
        isActive: true,
        searchKeywords: cuisine.keywords,
      },
    });
  }

  const homeServices = await prisma.category.upsert({
    where: { slug: "home-services" },
    update: {},
    create: {
      name: "Home Services",
      slug: "home-services",
      description: "Plumbers, electricians, cleaning services",
      icon: "🏠",
      displayOrder: 2,
      isActive: true,
      isFeatured: true,
      searchKeywords: ["home", "repair", "service"],
    },
  });

  const services = [
    { name: "Plumber", slug: "plumber", keywords: ["plumber", "plumbing"] },
    {
      name: "Electrician",
      slug: "electrician",
      keywords: ["electrician", "electrical"],
    },
    {
      name: "Carpenter",
      slug: "carpenter",
      keywords: ["carpenter", "furniture"],
    },
  ];

  for (const [index, service] of services.entries()) {
    await prisma.category.upsert({
      where: { slug: service.slug },
      update: {},
      create: {
        name: service.name,
        slug: service.slug,
        parentId: homeServices.id,
        displayOrder: index + 1,
        isActive: true,
        searchKeywords: service.keywords,
      },
    });
  }

  console.log("✅ Categories seeded");
}

async function seedAmenities() {
  console.log("🏷️ Seeding amenities...");

  const amenities = [
    {
      name: "Cash Accepted",
      slug: "cash-accepted",
      icon: "💵",
      category: "Payment",
    },
    {
      name: "Card Payment",
      slug: "card-payment",
      icon: "💳",
      category: "Payment",
    },
    {
      name: "UPI Accepted",
      slug: "upi-accepted",
      icon: "📱",
      category: "Payment",
      isPopular: true,
    },
    {
      name: "WiFi",
      slug: "wifi",
      icon: "📶",
      category: "Facilities",
      isPopular: true,
    },
    {
      name: "Parking",
      slug: "parking",
      icon: "🅿️",
      category: "Facilities",
      isPopular: true,
    },
    {
      name: "Air Conditioning",
      slug: "air-conditioning",
      icon: "❄️",
      category: "Facilities",
    },
    {
      name: "Home Delivery",
      slug: "home-delivery",
      icon: "🚚",
      category: "Services",
      isPopular: true,
    },
  ];

  for (const [index, amenity] of amenities.entries()) {
    await prisma.amenity.upsert({
      where: { slug: amenity.slug },
      update: {},
      create: {
        name: amenity.name,
        slug: amenity.slug,
        icon: amenity.icon,
        category: amenity.category,
        displayOrder: index + 1,
        isPopular: amenity.isPopular || false,
      },
    });
  }

  console.log("✅ Amenities seeded");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
