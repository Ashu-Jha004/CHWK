// types/businessDashboard/service-settings.ts

import {
  PricingType,
  DeliveryType,
  ServiceType,
  MenuItem,
  ServiceArea,
  Business,
} from "@prisma/client";

// ==================== ENUMS AS CONST ====================

export const PRICING_TYPES = {
  FIXED: "FIXED",
  HOURLY: "HOURLY",
  DAILY: "DAILY",
  NEGOTIABLE: "NEGOTIABLE",
  FREE: "FREE",
  STARTING_FROM: "STARTING_FROM",
} as const;

export const DELIVERY_TYPES = {
  PHYSICAL: "PHYSICAL",
  DIGITAL: "DIGITAL",
  IN_PERSON: "IN_PERSON",
  ON_SITE: "ON_SITE",
  ONLINE: "ONLINE",
} as const;

export const SERVICE_TYPES = {
  PRODUCT: "PRODUCT",
  SERVICE: "SERVICE",
  CONSULTATION: "CONSULTATION",
  RENTAL: "RENTAL",
  SUBSCRIPTION: "SUBSCRIPTION",
} as const;

// ==================== DISPLAY LABELS ====================

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  FIXED: "Fixed Price",
  HOURLY: "Hourly Rate",
  DAILY: "Daily Rate",
  NEGOTIABLE: "Negotiable / Call for Price",
  FREE: "Free",
  STARTING_FROM: "Starting From",
};

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  PHYSICAL: "Physical Delivery",
  DIGITAL: "Digital Delivery",
  IN_PERSON: "In-Person at Business",
  ON_SITE: "On-Site at Customer Location",
  ONLINE: "Online Service",
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  PRODUCT: "Product",
  SERVICE: "Service",
  CONSULTATION: "Consultation",
  RENTAL: "Rental",
  SUBSCRIPTION: "Subscription",
};

// ==================== SERVICE SETTINGS FORM DATA ====================

export interface ServiceSettingsFormData {
  // Service Offerings
  offersProducts: boolean;
  offersServices: boolean;
  offersDineIn: boolean;
  offersDelivery: boolean;
  offersPickup: boolean;
  offersOnline: boolean;
  offersOnSite: boolean;

  // Service Radius
  serviceRadiusKm?: number | null;

  // Payment Methods
  acceptsCash: boolean;
  acceptsUPI: boolean;
  acceptsCards: boolean;
  acceptsNetBanking: boolean;
  acceptsWallets: boolean;
  requiresAdvancePayment: boolean;
  advancePaymentPercent?: number | null;

  // Booking Settings (use existing from Business)
  acceptsBookings: boolean;
  minAdvanceBookingHours?: number | null;
  maxAdvanceBookingDays?: number | null;
}

// ==================== SERVICE AREA ====================

export interface ServiceAreaFormData {
  areaName?: string | null;
  pincode?: string | null;
  city?: string | null;
  deliveryFee?: number | null;
  minimumOrder?: number | null;
  estimatedTime?: string | null;
  isActive: boolean;
}

export type ServiceAreaWithId = ServiceArea;

// ==================== MENU ITEM (UNIVERSAL) ====================

export interface MenuItemFormData {
  // Basic Info
  name: string;
  categoryId: string;
  description?: string | null;

  // Type Classification
  itemType: ServiceType;
  deliveryType: DeliveryType;

  // Pricing
  pricingType: PricingType;
  basePrice?: number | null; // For FIXED pricing
  salePrice?: number | null; // Discounted price
  hourlyRate?: number | null; // For HOURLY pricing
  dailyRate?: number | null; // For DAILY pricing
  priceNote?: string | null; // "Negotiable on call"

  // Service-specific
  serviceDuration?: number | null; // Minutes
  requiresBooking: boolean;
  bufferTime?: number | null;

  // Availability
  isAvailable: boolean;
  availableDays?: string[];
  availableOnline: boolean;
  availableAtLocation: boolean;
  availableOnSite: boolean;
  maxTravelDistance?: number | null;

  // Attributes (keep existing food ones)
  isVeg?: boolean | null;
  isVegan?: boolean | null;
  isGlutenFree?: boolean | null;
  isSpicy?: boolean | null;
  spicyLevel?: number | null;

  // Additional
  skillLevel?: string | null;
  certification?: string | null;
  cancellationPolicy?: string | null;

  // Tags & SEO
  tags?: string[];
  allergens?: string[];

  // Images (handled separately via upload)
  image?: string | null;

  // Display
  displayOrder?: number;
  isFeatured: boolean;
  isRecommended: boolean;

  // Inventory
  stockQuantity?: number | null;
}

export type MenuItemWithDetails = MenuItem & {
  category?: {
    id: string;
    name: string;
  };
};

// ==================== BULK OPERATIONS ====================

export interface BulkItemOperation {
  itemIds: string[];
  action: "enable" | "disable" | "delete" | "change-category";
  targetCategoryId?: string; // For change-category action
}

// ==================== API RESPONSES ====================

export interface ServiceSettingsResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: Partial<Business>;
}

export interface ServiceAreaResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: ServiceArea;
}

export interface MenuItemResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: MenuItem;
}

export interface BulkOperationResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    affected: number;
    items?: MenuItem[];
  };
}

// ==================== FILTER & SORT ====================

export interface MenuItemFilters {
  categoryId?: string;
  itemType?: ServiceType;
  pricingType?: PricingType;
  deliveryType?: DeliveryType;
  isAvailable?: boolean;
  requiresBooking?: boolean;
  availableOnline?: boolean;
  search?: string;
}

export interface MenuItemSort {
  field: "name" | "basePrice" | "displayOrder" | "createdAt" | "orderCount";
  direction: "asc" | "desc";
}

// ==================== HELPER TYPES ====================

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};
