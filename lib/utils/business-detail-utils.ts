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

/**
 * Get current day of week matching DayOfWeek enum
 */
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

/**
 * Check if business is currently open
 */
export const isBusinessOpenNow = (
  business: BusinessDetail,
  hours: BusinessHours[]
): boolean => {
  try {
    // 24/7 businesses are always open
    if (business.is24x7) return true;

    // Check temporary closure
    if (business.isTemporarilyClosed) return false;

    const now = new Date();
    const currentDay = getCurrentDayOfWeek();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

    // Find today's hours
    const todayHours = hours.find(
      (h) => h.dayOfWeek === currentDay && !h.isClosed
    );

    if (!todayHours) return false;

    // Parse time strings (format: "HH:MM")
    const parseTime = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const openTime = parseTime(todayHours.openTime);
    const closeTime = parseTime(todayHours.closeTime);

    // Handle overnight hours (e.g., 22:00 - 02:00)
    if (closeTime < openTime) {
      return currentTime >= openTime || currentTime <= closeTime;
    }

    return currentTime >= openTime && currentTime <= closeTime;
  } catch (error) {
    console.error("[isBusinessOpenNow] Error:", error);
    return false;
  }
};

/**
 * Get next opening time
 */
export const getNextOpeningTime = (
  hours: BusinessHours[]
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

    // Check remaining days in the week
    for (let i = 0; i < 7; i++) {
      const dayIndex = (currentDayIndex + i) % 7;
      const day = dayOrder[dayIndex];
      const dayHours = hours.find((h) => h.dayOfWeek === day && !h.isClosed);

      if (!dayHours) continue;

      const parseTime = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const openTime = parseTime(dayHours.openTime);

      // If it's today and opening time hasn't passed
      if (i === 0 && currentTime < openTime) {
        return `Today at ${dayHours.openTime}`;
      }

      // If it's tomorrow
      if (i === 1) {
        return `Tomorrow at ${dayHours.openTime}`;
      }

      // Return day name
      if (i > 1) {
        return `${day.charAt(0) + day.slice(1).toLowerCase()} at ${dayHours.openTime}`;
      }
    }

    return null;
  } catch (error) {
    console.error("[getNextOpeningTime] Error:", error);
    return null;
  }
};

/**
 * Format business hours for display
 */
export const formatBusinessHours = (
  hours: BusinessHours[]
): BusinessHoursDisplay[] => {
  try {
    return hours.map((hour) => ({
      ...hour,
      isOpenNow: false, // Will be calculated in component
      nextOpenTime: undefined,
    }));
  } catch (error) {
    console.error("[formatBusinessHours] Error:", error);
    return [];
  }
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | string): string => {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch (error) {
    console.error("[formatDate] Error:", error);
    return "Invalid date";
  }
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: Date | string): string => {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  } catch (error) {
    console.error("[getRelativeTime] Error:", error);
    return "Unknown";
  }
};

// ===========================
// Price & Currency Utilities
// ===========================

/**
 * Format price in Indian Rupees
 */
export const formatPrice = (price: number): string => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  } catch (error) {
    console.error("[formatPrice] Error:", error);
    return `₹${price}`;
  }
};

/**
 * Get price range label
 */
export const getPriceRangeLabel = (priceRange: PriceRange | null): string => {
  const ranges: Record<PriceRange, string> = {
    BUDGET: "₹ (Budget-Friendly)",
    MODERATE: "₹₹ (Moderate)",
    EXPENSIVE: "₹₹₹ (Expensive)",
    LUXURY: "₹₹₹₹ (Luxury)",
  };
  return priceRange ? ranges[priceRange] : "Price not specified";
};

/**
 * Calculate price range from menu items
 */
export const calculatePriceRange = (items: MenuItem[]): string => {
  try {
    if (items.length === 0) return "Price varies";

    const prices = items.map((item) => item.discountedPrice || item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) return formatPrice(minPrice);
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  } catch (error) {
    console.error("[calculatePriceRange] Error:", error);
    return "Price varies";
  }
};

// ===========================
// Contact & URL Utilities
// ===========================

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  try {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, "");

    // Format as +91 XXXXX XXXXX
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }

    if (cleaned.length === 12 && cleaned.startsWith("91")) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }

    return phone;
  } catch (error) {
    console.error("[formatPhoneNumber] Error:", error);
    return phone;
  }
};

/**
 * Generate WhatsApp URL with message
 */
