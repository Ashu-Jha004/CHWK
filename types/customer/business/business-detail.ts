// lib/types/business-detail.ts

import {
  Business,
  BusinessHours,
  BusinessImage,
  BusinessCategory,
  BusinessAmenity,
  BusinessServiceArea,
  BusinessStaff,
  BusinessDocument,
  Category,
  Amenity,
  MenuItem,
  Review,
  Photo,
  BusinessChain,
  ServiceArea,
  DayOfWeek,
  PriceRange,
  ServiceType,
  DeliveryType,
  PricingType,
} from "@prisma/client";

// ===========================
// Extended Business Type with ALL Relations
// ===========================
export type BusinessDetail = Business & {
  images: BusinessImage[];
  documents: BusinessDocument[];
  categories: (BusinessCategory & {
    category: Category;
  })[];
  amenities: (BusinessAmenity & {
    amenity: Amenity;
  })[];
  serviceAreas: ServiceArea[];
  serviceArea: BusinessServiceArea[];
  staff: BusinessStaff[];
  hours: BusinessHours[];
  menuItems: MenuItem[];
  reviews: (Review & {
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      avatar: string | null;
    };
    photos: Photo[];
  })[];
  photos: Photo[];
  chain: BusinessChain | null;
  _count?: {
    reviews: number;
    photos: number;
    menuItems: number;
    staff: number;
  };
};

// ===========================
// Tab Types
// ===========================
export type TabId =
  | "overview"
  | "about"
  | "products"
  | "services"
  | "staff"
  | "chain"
  | "photos"
  | "reviews"
  | "contact";

export interface TabConfig {
  id: TabId;
  label: string;
  icon: string; // Lucide icon name
  visible: boolean;
  badge?: number;
}

// ===========================
// Gallery Types
// ===========================
export interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
  type: "business" | "user" | "review" | "video";
  uploadedBy?: string | null;
  createdAt: Date;
}

export type GalleryFilter = "all" | "business" | "interior" | "exterior" | "menu" | "user" | "video";

export interface GalleryState {
  currentIndex: number;
  isOpen: boolean;
  filter: GalleryFilter;
}

// ===========================
// Menu/Service Item Types
// ===========================
export interface MenuItemDisplay extends MenuItem {
  categoryName?: string;
}

export type MenuItemFilter = "all" | "available" | "featured" | "bestseller";
export type MenuItemSort = "default" | "price-low" | "price-high" | "popular" | "name";

// ===========================
// Staff Types
// ===========================
export interface StaffMember extends BusinessStaff {
  workingHours?: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
  availability?: "available" | "busy" | "offline";
}

// ===========================
// Review Types (Placeholder)
// ===========================
export interface ReviewDisplay extends Review {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
  photos: Photo[];
  isHelpful?: boolean;
  helpfulVotes?: number;
}

export type ReviewFilter = "all" | "5star" | "4star" | "3star" | "2star" | "1star" | "with-photos";
export type ReviewSort = "recent" | "helpful" | "rating-high" | "rating-low";

// ===========================
// Map Types
// ===========================
export interface MapLocation {
  latitude: number;
  longitude: number;
  businessName: string;
  address: string;
  serviceRadius?: number | null;
}

export interface ServiceAreaDisplay extends ServiceArea {
  isActive: boolean;
}

// ===========================
// Business Hours Display
// ===========================
export interface BusinessHoursDisplay extends BusinessHours {
  isOpenNow?: boolean;
  nextOpenTime?: string;
}

export interface OperatingHours {
  [key: string]: BusinessHoursDisplay[];
}

// ===========================
// Action Button Types
// ===========================
export type ActionType = "call" | "whatsapp" | "directions" | "share" | "save" | "report";

export interface ActionButton {
  type: ActionType;
  label: string;
  icon: string;
  variant: "default" | "outline" | "secondary" | "ghost";
  visible: boolean;
  disabled?: boolean;
}

// ===========================
// SEO & Metadata Types
// ===========================
export interface BusinessSEO {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string | null;
  jsonLd: Record<string, any>;
}

// ===========================
// UI State Types
// ===========================
export interface BusinessPageState {
  activeTab: TabId;
  sidebarOpen: boolean;
  galleryState: GalleryState;
  menuFilter: MenuItemFilter;
  menuSort: MenuItemSort;
  reviewFilter: ReviewFilter;
  reviewSort: ReviewSort;
  isMobile: boolean;
}

// ===========================
// Error Types
// ===========================
export interface BusinessError {
  code: "NOT_FOUND" | "UNAUTHORIZED" | "SERVER_ERROR" | "INVALID_SLUG";
  message: string;
  details?: string;
}

// ===========================
// Statistics Display
// ===========================
export interface BusinessStats {
  totalReviews: number;
  averageRating: number;
  totalPhotos: number;
  totalProducts: number;
  totalServices: number;
  totalStaff: number;
  responseTime?: string;
  priceRange?: PriceRange | null;
}

// ===========================
// Chain Information
// ===========================
export interface ChainInfo extends BusinessChain {
  totalLocations: number;
  nearbyBranches?: {
    id: string;
    branchName: string | null;
    city: string;
    distance?: number;
  }[];
}

// ===========================
// Utility Types
// ===========================
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface FetchResult<T> {
  data: T | null;
  error: BusinessError | null;
  loading: boolean;
}

// ===========================
// Helper Type Guards
// ===========================
export const isProduct = (item: MenuItem): boolean => {
  return item.itemType === "PRODUCT";
};

export const isService = (item: MenuItem): boolean => {
  return item.itemType === "SERVICE";
};

export const hasChain = (business: BusinessDetail): boolean => {
  return business.chainId !== null && business.chain !== null;
};

export const hasStaff = (business: BusinessDetail): boolean => {
  return business.staff.length > 0;
};

export const acceptsOnlineOrders = (business: BusinessDetail): boolean => {
  return business.acceptsOrders && business.offersOnline;
};

export const acceptsBookings = (business: BusinessDetail): boolean => {
  return business.acceptsBookings;
};

// ===========================
// Constants
// ===========================
export const TAB_CONFIG: Record<TabId, Omit<TabConfig, "visible" | "badge">> = {
  overview: { id: "overview", label: "Overview", icon: "Home" },
  about: { id: "about", label: "About", icon: "Info" },
  products: { id: "products", label: "Products", icon: "ShoppingBag" },
  services: { id: "services", label: "Services", icon: "Wrench" },
  staff: { id: "staff", label: "Staff", icon: "Users" },
  chain: { id: "chain", label: "Locations", icon: "MapPin" },
  photos: { id: "photos", label: "Photos", icon: "Image" },
  reviews: { id: "reviews", label: "Reviews", icon: "Star" },
  contact: { id: "contact", label: "Contact", icon: "Phone" },
};

export const GALLERY_FILTERS: { value: GalleryFilter; label: string }[] = [
  { value: "all", label: "All Photos" },
  { value: "business", label: "By Business" },
  { value: "interior", label: "Interior" },
  { value: "exterior", label: "Exterior" },
  { value: "menu", label: "Menu" },
  { value: "user", label: "By Customers" },
];

export const REVALIDATE_TIME = 3600; // 1 hour for ISR
