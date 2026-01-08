// lib/business-onboarding/category-features.ts
// Category-based feature mapping for dynamic Step 5 rendering

export interface CategoryFeatures {
  // Service Features
  showDineIn: boolean;
  showDelivery: boolean;
  showPickup: boolean;
  showBookings: boolean;
  showOrders: boolean;
  showEmergencyService: boolean;

  // Pricing
  showPriceRange: boolean;

  // Booking Policies
  showBookingPolicies: boolean;

  // Delivery Settings
  showDeliverySettings: boolean;

  // Amenity Categories to show
  amenityCategories: string[];

  // Labels (for customization)
  labels?: {
    orders?: string;
    bookings?: string;
    delivery?: string;
  };
}

// Category type mappings
const RESTAURANT_CATEGORIES = [
  'restaurants',
  'food-dining',
  'cafe',
  'bakery',
  'fast-food',
  'fine-dining',
  'bar',
  'pub',
  'street-food',
];

const SERVICE_CATEGORIES = [
  'plumber',
  'electrician',
  'carpenter',
  'mechanic',
  'salon',
  'spa',
  'beauty',
  'repair',
  'maintenance',
  'cleaning',
  'pest-control',
];

const RETAIL_CATEGORIES = [
  'retail',
  'store',
  'shop',
  'market',
  'boutique',
  'supermarket',
  'grocery',
  'electronics',
  'clothing',
  'bookstore',
];

const HEALTHCARE_CATEGORIES = [
  'hospital',
  'clinic',
  'doctor',
  'dentist',
  'pharmacy',
  'laboratory',
  'medical',
  'healthcare',
];

const ENTERTAINMENT_CATEGORIES = [
  'theater',
  'cinema',
  'gym',
  'fitness',
  'sports',
  'recreation',
  'park',
  'museum',
];

/**
 * Get business category type from category name/slug
 */
export function getCategoryType(categorySlug: string): string {
  const slug = categorySlug.toLowerCase();

  if (RESTAURANT_CATEGORIES.some(cat => slug.includes(cat))) {
    return 'restaurant';
  }
  if (SERVICE_CATEGORIES.some(cat => slug.includes(cat))) {
    return 'service';
  }
  if (RETAIL_CATEGORIES.some(cat => slug.includes(cat))) {
    return 'retail';
  }
  if (HEALTHCARE_CATEGORIES.some(cat => slug.includes(cat))) {
    return 'healthcare';
  }
  if (ENTERTAINMENT_CATEGORIES.some(cat => slug.includes(cat))) {
    return 'entertainment';
  }

  return 'general';
}

/**
 * Feature configuration for each business type
 */
export const CATEGORY_FEATURES_MAP: Record<string, CategoryFeatures> = {
  // Restaurants, Cafes, Food Services
  restaurant: {
    showDineIn: true,
    showDelivery: true,
    showPickup: true,
    showBookings: true,
    showOrders: true,
    showEmergencyService: false,
    showPriceRange: true,
    showBookingPolicies: true,
    showDeliverySettings: true,
    amenityCategories: ['Dining', 'Food Service', 'Ambiance', 'Facilities', 'Accessibility'],
    labels: {
      orders: 'Accepts Food Orders',
      bookings: 'Accepts Table Reservations',
      delivery: 'Food Delivery Available',
    },
  },

  // Service Providers (Plumbers, Electricians, Salons, etc.)
  service: {
    showDineIn: false,
    showDelivery: false,
    showPickup: false,
    showBookings: true,
    showOrders: false,
    showEmergencyService: true,
    showPriceRange: false,
    showBookingPolicies: true,
    showDeliverySettings: false,
    amenityCategories: ['General', 'Professional Services', 'Accessibility'],
    labels: {
      bookings: 'Accepts Appointments',
    },
  },

  // Retail Stores, Shops
  retail: {
    showDineIn: false,
    showDelivery: true,
    showPickup: true,
    showBookings: false,
    showOrders: true,
    showEmergencyService: false,
    showPriceRange: true,
    showBookingPolicies: false,
    showDeliverySettings: true,
    amenityCategories: ['Shopping Features', 'Store Facilities', 'Accessibility', 'Payment Options'],
    labels: {
      orders: 'Accepts Online Orders',
      delivery: 'Product Delivery Available',
    },
  },

  // Healthcare (Hospitals, Clinics, Pharmacies)
  healthcare: {
    showDineIn: false,
    showDelivery: true, // Medicine delivery
    showPickup: true,
    showBookings: true,
    showOrders: true, // Medicine orders
    showEmergencyService: true,
    showPriceRange: false,
    showBookingPolicies: true,
    showDeliverySettings: true,
    amenityCategories: ['Medical Facilities', 'Accessibility', 'Patient Services'],
    labels: {
      orders: 'Accepts Medicine Orders',
      bookings: 'Accepts Appointments',
      delivery: 'Medicine Home Delivery',
    },
  },

  // Entertainment (Gyms, Theaters, etc.)
  entertainment: {
    showDineIn: false,
    showDelivery: false,
    showPickup: false,
    showBookings: true,
    showOrders: false,
    showEmergencyService: false,
    showPriceRange: true,
    showBookingPolicies: true,
    showDeliverySettings: false,
    amenityCategories: ['Facilities', 'Amenities', 'Accessibility'],
    labels: {
      bookings: 'Accepts Bookings/Reservations',
    },
  },

  // General/Universal fallback (shows most features)
  general: {
    showDineIn: false,
    showDelivery: true,
    showPickup: true,
    showBookings: true,
    showOrders: true,
    showEmergencyService: false,
    showPriceRange: false,
    showBookingPolicies: true,
    showDeliverySettings: true,
    amenityCategories: ['General', 'Facilities', 'Accessibility'],
    labels: {
      orders: 'Accepts Online Orders',
      bookings: 'Accepts Bookings',
      delivery: 'Delivery Available',
    },
  },
};

/**
 * Get features for a specific category
 * @param categorySlug - The category slug or name
 * @returns CategoryFeatures configuration
 */
export function getCategoryFeatures(categorySlug: string | undefined): CategoryFeatures {
  if (!categorySlug) {
    return CATEGORY_FEATURES_MAP.general;
  }

  const categoryType = getCategoryType(categorySlug);
  return CATEGORY_FEATURES_MAP[categoryType] || CATEGORY_FEATURES_MAP.general;
}

/**
 * Helper to check if a specific feature should be shown
 */
export function shouldShowFeature(
  categorySlug: string | undefined,
  feature: keyof Omit<CategoryFeatures, 'amenityCategories' | 'labels'>
): boolean {
  const features = getCategoryFeatures(categorySlug);
  return features[feature] as boolean;
}

/**
 * Get custom label for a feature based on category
 */
export function getFeatureLabel(
  categorySlug: string | undefined,
  feature: keyof NonNullable<CategoryFeatures['labels']>,
  defaultLabel: string
): string {
  const features = getCategoryFeatures(categorySlug);
  return features.labels?.[feature] || defaultLabel;
}
