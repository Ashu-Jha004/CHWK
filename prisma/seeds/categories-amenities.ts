// prisma/seeds/categories-amenities.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCategoriesAndAmenities() {
  console.log("🌱 Seeding Categories and Amenities...");

  // Categories
  const categories = [
    // --- FOOD & DINING ---
    { name: "Restaurant", slug: "restaurant", description: "Dining establishments serving food and beverages", icon: "🍽️", isFeatured: true, displayOrder: 1 },
    { name: "Cafe", slug: "cafe", description: "Coffee shops and casual cafes", icon: "☕", isFeatured: true, displayOrder: 2 },
    { name: "Bar & Pub", slug: "bar-pub", description: "Bars, pubs, and lounges", icon: "🍺", isFeatured: true, displayOrder: 3 },
    { name: "Fast Food", slug: "fast-food", description: "Quick service restaurants", icon: "🍔", isFeatured: false, displayOrder: 4 },
    { name: "Bakery", slug: "bakery", description: "Bakeries and dessert shops", icon: "🥐", isFeatured: false, displayOrder: 5 },
    { name: "Food Truck", slug: "food-truck", description: "Mobile food vendors", icon: "🚚", isFeatured: false, displayOrder: 6 },
    { name: "Sweets Shop", slug: "sweets-shop", description: "Traditional Indian sweets and snacks", icon: "🍬", isFeatured: false, displayOrder: 7 },

    // --- HEALTHCARE ---
    { name: "Doctor & Clinic", slug: "doctor-clinic", description: "General practitioners and specialized clinics", icon: "🩺", isFeatured: true, displayOrder: 10 },
    { name: "Hospital", slug: "hospital", description: "Multi-specialty and general hospitals", icon: "🏥", isFeatured: true, displayOrder: 11 },
    { name: "Dentist", slug: "dentist", description: "Dental clinics and oral health services", icon: "🦷", isFeatured: false, displayOrder: 12 },
    { name: "Pharmacy", slug: "pharmacy", description: "Medical stores and pharmacies", icon: "💊", isFeatured: false, displayOrder: 13 },
    { name: "Diagnostic Center", slug: "diagnostic-center", description: "Pathology labs and imaging centers", icon: "🔬", isFeatured: false, displayOrder: 14 },
    { name: "Physiotherapy", slug: "physiotherapy", description: "Physical therapy and rehabilitation", icon: "🏃", isFeatured: false, displayOrder: 15 },
    { name: "Ayurveda & Homeopathy", slug: "alternative-medicine", description: "Alternative and traditional medicine", icon: "🌿", isFeatured: false, displayOrder: 16 },
    { name: "Optician", slug: "optician", description: "Eye clinics and eyewear stores", icon: "👓", isFeatured: false, displayOrder: 17 },

    // --- PROFESSIONAL SERVICES ---
    { name: "CA & Accountant", slug: "ca-accountant", description: "Chartered Accountants and tax consultants", icon: "📊", isFeatured: true, displayOrder: 20 },
    { name: "Lawyer & Advocate", slug: "lawyer-advocate", description: "Legal consultants and advocates", icon: "⚖️", isFeatured: true, displayOrder: 21 },
    { name: "Tax Consultant", slug: "tax-consultant", description: "Income tax and GST consultancy", icon: "📝", isFeatured: false, displayOrder: 22 },
    { name: "IT & Web Services", slug: "it-web-services", description: "Software, web, and digital services", icon: "💻", isFeatured: false, displayOrder: 23 },
    { name: "Architecture & Design", slug: "architecture-design", description: "Architects and interior designers", icon: "📐", isFeatured: false, displayOrder: 24 },
    { name: "Consulting", slug: "consulting", description: "Business and management consulting", icon: "🤝", isFeatured: false, displayOrder: 25 },
    { name: "Notary & Document", slug: "notary-document", description: "Notary public and documentation services", icon: "🖋️", isFeatured: false, displayOrder: 26 },

    // --- EDUCATION ---
    { name: "School", slug: "school", description: "Primary and secondary schools", icon: "🏫", isFeatured: true, displayOrder: 30 },
    { name: "Coaching Center", slug: "coaching-center", description: "Competitive exam and school coaching", icon: "📚", isFeatured: true, displayOrder: 31 },
    { name: "University & College", slug: "university-college", description: "Higher education institutions", icon: "🎓", isFeatured: false, displayOrder: 32 },
    { name: "Language Classes", slug: "language-classes", description: "English and foreign language training", icon: "🗣️", isFeatured: false, displayOrder: 33 },
    { name: "Music & Dance", slug: "music-dance", description: "Performing arts training", icon: "🎸", isFeatured: false, displayOrder: 34 },

    // --- RETAIL & SHOPS ---
    { name: "Grocery Store", slug: "grocery-store", description: "Kirana stores and supermarkets", icon: "🛒", isFeatured: true, displayOrder: 40 },
    { name: "Electronics Store", slug: "electronics-store", description: "Mobile, computer, and appliance stores", icon: "📱", isFeatured: true, displayOrder: 41 },
    { name: "Clothing & Apparel", slug: "clothing-apparel", description: "Garments and fashion boutiques", icon: "👕", isFeatured: false, displayOrder: 42 },
    { name: "Jewelry Store", slug: "jewelry-store", description: "Gold, silver, and fashion jewelry", icon: "💍", isFeatured: false, displayOrder: 43 },
    { name: "Hardware & Tools", slug: "hardware-tools", description: "Construction and hardware materials", icon: "🔨", isFeatured: false, displayOrder: 44 },
    { name: "Footwear Store", slug: "footwear-store", description: "Shoes and footwear retail", icon: "👟", isFeatured: false, displayOrder: 45 },
    { name: "Stationery Shop", slug: "stationery-shop", description: "Books and office supplies", icon: "✏️", isFeatured: false, displayOrder: 46 },

    // --- HOME SERVICES ---
    { name: "Plumber", slug: "plumber", description: "Plumbing repair and installation", icon: "🔧", isFeatured: false, displayOrder: 50 },
    { name: "Electrician", slug: "electrician", description: "Electrical maintenance and wiring", icon: "⚡", isFeatured: false, displayOrder: 51 },
    { name: "Carpenter", slug: "carpenter", description: "Woodwork and furniture repair", icon: "🪚", isFeatured: false, displayOrder: 52 },
    { name: "Cleaning Services", slug: "cleaning-services", description: "Home and office cleaning", icon: "🧹", isFeatured: false, displayOrder: 53 },
    { name: "Pest Control", slug: "pest-control", description: "Fumigation and pest management", icon: "🐜", isFeatured: false, displayOrder: 54 },
    { name: "Appliance Repair", slug: "appliance-repair", description: "AC, Fridge, and TV repair", icon: "📺", isFeatured: false, displayOrder: 55 },
    { name: "Packers & Movers", slug: "packers-movers", description: "Relocation and shifting services", icon: "📦", isFeatured: false, displayOrder: 56 },

    // --- AUTOMOTIVE ---
    { name: "Car Service", slug: "car-service", description: "Automobile repair and service centers", icon: "🚗", isFeatured: true, displayOrder: 60 },
    { name: "Bike Service", slug: "bike-service", description: "Two-wheeler repair and maintenance", icon: "🏍️", isFeatured: false, displayOrder: 61 },
    { name: "Car Wash", slug: "car-wash", description: "Professional car cleaning and detailing", icon: "🧼", isFeatured: false, displayOrder: 62 },
    { name: "Tyre Shop", slug: "tyre-shop", description: "New tyres and alignment services", icon: "⭕", isFeatured: false, displayOrder: 63 },

    // --- BEAUTY & WELLNESS ---
    { name: "Gym & Fitness", slug: "gym-fitness", description: "Gyms and sports facilities", icon: "💪", isFeatured: true, displayOrder: 70 },
    { name: "Spa & Salon", slug: "spa-salon", description: "Beauty and wellness centers", icon: "💆", isFeatured: true, displayOrder: 71 },
    { name: "Yoga Center", slug: "yoga-center", description: "Yoga and meditation studios", icon: "🧘", isFeatured: false, displayOrder: 72 },

    // --- TRAVEL & HOSPITALITY ---
    { name: "Hotel", slug: "hotel", description: "Hotels and accommodations", icon: "🏨", isFeatured: true, displayOrder: 80 },
    { name: "Travel Agency", slug: "travel-agency", description: "Tours and travel bookings", icon: "✈️", isFeatured: false, displayOrder: 81 },

    // --- REAL ESTATE ---
    { name: "Real Estate Agent", slug: "real-estate-agent", description: "Property buying, selling, and renting", icon: "🏠", isFeatured: false, displayOrder: 90 },

    // --- OTHERS ---
    { name: "Laundry & Dry Cleaning", slug: "laundry", description: "Washing and ironing services", icon: "🧺", isFeatured: false, displayOrder: 100 },
    { name: "Courier Service", slug: "courier", description: "National and international shipping", icon: "🚚", isFeatured: false, displayOrder: 101 },
    { name: "Photography", slug: "photography", description: "Wedding and event photography", icon: "📸", isFeatured: false, displayOrder: 102 },
  ];

  // Amenities
  const amenities = [
    // Payment
    { name: "UPI Payment", slug: "upi-payment", icon: "📱", category: "Payment", isPopular: true, displayOrder: 1 },
    { name: "Card Payment", slug: "card-payment", icon: "💳", category: "Payment", isPopular: true, displayOrder: 2 },
    { name: "Cash Only", slug: "cash-only", icon: "💵", category: "Payment", isPopular: false, displayOrder: 3 },
    { name: "EMI Available", slug: "emi-available", icon: "🏦", category: "Payment", isPopular: false, displayOrder: 4 },

    // Facilities
    { name: "WiFi", slug: "wifi", icon: "📶", category: "Facilities", isPopular: true, displayOrder: 1 },
    { name: "Parking", slug: "parking", icon: "🅿️", category: "Facilities", isPopular: true, displayOrder: 2 },
    { name: "Air Conditioning", slug: "ac", icon: "❄️", category: "Facilities", isPopular: true, displayOrder: 3 },
    { name: "Wheelchair Accessible", slug: "wheelchair-accessible", icon: "♿", category: "Facilities", isPopular: false, displayOrder: 4 },
    { name: "Pet Friendly", slug: "pet-friendly", icon: "🐕", category: "Facilities", isPopular: false, displayOrder: 5 },
    { name: "Smoking Area", slug: "smoking-area", icon: "🚬", category: "Facilities", isPopular: false, displayOrder: 6 },
    { name: "Washroom", slug: "washroom", icon: "🚽", category: "Facilities", isPopular: false, displayOrder: 7 },
    { name: "Lift/Elevator", slug: "lift", icon: "🛗", category: "Facilities", isPopular: false, displayOrder: 8 },

    // Service Features
    { name: "Home Visit", slug: "home-visit", icon: "🏠", category: "Services", isPopular: true, displayOrder: 1 },
    { name: "Emergency Service", slug: "emergency-service", icon: "🚨", category: "Services", isPopular: true, displayOrder: 2 },
    { name: "24/7 Service", slug: "service-24-7", icon: "⏰", category: "Services", isPopular: false, displayOrder: 3 },
    { name: "Appointment Required", slug: "appointment-required", icon: "📅", category: "Services", isPopular: false, displayOrder: 4 },
    { name: "Free Consultation", slug: "free-consultation", icon: "💬", category: "Services", isPopular: false, displayOrder: 5 },
  ];

  // Create/Update categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log(`✅ Upserted ${categories.length} categories`);

  // Create/Update amenities
  for (const amenity of amenities) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: amenity,
      create: amenity,
    });
  }

  console.log(`✅ Upserted ${amenities.length} amenities`);
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
