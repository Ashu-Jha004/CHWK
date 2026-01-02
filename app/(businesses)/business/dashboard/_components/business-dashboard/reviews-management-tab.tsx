// components/business-dashboard/reviews-management-tab.tsx

"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  Shield,
  Clock,
  Edit,
  Flag,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDate, getRelativeTime } from "@/lib/utils/business-detail-utils";
import { canEditReview, formatEditTimeRemaining, getVerificationBadgeInfo } from "@/lib/utils/review-utils";
import { ResponseForm } from "./response-form";
import { EditResponseDialog } from "./edit-response-dialog";
import { ReportReviewDialog } from "./report-review-dialog";
import type { BusinessReviewWithDetails, BusinessReviewStats } from "@/types/review/review";

// ============================================
// COMPONENT PROPS
// ============================================
interface ReviewsManagementTabProps {
  businessId: string;
}

// ============================================
// MAIN COMPONENT
// ============================================
export function ReviewsManagementTab({ businessId }: ReviewsManagementTabProps) {
  // ============================================
  // STATE
  // ============================================
  const [rating, setRating] = useState<string>("all");
  const [hasResponse, setHasResponse] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [page, setPage] = useState(1);
  const [respondingToReview, setRespondingToReview] = useState<string | null>(null);
  const [editingResponse, setEditingResponse] = useState<BusinessReviewWithDetails["response"] | null>(null);
  const [reportingReview, setReportingReview] = useState<string | null>(null);

  // ============================================
  // FETCH REVIEWS
  // ============================================
  const {
    data: reviewsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["business-reviews", businessId, rating, hasResponse, sortBy, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        businessId,
        sortBy,
        page: page.toString(),
        limit: "20",
      });

      if (rating !== "all") params.append("rating", rating);
      if (hasResponse !== "all") params.append("hasResponse", hasResponse);

      const response = await fetch(`/api/reviews/business?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      return response.json();
    },
  });

  const reviews = reviewsData?.reviews || [];
  const stats: BusinessReviewStats = reviewsData?.stats || {
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    responseRate: 0,
    reviewsNeedingResponse: 0,
  };
  const pagination = reviewsData?.pagination || { total: 0, page: 1, totalPages: 1 };

  // ============================================
  // HANDLERS
  // ============================================
  const handleResponseSuccess = useCallback(() => {
    setRespondingToReview(null);
    refetch();
  }, [refetch]);

  // ============================================
  // RENDER: LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR STATE
  // ============================================
  if (error) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Failed to Load Reviews</h3>
        <p className="text-muted-foreground mb-6">
          {error instanceof Error ? error.message : "Something went wrong"}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </Card>
    );
  }

  // ============================================
  // RENDER: MAIN UI
  // ============================================
  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Review Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Reviews */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Total Reviews</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalReviews}</p>
          </div>

          {/* Average Rating */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span className="text-sm">Average Rating</span>
            </div>
            <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
          </div>

          {/* Response Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Response Rate</span>
            </div>
            <p className="text-3xl font-bold">{stats.responseRate}%</p>
          </div>

          {/* Needs Response */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Needs Response</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              {stats.reviewsNeedingResponse}
            </p>
          </div>
        </div>

        {/* Rating Breakdown */}
        <Separator className="my-4" />
        <div className="space-y-2">
          <h4 className="text-sm font-medium mb-3">Rating Breakdown</h4>
          {[5, 4, 3, 2, 1].map((r) => (
            <div key={r} className="flex items-center gap-3">
              <span className="text-sm w-8">{r} ★</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: stats.totalReviews
                      ? `${(stats.ratingBreakdown[r as keyof typeof stats.ratingBreakdown] / stats.totalReviews) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-12 text-right">
                {stats.ratingBreakdown[r as keyof typeof stats.ratingBreakdown]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rating:</span>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Response Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Response:</span>
            <Select value={hasResponse} onValueChange={setHasResponse}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="false">Needs Response</SelectItem>
                <SelectItem value="true">Responded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
                <SelectItem value="needsResponse">Needs Response</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="ml-auto text-sm text-muted-foreground">
            Showing {reviews.length} of {pagination.total} reviews
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Reviews Found</h3>
          <p className="text-muted-foreground">
            {hasResponse !== "all" || rating !== "all"
              ? "Try adjusting your filters"
              : "Your business hasn't received any reviews yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review:any) => (
            <BusinessReviewCard
              key={review.id}
              review={review}
              isResponding={respondingToReview === review.id}
              onRespond={() => setRespondingToReview(review.id)}
              onCancelRespond={() => setRespondingToReview(null)}
              onResponseSuccess={handleResponseSuccess}
              onEditResponse={() => setEditingResponse(review.response)}
              onReport={() => setReportingReview(review.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Response Dialog */}
      {editingResponse && (
        <EditResponseDialog
          open={!!editingResponse}
          onOpenChange={(open) => !open && setEditingResponse(null)}
          responseId={editingResponse.id}
          currentContent={editingResponse.content}
          editableUntil={editingResponse.editableUntil}
        />
      )}

      {/* Report Review Dialog */}
      {reportingReview && (
        <ReportReviewDialog
          open={!!reportingReview}
          onOpenChange={(open) => !open && setReportingReview(null)}
          reviewId={reportingReview}
        />
      )}
    </div>
  );
}

// ============================================
// BUSINESS REVIEW CARD COMPONENT
// ============================================
interface BusinessReviewCardProps {
  review: BusinessReviewWithDetails;
  isResponding: boolean;
  onRespond: () => void;
  onCancelRespond: () => void;
  onResponseSuccess: () => void;
  onEditResponse: () => void;
  onReport: () => void;
}

function BusinessReviewCard({
  review,
  isResponding,
  onRespond,
  onCancelRespond,
  onResponseSuccess,
  onEditResponse,
  onReport,
}: BusinessReviewCardProps) {
  const verificationInfo = getVerificationBadgeInfo(review.verificationStatus);
  const editPermissions = canEditReview(review.response?.editableUntil || null);
  const hasResponse = !!review.response && !review.response.deletedAt;
  const canEdit = hasResponse && editPermissions.canEdit;

  return (
    <Card className="p-6 space-y-4">
      {/* Review Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {review.user.avatar ? (
              <Image
                src={review.user.avatar}
                alt={`${review.user.firstName || "User"}'s avatar`}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold text-lg">
                {(review.user.firstName?.[0] || "U").toUpperCase()}
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {review.user.firstName} {review.user.lastName}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= review.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {getRelativeTime(review.createdAt)}
              </span>
            </div>

            {/* Contact Info (Private) */}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {review.reviewerEmail && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{review.reviewerEmail}</span>
                </div>
              )}
              {review.reviewerPhone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{review.reviewerPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badges & Actions */}
        <div className="flex flex-col gap-2 items-end">
          {review.isVerifiedPurchase && (
            <Badge variant="secondary">Verified Purchase</Badge>
          )}
          <Badge variant={verificationInfo.variant} className="gap-1">
            <Shield className="h-3 w-3" />
            {verificationInfo.label}
          </Badge>
          {hasResponse && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Responded
            </Badge>
          )}
        </div>
      </div>

      {/* Review Title */}
      {review.title && <h4 className="font-semibold text-lg">{review.title}</h4>}

      {/* Review Content */}
      {review.content && (
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {review.content}
        </p>
      )}

      {/* Multi-dimensional Ratings */}
      {(review.foodRating ||
        review.serviceRating ||
        review.ambienceRating ||
        review.valueRating) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y">
          {review.foodRating && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Food</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-sm font-semibold">{review.foodRating}</span>
              </div>
            </div>
          )}
          {review.serviceRating && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Service</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-sm font-semibold">{review.serviceRating}</span>
              </div>
            </div>
          )}
          {review.ambienceRating && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Ambience</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-sm font-semibold">{review.ambienceRating}</span>
              </div>
            </div>
          )}
          {review.valueRating && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Value</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-sm font-semibold">{review.valueRating}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Photos */}
      {review.photos?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {review.photos.map((photo) => (
            <div
              key={photo.id}
              className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0"
            >
              <Image
                src={photo.url}
                alt={photo.caption || "Review photo"}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          ))}
        </div>
      )}

      {/* Business Response */}
      {hasResponse && review.response && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              Business Response
            </Badge>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(review.response.createdAt)}</span>
              {review.response.isEdited && <span>(edited)</span>}
            </div>
          </div>
          <p className="text-sm leading-relaxed">{review.response.content}</p>
          {canEdit && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditResponse}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Response
              </Button>
              {editPermissions.editTimeRemaining !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatEditTimeRemaining(editPermissions.editTimeRemaining)} left
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Response Form */}
      {isResponding && (
        <ResponseForm
          reviewId={review.id}
          reviewRating={review.rating}
          onSuccess={onResponseSuccess}
          onCancel={onCancelRespond}
        />
      )}

      {/* Actions */}
      {!hasResponse && !isResponding && (
        <div className="flex items-center gap-2 pt-2">
          <Button onClick={onRespond} className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Respond to Review
          </Button>
          <Button variant="outline" size="sm" onClick={onReport} className="gap-2">
            <Flag className="h-4 w-4" />
            Report
          </Button>
        </div>
      )}
    </Card>
  );
}
