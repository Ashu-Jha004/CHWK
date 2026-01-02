// app/business_service/[slug]/_components/tabs/reviews-tab.tsx

"use client";

import { useMemo, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  MessageSquare,
  Edit,
  Clock,
  Shield,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import { formatDate, getRelativeTime, calculateRatingBreakdown } from "@/lib/utils/business-detail-utils";
import { cn } from "@/lib/utils";
import { CreateReviewForm } from "@/components/reviews/create-review-form";
import { EditReviewDialog } from "@/components/reviews/edit-review-dialog";
import { HelpfulVoteButton } from "@/components/reviews/helpful-vote-button";
import { canEditReview, formatEditTimeRemaining, getVerificationBadgeInfo } from "@/lib/utils/review-utils";
import type { ReviewSortBy, ReviewFilterRating, ReviewWithDetails } from "@/types/review/review";

interface ReviewsTabProps {
  businessId: string;
  businessName: string;
  initialStats: {
    averageRating: number;
    totalReviews: number;
  };
}

export function ReviewsTab({
  businessId,
  businessName,
  initialStats = { averageRating: 0, totalReviews: 0 }
}: ReviewsTabProps) {
  // ============================================
  // STATE
  // ============================================
  const [sortBy, setSortBy] = useState<ReviewSortBy>("recent");
  const [filterRating, setFilterRating] = useState<ReviewFilterRating>("all");
  const [page, setPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewWithDetails | null>(null);

  const { isSignedIn, userId } = useAuth();

  // ============================================
  // FETCH REVIEWS
  // ============================================
  const {
    data: reviewsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["reviews", businessId, sortBy, filterRating, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        businessId,
        sortBy,
        filterRating,
        page: page.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/reviews/list?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      return response.json();
    },
  });

  const reviews = reviewsData?.reviews || [];
  const userReview = reviewsData?.userReview || null;
  const canCreateReview = reviewsData?.canCreateReview || false;
  const pagination = reviewsData?.pagination || { total: 0, page: 1, totalPages: 1 };

  // ============================================
  // CALCULATE RATING BREAKDOWN
  // ============================================
  const ratingBreakdown = useMemo(
    () => calculateRatingBreakdown(reviews),
    [reviews]
  );

  const ratingPercentages = useMemo(() => {
    const total = initialStats?.totalReviews || 1;
    return {
      5: (ratingBreakdown[5] / total) * 100,
      4: (ratingBreakdown[4] / total) * 100,
      3: (ratingBreakdown[3] / total) * 100,
      2: (ratingBreakdown[2] / total) * 100,
      1: (ratingBreakdown[1] / total) * 100,
    };
  }, [ratingBreakdown, initialStats?.totalReviews]);

  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; caption?: string | null } | null>(null);

  // ============================================
  // HANDLERS
  // ============================================
  const handleReviewSuccess = useCallback(() => {
    setShowCreateDialog(false);
    refetch();
  }, [refetch]);

  const handleEditClick = useCallback((review: ReviewWithDetails) => {
    const permissions = canEditReview(review.editableUntil);
    if (permissions.canEdit) {
      setEditingReview(review);
    }
  }, []);

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
      {/* Overall Rating Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          {/* Rating Summary */}
          <div className="text-center space-y-4">
            <div>
              <div className="text-6xl font-bold text-foreground mb-2">
                {initialStats?.averageRating && initialStats.averageRating > 0
                  ? initialStats.averageRating.toFixed(1)
                  : "N/A"}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-6 w-6",
                      star <= Math.round(initialStats?.averageRating || 0)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">
                Based on {initialStats?.totalReviews || 0}{" "}
                {initialStats?.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Write Review Button */}
            {isSignedIn ? (
              canCreateReview ? (
                <Button
                  className="w-full gap-2"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Edit className="h-4 w-4" />
                  Write a Review
                </Button>
              ) : userReview ? (
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    You've already reviewed this business
                  </Badge>
                  {canEditReview(userReview.editableUntil).canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleEditClick(userReview)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Your Review
                    </Button>
                  )}
                </div>
              ) : null
            ) : (
              <Button className="w-full gap-2" disabled>
                <Edit className="h-4 w-4" />
                Sign in to Review
              </Button>
            )}
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold mb-4">Rating Distribution</h3>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() =>
                  setFilterRating(
                    filterRating === rating.toString()
                      ? "all"
                      : (rating.toString() as ReviewFilterRating)
                  )
                }
                className={cn(
                  "flex items-center gap-3 w-full hover:bg-muted/50 p-2 rounded-lg transition-colors",
                  filterRating === rating.toString() && "bg-muted"
                )}
              >
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-4 w-4 fill-primary text-primary" />
                </div>
                <Progress
                  value={ratingPercentages[rating as keyof typeof ratingPercentages]}
                  className="flex-1 h-2"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {ratingBreakdown[rating as keyof typeof ratingBreakdown]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Filter & Sort Controls */}
      {initialStats?.totalReviews > 0 && (
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Sort by:</span>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value as ReviewSortBy);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="highest">Highest Rated</SelectItem>
                  <SelectItem value="lowest">Lowest Rated</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground">
              Showing {reviews.length} of {pagination.total}{" "}
              {pagination.total === 1 ? "review" : "reviews"}
              {filterRating !== "all" && ` (${filterRating}-star)`}
            </p>
          </div>

          {/* Active Filter Badge */}
          {filterRating !== "all" && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary" className="gap-2">
                {filterRating}-star reviews
                <button
                  onClick={() => setFilterRating("all")}
                  className="ml-1 hover:text-destructive"
                  aria-label="Clear filter"
                >
                  ×
                </button>
              </Badge>
            </div>
          )}
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {filterRating !== "all"
              ? `No ${filterRating}-star reviews yet`
              : "No Reviews Yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {filterRating !== "all"
              ? "Try adjusting your filters"
              : "Be the first to review this business!"}
          </p>
          {canCreateReview && filterRating === "all" && (
            <Button
              className="gap-2"
              onClick={() => setShowCreateDialog(true)}
            >
              <Edit className="h-4 w-4" />
              Write First Review
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review:any) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={userId || null}
              onEdit={handleEditClick}
              onPhotoClick={(url, caption) => setSelectedPhoto({ url, caption })}
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

      {/* Create Review Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {businessName}
            </DialogDescription>
          </DialogHeader>
          <CreateReviewForm
            businessId={businessId}
            businessName={businessName}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Review Dialog */}
      {editingReview && (
        <EditReviewDialog
          open={!!editingReview}
          onOpenChange={(open) => !open && setEditingReview(null)}
          reviewId={editingReview.id}
          businessId={businessId}
          currentData={{
            rating: editingReview.rating,
            title: editingReview.title,
            content: editingReview.content,
            foodRating: editingReview.foodRating,
            serviceRating: editingReview.serviceRating,
            ambienceRating: editingReview.ambienceRating,
            valueRating: editingReview.valueRating,
            editableUntil: editingReview.editableUntil,
          }}
        />
      )}
      {/* Photo Viewer Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none sm:rounded-2xl">
          <VisuallyHidden>
            <DialogTitle>View Photo</DialogTitle>
          </VisuallyHidden>
          {selectedPhoto && (
            <div className="relative aspect-video sm:aspect-[16/10] w-full flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-6 w-6" />
              </Button>
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || "Review photo"}
                fill
                className="object-contain"
                priority
              />
              {selectedPhoto.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-lg font-medium">{selectedPhoto.caption}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// REVIEW CARD COMPONENT
// ============================================
interface ReviewCardProps {
  review: ReviewWithDetails;
  currentUserId: string | null;
  onEdit: (review: ReviewWithDetails) => void;
  onPhotoClick: (url: string, caption?: string | null) => void;
}

function ReviewCard({ review, currentUserId, onEdit, onPhotoClick }: ReviewCardProps) {
  const isOwnReview = currentUserId === review.userId;
  const editPermission = canEditReview(review.editableUntil);
  const verificationInfo = getVerificationBadgeInfo(review.verificationStatus);

  return (
    <Card className="p-6 space-y-4 hover:shadow-md transition-shadow">
      {/* User Info & Rating */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div
            className={cn(
              "relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0 transition-transform",
              (review.user?.avatar || review.photos?.[0]?.url) ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default border border-border"
            )}
            onClick={() => {
              const photoUrl = review.user?.avatar || review.photos?.[0]?.url;
              if (photoUrl) {
                onPhotoClick(photoUrl, `${review.user?.firstName || "User"} ${review.user?.lastName || ""}`);
              }
            }}
          >
            {review.user?.avatar || review.photos?.[0]?.url ? (
              <Image
                src={review.user?.avatar || review.photos?.[0]?.url || ""}
                alt={`${review.user?.firstName || "User"}'s avatar`}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold text-lg">
                {(review.user?.firstName?.[0] || "U").toUpperCase()}
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {review.user?.firstName || "Anonymous"} {review.user?.lastName || ""}
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
              {review.lastEditedAt && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-2 items-end">
          {review.isVerifiedPurchase && (
            <Badge variant="secondary" className="flex-shrink-0">
              Verified Purchase
            </Badge>
          )}
          <Badge
            variant={verificationInfo.variant}
            className="flex-shrink-0 gap-1"
            title={verificationInfo.description}
          >
            <Shield className="h-3 w-3" />
            {verificationInfo.label}
          </Badge>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-border">
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
              className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onPhotoClick(photo.url, photo.caption)}
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

      {/* Review Actions */}
      <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
        {/* Helpful Votes */}
        {!isOwnReview && (
          <HelpfulVoteButton
            reviewId={review.id}
            initialHelpfulCount={review.helpfulCount}
            initialNotHelpfulCount={review.notHelpfulCount}
            userVote={review.userVote || null}
          />
        )}

        {/* Edit Button (Own Review) */}
        {isOwnReview && (
          <div className="flex items-center gap-2">
            {editPermission.canEdit ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onEdit(review)}
                >
                  <Edit className="h-4 w-4" />
                  Edit Review
                </Button>
                {editPermission.editTimeRemaining && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatEditTimeRemaining(editPermission.editTimeRemaining)} left
                  </div>
                )}
              </>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                Edit window expired
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