export const generateWhatsAppURL = (
  phoneNumber: string,
  businessName: string
): string => {
  try {
    const cleaned = phoneNumber.replace(/\D/g, "");
    const phone = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
    const message = encodeURIComponent(
      `Hi ${businessName}, I found you on your business listing and would like to know more about your services.`
    );
    return `https://wa.me/${phone}?text=${message}`;
  } catch (error) {
    console.error("[generateWhatsAppURL] Error:", error);
    return `https://wa.me/${phoneNumber}`;
  }
};

/**
 * Generate Google Maps URL
 */
export const generateGoogleMapsURL = (location: MapLocation): string => {
  try {
    const { latitude, longitude, businessName } = location;
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(businessName)}`;
  } catch (error) {
    console.error("[generateGoogleMapsURL] Error:", error);
    return "https://maps.google.com";
  }
};

/**
 * Generate phone call URL
 */
export const generateCallURL = (phoneNumber: string): string => {
  try {
    const cleaned = phoneNumber.replace(/\D/g, "");
    return `tel:+91${cleaned}`;
  } catch (error) {
    console.error("[generateCallURL] Error:", error);
    return `tel:${phoneNumber}`;
  }
};

/**
 * Generate share URL
 */
export const generateShareURL = (slug: string): string => {
  try {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/business_service/${slug}`;
    }
    return `/business_service/${slug}`;
  } catch (error) {
    console.error("[generateShareURL] Error:", error);
    return `/business_service/${slug}`;
  }
};

// ===========================
// Gallery Utilities
// ===========================

/**
 * Convert business images to gallery format
 */
