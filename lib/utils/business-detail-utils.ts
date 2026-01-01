// lib/utils/business-detail-utils.ts

import {
  BusinessDetail,
  BusinessHoursDisplay,
  GalleryImage,
  MenuItemDisplay,
  ReviewDisplay,
  MapLocation,
  BusinessStats,
  MenuItemFilter,
  MenuItemSort,
  ReviewFilter,
  ReviewSort,
} from "@/types/customer/business/business-detail";
import {
  BusinessHours,
  DayOfWeek,
  MenuItem,
  BusinessImage,
  Photo,
  Review,
  PriceRange,
} from "@prisma/client";

// ===========================
// Date & Time Utilities
// ===========================

export const getCurrentDayOfWeek = (): DayOfWeek => {
  const days: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[new Date().getDay()];
};

export const isBusinessOpenNow = (
  business: BusinessDetail | null | undefined,
  hours: BusinessHours[] = []
): boolean => {
  try {
    if (!business) return false;
    if (business.is24x7) return true;
    if (business.isTemporarilyClosed) return false;
    if (!hours || !Array.isArray(hours) || hours.length === 0) return false;

    const now = new Date();
    const currentDay = getCurrentDayOfWeek();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = hours.find(
      (h) => h?.dayOfWeek === currentDay && !h?.isClosed
    );
    if (!todayHours || !todayHours.openTime || !todayHours.closeTime) return false;

    const parseTime = (timeStr: string): number => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(":").map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const openTime = parseTime(todayHours.openTime);
    const closeTime = parseTime(todayHours.closeTime);

    // Handle split shifts if/when supported, or overnight closing
    if (closeTime < openTime) {
      // Closes next day (e.g. 10 PM to 2 AM)
      return currentTime >= openTime || currentTime <= closeTime;
    }

    return currentTime >= openTime && currentTime <= closeTime;
  } catch {
    return false;
  }
};

export const getNextOpeningTime = (
  hours: BusinessHours[] = []
): string | null => {
  try {
    if (!hours || !Array.isArray(hours)) return null;

    const currentDay = getCurrentDayOfWeek();
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const dayOrder: DayOfWeek[] = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ];

    const currentDayIndex = dayOrder.indexOf(currentDay);
    if (currentDayIndex === -1) return null;

    for (let i = 0; i < 7; i++) {
      const dayIndex = (currentDayIndex + i) % 7;
      const day = dayOrder[dayIndex];
      const dayHours = hours.find((h) => h?.dayOfWeek === day && !h?.isClosed);

      if (!dayHours || !dayHours.openTime) continue;

      const [h, m] = dayHours.openTime.split(":").map(Number);
      const openTime = (h || 0) * 60 + (m || 0);

      if (i === 0 && currentTime < openTime) {
        return `Today at ${dayHours.openTime}`;
      }
      if (i === 1) {
        return `Tomorrow at ${dayHours.openTime}`;
      }
      if (i > 0) {
        return `${day.charAt(0) + day.slice(1).toLowerCase()} at ${dayHours.openTime}`;
      }
    }

    return null;
  } catch {
    return null;
  }
};

export const formatBusinessHours = (
  hours: BusinessHours[] = []
): BusinessHoursDisplay[] => {
  if (!hours || !Array.isArray(hours)) return [];
  return hours.map((hour) => ({
    ...hour,
    isOpenNow: false,
    nextOpenTime: undefined,
  }));
};

export const formatDate = (date: Date | string): string => {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return "Invalid date";
  }
};

export const getRelativeTime = (date: Date | string): string => {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
    return `${Math.floor(diff / 31536000)} years ago`;
  } catch {
    return "Unknown";
  }
};

// ===========================
// Price Utilities
// ===========================

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

export const getPriceRangeLabel = (priceRange: PriceRange | null): string => {
  const ranges: Record<PriceRange, string> = {
    BUDGET: "₹ (Budget-Friendly)",
    MODERATE: "₹₹ (Moderate)",
    EXPENSIVE: "₹₹₹ (Expensive)",
    LUXURY: "₹₹₹₹ (Luxury)",
  };
  return priceRange ? ranges[priceRange] : "Price not specified";
};

