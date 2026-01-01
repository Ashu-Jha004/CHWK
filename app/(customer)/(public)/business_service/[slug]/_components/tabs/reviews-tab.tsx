// app/business_service/[slug]/_components/tabs/reviews-tab.tsx

"use client";

import { useMemo, useState } from "react";
import { BusinessDetail, BusinessStats } from "@/types/customer/business/business-detail";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Calendar,
  ImageIcon,
  Flag,
  Edit,
} from "lucide-react";
import Image from "next/image";
import { formatDate, getRelativeTime, calculateRatingBreakdown } from "@/lib/utils/business-detail-utils";
import { cn } from "@/lib/utils";

interface ReviewsTabProps {
  business: BusinessDetail;
  stats: BusinessStats;
}

export function ReviewsTab({ business, stats }: ReviewsTabProps) {
  const [filter, setFilter] = useState<"all" | "with-photos">("all");

  // Calculate rating breakdown
  const ratingBreakdown = useMemo(
    () => calculateRatingBreakdown(business.reviews || []),
    [business.reviews]
  );

  // Filter reviews
  const filteredReviews = useMemo(() => {
    const reviews = business.reviews || [];
    if (filter === "with-photos") {
      return reviews.filter((r) => r.photos?.length > 0);
    }
    return reviews;
  }, [business.reviews, filter]);

  // Calculate percentages
  const ratingPercentages = useMemo(() => {
    const total = stats.totalReviews || 1;
    return {
      5: (ratingBreakdown[5] / total) * 100,
      4: (ratingBreakdown[4] / total) * 100,
      3: (ratingBreakdown[3] / total) * 100,
      2: (ratingBreakdown[2] / total) * 100,
      1: (ratingBreakdown[1] / total) * 100,
    };
  }, [ratingBreakdown, stats.totalReviews]);

  return (
    <div className="space-y-6">
      {/* Overall Rating Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          {/* Rating Summary */}
          <div className="text-center space-y-4">
            <div>
              <div className="text-6xl font-bold text-foreground mb-2">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-6 w-6",
                      star <= Math.round(stats.averageRating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Write Review Button - Placeholder */}
            <Button className="w-full gap-2" disabled>
              <Edit className="h-4 w-4" />
              Write a Review
              <Badge variant="secondary" className="ml-2 text-xs">
                Coming Soon
              </Badge>
            </Button>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold mb-4">Rating Distribution</h3>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
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
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Filter Controls */}
      {business.reviews.length > 0 && (
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All Reviews
              </Button>
              <Button
                variant={filter === "with-photos" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("with-photos")}
                className="gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                With Photos
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Showing {filteredReviews.length} {filteredReviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to review this business!
          </p>
          <Button className="gap-2" disabled>
            <Edit className="h-4 w-4" />
            Write First Review
            <Badge variant="secondary" className="ml-2 text-xs">
              Coming Soon
            </Badge>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Placeholder Notice */}
      <Card className="p-6 bg-muted/50 border-dashed">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Review Features Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Advanced filtering, sorting, helpful votes, and review responses will be available in a future update.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: BusinessDetail["reviews"][number] }) {
  return (
    <Card className="p-6 space-y-4 hover:shadow-md transition-shadow">
      {/* User Info & Rating */}
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
            <div className="flex items-center gap-2 mt-1">
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
          </div>
        </div>

        {/* Verified Badge */}
        {review.isVerifiedPurchase && (
          <Badge variant="secondary" className="flex-shrink-0">
            Verified
          </Badge>
        )}
      </div>

      {/* Review Title */}
      {review.title && (
        <h4 className="font-semibold text-lg">{review.title}</h4>
      )}

      {/* Review Content */}
      {review.content && (
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {review.content}
        </p>
      )}

      {/* Multi-dimensional Ratings */}
      {(review.foodRating || review.serviceRating || review.ambienceRating || review.valueRating) && (
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

      {/* Review Actions - Placeholder */}
      <div className="flex items-center gap-4 pt-2">
        <Button variant="ghost" size="sm" className="gap-2" disabled>
          <ThumbsUp className="h-4 w-4" />
          Helpful ({review.helpfulCount})
        </Button>
        <Button variant="ghost" size="sm" className="gap-2" disabled>
          <Flag className="h-4 w-4" />
          Report
        </Button>
      </div>

      {/* Business Response - If exists (Commented out until schema supports it) */}
      {/* {review.response && (
        <>
          <Separator />
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Business Response</Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(review.response.createdAt)}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{review.response.content}</p>
          </div>
        </>
      )} */}
    </Card>
  );
}