export const convertToGalleryImages = (
  businessImages: BusinessImage[],
  userPhotos: Photo[]
): GalleryImage[] => {
  try {
    const businessGallery: GalleryImage[] = businessImages.map((img) => ({
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

    const userGallery: GalleryImage[] = userPhotos
      .filter((photo) => photo.isApproved && !photo.isFlagged)
      .map((photo) => ({
        id: photo.id,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        caption: photo.caption,
        altText: null,
        width: photo.width,
        height: photo.height,
        type: "user" as const,
        uploadedBy: photo.userId,
        createdAt: photo.createdAt,
      }));

    return [...businessGallery, ...userGallery];
  } catch (error) {
    console.error("[convertToGalleryImages] Error:", error);
    return [];
  }
};

/**
 * Get optimized image URL (placeholder for future Cloudinary optimization)
 */
export const getOptimizedImageURL = (
  url: string,
  width?: number,
  quality?: number
): string => {
  try {
    // TODO: Implement Cloudinary transformation
    // For now, return original URL
    return url;
  } catch (error) {
    console.error("[getOptimizedImageURL] Error:", error);
    return url;
  }
};

// ===========================
// Menu Item Utilities
// ===========================

/**
 * Filter menu items
 */
export const filterMenuItems = (
  items: MenuItem[],
  filter: MenuItemFilter
): MenuItem[] => {
  try {
    switch (filter) {
      case "available":
        return items.filter((item) => item.isAvailable);
      case "featured":
        return items.filter((item) => item.isFeatured);
      case "bestseller":
        return items.filter((item) => item.isBestseller);
      case "all":
      default:
        return items;
    }
  } catch (error) {
    console.error("[filterMenuItems] Error:", error);
    return items;
  }
};

/**
 * Sort menu items
 */
export const sortMenuItems = (
  items: MenuItem[],
  sort: MenuItemSort
): MenuItem[] => {
  try {
    const sorted = [...items];

    switch (sort) {
      case "price-low":
        return sorted.sort(
          (a, b) =>
            (a.discountedPrice || a.price) - (b.discountedPrice || b.price)
        );
      case "price-high":
        return sorted.sort(
          (a, b) =>
            (b.discountedPrice || b.price) - (a.discountedPrice || a.price)
        );
      case "popular":
        return sorted.sort((a, b) => b.totalOrders - a.totalOrders);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "default":
      default:
        return sorted.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
  } catch (error) {
    console.error("[sortMenuItems] Error:", error);
    return items;
  }
};

/**
 * Group menu items by category
 */
export const groupMenuItemsByCategory = (
  items: MenuItem[]
): Record<string, MenuItem[]> => {
  try {
    return items.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  } catch (error) {
    console.error("[groupMenuItemsByCategory] Error:", error);
    return {};
  }
};

// ===========================
// Review Utilities
// ===========================

/**
 * Calculate rating breakdown
 */
export const calculateRatingBreakdown = (
  reviews: Review[]
): Record<number, number> => {
  try {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        breakdown[review.rating as keyof typeof breakdown]++;
      }
    });

    return breakdown;
  } catch (error) {
    console.error("[calculateRatingBreakdown] Error:", error);
    return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  }
};

/**
 * Filter reviews
 */
export const filterReviews = (
  reviews: ReviewDisplay[],
  filter: ReviewFilter
): ReviewDisplay[] => {
  try {
    switch (filter) {
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
      case "with-photos":
        return reviews.filter((r) => r.photos.length > 0);
      case "all":
      default:
        return reviews;
    }
  } catch (error) {
    console.error("[filterReviews] Error:", error);
    return reviews;
  }
};

/**
 * Sort reviews
 */
export const sortReviews = (
  reviews: ReviewDisplay[],
  sort: ReviewSort
): ReviewDisplay[] => {
  try {
    const sorted = [...reviews];

    switch (sort) {
      case "helpful":
        return sorted.sort((a, b) => b.helpfulCount - a.helpfulCount);
      case "rating-high":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "rating-low":
        return sorted.sort((a, b) => a.rating - b.rating);
      case "recent":
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  } catch (error) {
    console.error("[sortReviews] Error:", error);
    return reviews;
  }
};

// ===========================
// Statistics Utilities
// ===========================

/**
 * Calculate business statistics
 */
export const calculateBusinessStats = (
  business: BusinessDetail
): BusinessStats => {
  try {
    return {
      totalReviews: business._count?.reviews || business.totalReviews,
      averageRating: business.averageRating || 0,
      totalPhotos: business._count?.photos || business.totalPhotos,
      totalProducts: business.menuItems.filter((item) => item.itemType === "PRODUCT")
        .length,
      totalServices: business.menuItems.filter((item) => item.itemType === "SERVICE")
        .length,
      totalStaff: business._count?.staff || business.staff.length,
      priceRange: business.priceRange,
    };
  } catch (error) {
    console.error("[calculateBusinessStats] Error:", error);
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
};

// ===========================
// Address Utilities
// ===========================

/**
 * Format full address
 */
export const formatFullAddress = (business: BusinessDetail): string => {
  try {
    const parts = [
      business.addressLine1,
      business.addressLine2,
      business.area,
      business.city,
      business.state,
      business.pincode,
    ].filter(Boolean);

    return parts.join(", ");
  } catch (error) {
    console.error("[formatFullAddress] Error:", error);
    return "Address not available";
  }
};

/**
 * Format short address (for mobile view)
 */
export const formatShortAddress = (business: BusinessDetail): string => {
  try {
    return `${business.area || business.city}, ${business.city}`;
  } catch (error) {
    console.error("[formatShortAddress] Error:", error);
    return business.city;
  }
};

// ===========================
// Validation Utilities
// ===========================

/**
 * Check if business has valid data
 */
export const isValidBusiness = (business: BusinessDetail | null): boolean => {
  if (!business) return false;
  return Boolean(business.id && business.name && business.slug);
};

/**
 * Check if business is claimable
 */
export const isBusinessClaimable = (business: BusinessDetail): boolean => {
  return business.status === "UNCLAIMED";
};

/**
 * Check if business accepts online orders
 */
export const acceptsOnlineOrders = (business: BusinessDetail): boolean => {
  return business.acceptsOrders && business.offersOnline;
};

// ===========================
// SEO Utilities
// ===========================

/**
 * Generate page title for SEO
 */
export const generatePageTitle = (business: BusinessDetail): string => {
  try {
    if (business.metaTitle) return business.metaTitle;

    const category = business.categories[0]?.category?.name || "Business";
    return `${business.name} - ${category} in ${business.city} | Best ${category} Near You`;
  } catch (error) {
    console.error("[generatePageTitle] Error:", error);
    return business.name;
  }
};

/**
 * Generate page description for SEO
 */
export const generatePageDescription = (business: BusinessDetail): string => {
  try {
    if (business.metaDescription) return business.metaDescription;

    const shortDesc =
      business.shortDescription || business.description?.slice(0, 150);
    const address = `${business.area}, ${business.city}`;

    return `${shortDesc || business.name} located at ${address}. ⭐ ${business.averageRating}/5 from ${business.totalReviews} reviews. Contact: ${business.phone}`;
  } catch (error) {
    console.error("[generatePageDescription] Error:", error);
    return `Visit ${business.name} in ${business.city}`;
  }
};
