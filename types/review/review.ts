// types/reviews.ts

import { ReviewVerificationStatus, ReviewStatus } from "@prisma/client";

// ============================================
// REVIEW SUBMISSION TYPES
// ============================================

export interface CreateReviewInput {
  businessId: string;
  rating: number;
  title?: string;
  content: string;
  visitDate?: Date;
  visitType?: string;
  orderId?: string;
  bookingId?: string;
  foodRating?: number;
  serviceRating?: number;
  ambienceRating?: number;
  valueRating?: number;
  photos?: File[];
  captchaToken: string;
}

export interface UpdateReviewInput {
  reviewId: string;
  rating?: number;
  title?: string;
  content?: string;
  foodRating?: number;
  serviceRating?: number;
  ambienceRating?: number;
  valueRating?: number;
  photos?: File[];
  captchaToken: string;
}

// ============================================
// REVIEW RESPONSE TYPES
// ============================================

export interface ReviewWithDetails {
  id: string;
  businessId: string;
  userId: string;
  rating: number;
  title: string | null;
  content: string | null;
  status: ReviewStatus;
  verificationStatus: ReviewVerificationStatus;
  visitDate: Date | null;
  foodRating: number | null;
  serviceRating: number | null;
  ambienceRating: number | null;
  valueRating: number | null;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  totalVotes: number;
  isPublished: boolean;
  publishedAt: Date | null;
  editableUntil: Date | null;
  lastEditedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
  photos: Array<{
    id: string;
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
  }>;
  userVote?: {
    isHelpful: boolean;
  } | null;
}

// ============================================
// HELPFUL VOTE TYPES
// ============================================

export interface HelpfulVoteInput {
  reviewId: string;
  isHelpful: boolean;
}

export interface HelpfulVoteResponse {
  success: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  userVote: {
    isHelpful: boolean;
  };
}

// ============================================
// REVIEW FILTERS & SORTING
// ============================================

export type ReviewSortBy = "recent" | "highest" | "lowest" | "helpful";
export type ReviewFilterRating = "all" | "5" | "4" | "3" | "2" | "1";

export interface ReviewFilters {
  businessId: string;
  sortBy?: ReviewSortBy;
  filterRating?: ReviewFilterRating;
  userId?: string; // For checking if user already reviewed
  page?: number;
  limit?: number;
}

export interface ReviewsResponse {
  reviews: ReviewWithDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  userReview?: ReviewWithDetails | null; // User's own review for this business
  canCreateReview: boolean; // Whether current user can create a review
}

// ============================================
// REVIEW PERMISSIONS
// ============================================

export interface ReviewPermissions {
  canEdit: boolean;
  canDelete: boolean;
  editTimeRemaining?: number; // milliseconds remaining
  reason?: string;
}

// ============================================
// CAPTCHA VERIFICATION
// ============================================

export interface CaptchaVerificationResult {
  success: boolean;
  error?: string;
}

// types/reviews.ts
// Add these types at the bottom

// ============================================
// REVIEW RESPONSE TYPES
// ============================================

export interface CreateResponseInput {
  reviewId: string;
  content: string;
}

export interface UpdateResponseInput {
  responseId: string;
  content: string;
}

export interface ReviewResponseWithDetails {
  id: string;
  reviewId: string;
  content: string;
  isEdited: boolean;
  editedAt: Date | null;
  editableUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
}

// ============================================
// BUSINESS REVIEW DASHBOARD TYPES
// ============================================

export interface BusinessReviewWithDetails extends ReviewWithDetails {
  response: ReviewResponseWithDetails | null;
  // Add reviewer contact info (private to business owner)
  reviewerEmail?: string;
  reviewerPhone?: string;
}

export interface BusinessReviewFilters {
  businessId: string;
  rating?: number;
  hasResponse?: boolean;
  sortBy?: "recent" | "oldest" | "highest" | "lowest" | "needsResponse";
  page?: number;
  limit?: number;
}

export interface BusinessReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  responseRate: number;
  reviewsNeedingResponse: number;
}

// ============================================
// REPORT REVIEW TYPES
// ============================================

export interface ReportReviewInput {
  reviewId: string;
  reason: string;
  category: "SPAM" | "FAKE" | "OFFENSIVE" | "IRRELEVANT" | "OTHER";
  description?: string;
}

