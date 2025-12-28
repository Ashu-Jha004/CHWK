// lib/types/business-onboarding.types.ts
// Type definitions for business onboarding flow

import { BusinessStatus, PriceRange, DayOfWeek } from "@prisma/client";

// ==================== FORM DATA TYPES ====================

export interface BasicInfoData {
  name: string;
  description: string;
  shortDescription: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  whatsappNumber?: string;
  website?: string;

  // Chain info (optional)
  isPartOfChain: boolean;
  chainId?: string;
  chainName?: string; // For creating new chain
  branchName?: string;
}

export interface LocationData {
  // Auto-detected
  latitude: number;
  longitude: number;

  // Address components
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  area?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;

  // Location detection status
  isLocationDetected: boolean;
  locationError?: string;
}

export interface CategoryData {
  primaryCategoryId: string;
  additionalCategoryIds: string[];
}

export interface BusinessHoursData {
  hours: Array<{
    dayOfWeek: DayOfWeek;
    isClosed: boolean;
    openTime?: string; // "09:00"
    closeTime?: string; // "21:00"
    hasSplitShift: boolean;
    splitCloseTime?: string;
    splitReopenTime?: string;
  }>;
  is24x7: boolean;
}

export interface BusinessDetailsData {
  priceRange?: PriceRange;

  // Feature toggles
  acceptsBookings: boolean;
  acceptsOrders: boolean;
  hasDelivery: boolean;
  hasPickup: boolean;
  hasDineIn: boolean;
  hasEmergencyService: boolean;

  // Delivery settings
  deliveryRadius?: number; // meters
  minOrderAmount?: number; // INR
  deliveryFee?: number; // INR

  // Emergency settings
  emergencyContactNumber?: string;
  emergencyExtraCharge?: number;

  // Booking/Order policies
  minAdvanceBookingHours?: number;
  maxAdvanceBookingDays?: number;
  cancellationPolicy?: string;

  // Amenities
  amenityIds: string[];
}

export interface DocumentationData {
  gstNumber?: string;
  panNumber?: string;

  // Uploaded documents
  documents: Array<{
    type: string; // "Aadhaar", "PAN", "GST Certificate", "Business License"
    url: string; // Cloudinary URL
    fileName: string;
  }>;
}

export interface OptionalData {
  // Staff (optional)
  staff?: Array<{
    name: string;
    designation?: string;
    specialization?: string;
    phone?: string;
    email?: string;
    yearsOfExperience?: number;
  }>;

  // Service areas (optional)
  serviceAreas?: Array<{
    pincode?: string;
    areaName?: string;
    city?: string;
    radiusKm?: number;
    extraCharge?: number;
  }>;

  // Menu items (optional)
  menuItems?: Array<{
    name: string;
    description?: string;
    price: number;
    category?: string;
    isVegetarian: boolean;
    duration?: number; // for services
  }>;
}

// ==================== COMPLETE FORM STATE ====================

export interface BusinessOnboardingState {
  currentStep: number;
  completedSteps: number[];

  // Form data for each step
  basicInfo: Partial<BasicInfoData>;
  location: Partial<LocationData>;
  categories: Partial<CategoryData>;
  businessHours: Partial<BusinessHoursData>;
  businessDetails: Partial<BusinessDetailsData>;
  documentation: Partial<DocumentationData>;
  optional: Partial<OptionalData>;
  photos: {
    logoUrl: string;
    coverImageUrl?: string;
    photoUrls: string[];
  };
  // Submission state
  isSubmitting: boolean;
  submitError?: string;
  isComplete: boolean;
}

// ==================== STEP CONFIGURATION ====================

export interface StepConfig {
  id: number;
  title: string;
  description: string;
  isOptional?: boolean;
}

export const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: 1,
    title: "Basic Information",
    description: "Tell us about your business",
  },
  {
    id: 2,
    title: "Location",
    description: "Where is your business located?",
  },
  {
    id: 3,
    title: "Categories",
    description: "What type of business do you run?",
  },
  {
    id: 4,
    title: "Business Hours",
    description: "When are you open?",
  },
  {
    id: 5,
    title: "Business Details",
    description: "Additional information about your services",
  },
  {
    id: 6,
    title: "Documentation",
    description: "Verify your business",
  },
  {
    id: 7,
    title: "Additional Details",
    description: "Staff, service areas, and menu (optional)",
    isOptional: true,
  },
  {
    id: 8,
    title: "Review & Submit",
    description: "Review your information before submitting",
  },
];

// ==================== VALIDATION HELPERS ====================

export interface StepValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

// ==================== REVERSE GEOCODING ====================

export interface ReverseGeocodeResult {
  addressLine1: string;
  area?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  country: string;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}
