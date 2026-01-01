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
  business: BusinessDetail,
  hours: BusinessHours[] = []
): boolean => {
  try {
    if (business.is24x7) return true;
    if (business.isTemporarilyClosed) return false;

    const now = new Date();
    const currentDay = getCurrentDayOfWeek();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = hours.find(
      (h) => h.dayOfWeek === currentDay && !h.isClosed
    );
    if (!todayHours) return false;

    const parseTime = (timeStr: string): number => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const openTime = parseTime(todayHours.openTime);
    const closeTime = parseTime(todayHours.closeTime);

    if (closeTime < openTime) {
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

    for (let i = 0; i < 7; i++) {
      const dayIndex = (currentDayIndex + i) % 7;
      const day = dayOrder[dayIndex];
      const dayHours = hours.find((h) => h.dayOfWeek === day && !h.isClosed);
      if (!dayHours) continue;

      const [h, m] = dayHours.openTime.split(":").map(Number);
      const openTime = h * 60 + m;

      if (i === 0 && currentTime < openTime) {
        return `Today at ${dayHours.openTime}`;
      }
      if (i === 1) {
        return `Tomorrow at ${dayHours.openTime}`;
      }
      return `${day.charAt(0) + day.slice(1).toLowerCase()} at ${dayHours.openTime}`;
    }

    return null;
  } catch {
    return null;
  }
};

export const formatBusinessHours = (
  hours: BusinessHours[] = []
): BusinessHoursDisplay[] => {
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
  if (items.length === 0) return "Price varies";

  const prices = items.map((i) => i.discountedPrice ?? i.price);
  return `${formatPrice(Math.min(...prices))} - ${formatPrice(Math.max(...prices))}`;
};

// ===========================
// Gallery Utilities
// ===========================

export const convertToGalleryImages = (
  businessImages: BusinessImage[] = [],
  userPhotos: Photo[] = []
): GalleryImage[] => {
  const businessGallery = businessImages.map((img) => ({
    id: img.id,
    url: img.imageUrl,
    thumbnailUrl: img.thumbnailUrl,
    caption: img.caption,
    altText: img.altText,
    width: img.width,
    height: img.height,
    type: "business" as const,
    uploadedBy: img.uploadedById || null,
    createdAt: img.createdAt,
  }));

  const userGallery = userPhotos
    .filter((p) => p.isApproved && !p.isFlagged)
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
      createdAt: p.createdAt,
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
  const sorted = [...items];
  switch (sort) {
    case "price-low":
      return sorted.sort((a, b) => (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price));
    case "price-high":
      return sorted.sort((a, b) => (b.discountedPrice ?? b.price) - (a.discountedPrice ?? a.price));
    case "popular":
      return sorted.sort((a, b) => b.totalOrders - a.totalOrders);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }
};

export const groupMenuItemsByCategory = (
  items: MenuItem[] = []
): Record<string, MenuItem[]> => {
  return items.reduce((acc, item) => {
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
  const sorted = [...reviews];
  return sort === "recent"
    ? sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    : sorted;
};

// ===========================
// Stats Utilities
// ===========================

export const calculateBusinessStats = (
  business: BusinessDetail
): BusinessStats => {
  return {
    totalReviews: business._count?.reviews ?? business.totalReviews ?? 0,
    averageRating: business.averageRating ?? 0,
    totalPhotos: business._count?.photos ?? business.totalPhotos ?? 0,
    totalProducts: (business.menuItems ?? []).filter(i => i.itemType === "PRODUCT").length,
    totalServices: (business.menuItems ?? []).filter(i => i.itemType === "SERVICE").length,
    totalStaff: business._count?.staff ?? business.staff?.length ?? 0,
    priceRange: business.priceRange,
  };
};

// ===========================
// SEO Utilities
// ===========================

export const generatePageTitle = (business: BusinessDetail): string => {
  const category = business.categories?.[0]?.category?.name || "Business";
  return business.metaTitle ?? `${business.name} - ${category} in ${business.city}`;
};

export const generatePageDescription = (business: BusinessDetail): string => {
  return (
    business.metaDescription ??
    `${business.shortDescription ?? business.name} in ${business.city}`
  );
};