export const calculatePriceRange = (
  items: MenuItem[] = []
): string => {
  if (!items || !Array.isArray(items) || items.length === 0) return "Price varies";

  const prices = items
    .map((i) => i.discountedPrice ?? i.price ?? 0)
    .filter(p => !isNaN(p) && p > 0);

  if (prices.length === 0) return "Price varies";
  if (prices.length === 1) return formatPrice(prices[0]);

  return `${formatPrice(Math.min(...prices))} - ${formatPrice(Math.max(...prices))}`;
};

// ===========================
// Gallery Utilities
// ===========================

export const convertToGalleryImages = (
  businessImages: BusinessImage[] = [],
  userPhotos: Photo[] = []
): GalleryImage[] => {
  const safeBusinessImages = Array.isArray(businessImages) ? businessImages : [];
  const safeUserPhotos = Array.isArray(userPhotos) ? userPhotos : [];

  const businessGallery = safeBusinessImages.map((img) => ({
    id: img.id,
    url: img.imageUrl,
    thumbnailUrl: img.thumbnailUrl,
    caption: img.caption,
    altText: img.altText,
    width: img.width,
    height: img.height,
    type: "business" as const,
    uploadedBy: img.uploadedById || null,
    createdAt: img.createdAt || new Date(),
  }));

  const userGallery = safeUserPhotos
    .filter((p) => p && p.isApproved && !p.isFlagged)
    .map((p) => ({
      id: p.id,
      url: p.url,
      thumbnailUrl: p.thumbnailUrl,
      caption: p.caption,
      altText: null,
      width: p.width,
      height: p.height,
      type: "user" as const,
      uploadedBy: p.userId,
      createdAt: p.createdAt || new Date(),
    }));

  return [...businessGallery, ...userGallery];
};

// ===========================
// Menu Utilities
// ===========================

export const filterMenuItems = (
  items: MenuItem[] = [],
  filter: MenuItemFilter
): MenuItem[] => {
  if (!items || !Array.isArray(items)) return [];
  switch (filter) {
    case "available":
      return items.filter((i) => i.isAvailable);
    case "featured":
      return items.filter((i) => i.isFeatured);
    case "bestseller":
      return items.filter((i) => i.isBestseller);
    default:
      return items;
  }
};

export const sortMenuItems = (
  items: MenuItem[] = [],
  sort: MenuItemSort
): MenuItem[] => {
  if (!items || !Array.isArray(items)) return [];
  const sorted = [...items];
  switch (sort) {
    case "price-low":
      return sorted.sort((a, b) => (a.discountedPrice ?? a.price ?? 0) - (b.discountedPrice ?? b.price ?? 0));
    case "price-high":
      return sorted.sort((a, b) => (b.discountedPrice ?? b.price ?? 0) - (a.discountedPrice ?? a.price ?? 0));
    case "popular":
      return sorted.sort((a, b) => (b.totalOrders ?? 0) - (a.totalOrders ?? 0));
    case "name":
      return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    default:
      return sorted.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }
};

