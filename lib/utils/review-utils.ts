// lib/utils/review-utils.ts

import { ReviewVerificationStatus } from "@prisma/client";
import { ReviewPermissions, ReviewWithDetails } from "@/types/review/review";

// ============================================
// EDIT PERMISSION CHECKER
// ============================================

/**
 * Checks if a review can be edited based on 24-hour window
 * @param editableUntil - The datetime until which review is editable
 * @returns ReviewPermissions object with edit status
 */
export function canEditReview(editableUntil: Date | string | null): ReviewPermissions {
  if (!editableUntil) {
    return {
      canEdit: false,
      canDelete: false,
      reason: "Edit window has expired",
    };
  }

  const editDate = typeof editableUntil === "string" ? new Date(editableUntil) : editableUntil;

  if (!(editDate instanceof Date) || isNaN(editDate.getTime())) {
    return {
      canEdit: false,
      canDelete: false,
      reason: "Invalid edit window date",
    };
  }

  const now = new Date();
  const timeRemaining = editDate.getTime() - now.getTime();

  if (timeRemaining <= 0) {
    return {
      canEdit: false,
      canDelete: false,
      editTimeRemaining: 0,
      reason: "24-hour edit window has expired",
    };
  }

  return {
    canEdit: true,
    canDelete: false, // Users cannot delete reviews
    editTimeRemaining: timeRemaining,
  };
}

// ============================================
// EDIT TIME REMAINING FORMATTER
// ============================================

/**
 * Formats remaining edit time in human-readable format
 * @param milliseconds - Time remaining in milliseconds
 * @returns Formatted string like "23 hours" or "5 minutes"
 */
export function formatEditTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return "Expired";

  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

// ============================================
// VERIFICATION STATUS BADGE
// ============================================

/**
 * Returns display info for verification status badge
 */
export function getVerificationBadgeInfo(status: ReviewVerificationStatus) {
  switch (status) {
    case "PHOTO_VERIFIED":
      return {
        label: "Photo Verified",
        variant: "secondary" as const,
        description: "Reviewer provided photo verification",
      };
    case "MANUALLY_VERIFIED":
      return {
        label: "Verified Review",
        variant: "default" as const,
        description: "Manually verified by admin",
      };
    case "UNVERIFIED":
    default:
      return {
        label: "Unverified",
        variant: "outline" as const,
        description: "Review pending verification",
      };
  }
}

// ============================================
// RATING CALCULATION
// ============================================

/**
 * Calculates average of provided dimensional ratings
 */
export function calculateAverageDimensionalRating(
  foodRating?: number | null,
  serviceRating?: number | null,
  ambienceRating?: number | null,
  valueRating?: number | null
): number {
  const ratings = [foodRating, serviceRating, ambienceRating, valueRating].filter(
    (r): r is number => r !== null && r !== undefined
  );

  if (ratings.length === 0) return 0;

  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal
}

// ============================================
// HELPFUL VOTE PERCENTAGE
// ============================================

/**
 * Calculates percentage of helpful votes
 */
export function calculateHelpfulPercentage(
  helpfulCount: number,
  totalVotes: number
): number {
  if (totalVotes === 0) return 0;
  return Math.round((helpfulCount / totalVotes) * 100);
}

// ============================================
// CHECK IF USER CAN REVIEW
// ============================================

/**
 * Determines if user can create a review for a business
 */
export function canUserReview(
  existingReview: ReviewWithDetails | null | undefined,
  isAuthenticated: boolean,
  isEmailVerified: boolean
): { canReview: boolean; reason?: string } {
  if (!isAuthenticated) {
    return { canReview: false, reason: "You must be signed in to leave a review" };
  }

  if (!isEmailVerified) {
    return { canReview: false, reason: "Please verify your email before leaving a review" };
  }

  if (existingReview) {
    return { canReview: false, reason: "You have already reviewed this business" };
  }

  return { canReview: true };
}

// ============================================
// SORT REVIEWS
// ============================================

/**
 * Returns Prisma orderBy config based on sort option
 */
export function getReviewSortConfig(sortBy: string) {
  switch (sortBy) {
    case "highest":
      return { rating: "desc" as const };
    case "lowest":
      return { rating: "asc" as const };
    case "helpful":
      return { helpfulCount: "desc" as const };
    case "recent":
    default:
      return { createdAt: "desc" as const };
  }
}
