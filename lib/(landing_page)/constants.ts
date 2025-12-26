import {
  Utensils,
  Scissors,
  Wrench,
  Heart,
  GraduationCap,
  Home,
  Scale,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

// Brand colors matching modern Indian aesthetic
export const BRAND_COLORS = {
  primary: "#FF6B35",
  secondary: "#004E89",
  accent: "#F7B801",
  success: "#2A9D8F",
} as const;

// SEO Configuration for Tier 1 cities
export const SEO_CONFIG = {
  title: "CHWK - Discover Local Businesses & Services in India",
  description:
    "Find the best restaurants, salons, repair services, healthcare, education, and home services near you. Read reviews, compare ratings, and connect with trusted local businesses across India's top cities.",
  keywords: [
    "local business India",
    "find services near me",
    "business directory India",
    "local services Mumbai",
    "local services Delhi",
    "local services Bangalore",
    "local services Hyderabad",
    "local services Chennai",
    "local services Kolkata",
    "restaurants near me",
    "salons near me",
    "home services India",
    "business reviews India",
  ],
  url: "https://chwk.vercel.app/", // Update with your actual domain
  ogImage: "/public/images/og-image.jpg", // We'll create this later
};

// Business Categories
export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  count: number;
  color: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "restaurants",
    name: "Restaurants",
    icon: Utensils,
    description: "Cafes, fine dining, street food & more",
    count: 12500,
    color: "bg-orange-500",
  },
  {
    id: "salons",
    name: "Salons & Spas",
    icon: Scissors,
    description: "Beauty parlors, barbers, wellness centers",
    count: 8200,
    color: "bg-pink-500",
  },
  {
    id: "repairs",
    name: "Repairs",
    icon: Wrench,
    description: "Plumbing, electrical, electronics repair",
    count: 6700,
    color: "bg-blue-500",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: Heart,
    description: "Clinics, hospitals, pharmacies, diagnostics",
    count: 9800,
    color: "bg-red-500",
  },
  {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    description: "Coaching classes, schools, skill training",
    count: 7300,
    color: "bg-indigo-500",
  },
  {
    id: "home-services",
    name: "Home Services",
    icon: Home,
    description: "Cleaning, pest control, interior design",
    count: 5400,
    color: "bg-green-500",
  },
  {
    id: "law-firms",
    name: "Law Firms",
    icon: Scale,
    description: "Lawyers, legal consultants, notary services",
    count: 4100,
    color: "bg-purple-500",
  },
  {
    id: "professional",
    name: "Professional Services",
    icon: Briefcase,
    description: "Accounting, IT, consulting, marketing",
    count: 6900,
    color: "bg-teal-500",
  },
];

// Mock Testimonials Data
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  business?: string;
  avatar: string;
  rating: number;
  content: string;
  location: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Priya Sharma",
    role: "Customer",
    avatar: "PS",
    rating: 5,
    content:
      "CHWK made it so easy to find a reliable plumber near my area. The reviews were accurate and I got same-day service. Highly recommend!",
    location: "Mumbai",
  },
  {
    id: "2",
    name: "Rajesh Kumar",
    role: "Restaurant Owner",
    business: "Spice Garden Restaurant",
    avatar: "RK",
    rating: 5,
    content:
      "Listing my restaurant on CHWK increased our footfall by 40% in just 2 months. The platform is user-friendly and brings genuine customers.",
    location: "Bangalore",
  },
  {
    id: "3",
    name: "Anjali Mehta",
    role: "Customer",
    avatar: "AM",
    rating: 5,
    content:
      "Found the perfect salon for my wedding prep through CHWK. The detailed reviews and photos helped me make the right choice!",
    location: "Delhi",
  },
  {
    id: "4",
    name: "Vikram Patel",
    role: "Clinic Owner",
    business: "HealthFirst Clinic",
    avatar: "VP",
    rating: 5,
    content:
      "As a healthcare provider, CHWK helps us reach patients who need our services. The verification system builds trust with new patients.",
    location: "Pune",
  },
  {
    id: "5",
    name: "Sneha Reddy",
    role: "Customer",
    avatar: "SR",
    rating: 5,
    content:
      "I've discovered so many hidden gems in my neighborhood - from street food stalls to boutique stores. CHWK is my go-to app now!",
    location: "Hyderabad",
  },
  {
    id: "6",
    name: "Amit Desai",
    role: "Salon Owner",
    business: "Style Studio",
    avatar: "AD",
    rating: 5,
    content:
      "The best business decision we made! Our bookings doubled, and we're getting customers from nearby areas we never reached before.",
    location: "Ahmedabad",
  },
];

// Statistics
export const STATS = {
  businesses: 61000,
  customers: 850000,
  reviews: 320000,
  cities: 25,
} as const;

// Tier 1 Cities
export const TIER_1_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
] as const;

// Image generation prompts for Nano Banana AI
export const IMAGE_PROMPTS = {
  hero: "Modern Indian local marketplace with diverse people using smartphones, vibrant street shops, colorful storefronts, warm lighting, professional photography style, shallow depth of field",

  customerFeature:
    "Happy diverse Indian customers using mobile app to discover local services, modern UI on phone screen, bright indoor lighting, professional lifestyle photography",

  businessFeature:
    "Indian business owner smiling in front of their shop, holding tablet showing business dashboard with 5-star reviews, professional portrait, warm natural lighting",

  restaurants:
    "Vibrant Indian restaurant interior with diverse customers dining, colorful food presentation, warm ambient lighting, overhead shot",

  salons:
    "Modern Indian salon interior with stylist working on customer, clean aesthetic, natural lighting, professional photography",

  healthcare:
    "Friendly Indian doctor with patient in modern clinic, clean white interior, professional medical setting, warm lighting",

  education:
    "Indian students in bright modern classroom with technology, engaged learning, natural lighting, diverse group",

  homeServices:
    "Professional Indian technician providing home repair service, modern home interior, customer satisfaction, bright natural lighting",
} as const;