export const groupMenuItemsByCategory = (
  items: MenuItem[] = []
): Record<string, MenuItem[]> => {
  if (!items || !Array.isArray(items)) return {};
  return items.reduce((acc, item) => {
    if (!item) return acc;
    const category = item.category || "Other";
    acc[category] = acc[category] || [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
};

// ===========================
// Review Utilities
// ===========================

export const filterReviews = (
  reviews: ReviewDisplay[] = [],
  filter: ReviewFilter
): ReviewDisplay[] => {
  if (!reviews || !Array.isArray(reviews)) return [];
  switch (filter) {
    case "with-photos":
      return reviews.filter((r) => (r.photos?.length ?? 0) > 0);
    case "5star":
      return reviews.filter((r) => r.rating === 5);
    case "4star":
      return reviews.filter((r) => r.rating === 4);
    case "3star":
      return reviews.filter((r) => r.rating === 3);
    case "2star":
      return reviews.filter((r) => r.rating === 2);
    case "1star":
      return reviews.filter((r) => r.rating === 1);
    default:
      return reviews;
  }
};

export const sortReviews = (
  reviews: ReviewDisplay[] = [],
  sort: ReviewSort
): ReviewDisplay[] => {
  if (!reviews || !Array.isArray(reviews)) return [];
  const sorted = [...reviews];
  return sort === "recent"
    ? sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    : sorted;
};

// ===========================
// Stats Utilities
// ===========================

export const calculateBusinessStats = (
  business: BusinessDetail | null | undefined
): BusinessStats => {
  if (!business) {
    return {
      totalReviews: 0,
      averageRating: 0,
      totalPhotos: 0,
      totalProducts: 0,
      totalServices: 0,
      totalStaff: 0,
      priceRange: null,
    };
  }

  const safeMenuItems = Array.isArray(business.menuItems) ? business.menuItems : [];

  return {
    totalReviews: business._count?.reviews ?? business.totalReviews ?? 0,
    averageRating: business.averageRating ?? 0,
    totalPhotos: business._count?.photos ?? business.totalPhotos ?? 0,
    totalProducts: safeMenuItems.filter((i) => i.itemType === "PRODUCT").length,
    totalServices: safeMenuItems.filter((i) => i.itemType === "SERVICE").length,
    totalStaff: business._count?.staff ?? business.staff?.length ?? 0,
    priceRange: business.priceRange || null,
  };
};

export const calculateRatingBreakdown = (
  reviews: ReviewDisplay[] | undefined | null
): Record<number, number> => {
  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (!reviews || !Array.isArray(reviews)) return breakdown;

  reviews.forEach((review) => {
    const rating = review.rating || 0;
    if (rating >= 1 && rating <= 5) {
      breakdown[rating] = (breakdown[rating] || 0) + 1;
    }
  });

  return breakdown;
};

// ===========================
// SEO Utilities
// ===========================

export const generatePageTitle = (business: BusinessDetail | null | undefined): string => {
  if (!business) return "Business Details";
  const category = business.categories?.[0]?.category?.name || "Business";
  return business.metaTitle ?? `${business.name} - ${category} in ${business.city}`;
};

export const generatePageDescription = (business: BusinessDetail | null | undefined): string => {
  if (!business) return "Find the best local businesses.";
  return (
    business.metaDescription ??
    `${business.shortDescription ?? business.name} in ${business.city}`
  );
};

// ===========================
// Location Utilities
// ===========================

export const formatShortAddress = (
  business: Pick<BusinessDetail, "addressLine1" | "city" | "state"> | null | undefined
): string => {
  if (!business) return "";
  if (business.addressLine1 && business.city) {
    return `${business.addressLine1}, ${business.city}`;
  }
  return `${business.city || ""}, ${business.state || ""}`.replace(/^, |, $/g, "");
};

export const formatFullAddress = (
  business: BusinessDetail | null | undefined
): string => {
  if (!business) return "";
  const parts = [
    business.addressLine1,
    business.addressLine2,
    business.landmark ? `Near ${business.landmark}` : null,
    business.area,
    business.city,
    business.state,
    business.pincode ? `- ${business.pincode}` : null,
  ];
  return parts.filter(Boolean).join(", ");
};

// ===========================
// Contact & Action Utilities
// ===========================

export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return "";
  // Basic formatting, can be enhanced
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
};

export const generateWhatsAppURL = (
  phone: string | null | undefined,
  text: string = "Hi, I found your business on Yelp clone."
): string => {
  if (!phone) return "#";
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

export const generateCallURL = (phone: string | null | undefined): string => {
  if (!phone) return "#";
  return `tel:${phone}`;
};

export const generateGoogleMapsURL = ({
  latitude,
  longitude,
  businessName,
  address,
}: {
  latitude: number | undefined;
  longitude: number | undefined;
  businessName?: string;
  address?: string;
}): string => {
  if (latitude === undefined || longitude === undefined) return "#";
  const query = businessName
    ? `${businessName}, ${address || ""}`
    : `${latitude},${longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
};

// ===========================
// Validation Utilities
// ===========================

export const isValidBusiness = (business: BusinessDetail | null | undefined): boolean => {
  if (!business) return false;
  return !!(business.id && business.slug && business.name);
};
