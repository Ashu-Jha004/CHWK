// app/business_service/[slug]/_components/tabs/overview-tab.tsx

"use client";

import { useMemo, use } from "react";
import { BusinessDetail, BusinessStats } from "@/types/customer/business/business-detail";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  TrendingUp,
  Award,
  Shield,
  Users,
  Package,
  Wrench,
  ImageIcon,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  formatPhoneNumber,
  formatFullAddress,
  isBusinessOpenNow,
  getNextOpeningTime,
  calculateRatingBreakdown,
} from "@/lib/utils/business-detail-utils";
import { useBusinessDetailStore } from "@/store/customer/business_service/business-detail-store";
import { cn } from "@/lib/utils";
import { getYouTubeEmbedUrl } from "@/lib/utils/video-helper";

import { VideoPreviewGrid } from "@/components/business/video-preview-grid";
import { LazyRender } from "@/components/lazy-render";

interface OverviewTabProps {
  business: BusinessDetail;
  stats: BusinessStats;
  relatedBusinessesPromise: Promise<Partial<BusinessDetail>[]>;
  onBookClick?: () => void;
  onOrderClick?: () => void;
}

export function OverviewTab({
  business,
  stats,
  relatedBusinessesPromise,
  onBookClick,
  onOrderClick,
}: OverviewTabProps) {
  const { setActiveTab, setGalleryOpen, setGalleryIndex, setGalleryFilter } = useBusinessDetailStore();

  const isOpen = useMemo(
    () => isBusinessOpenNow(business, business.hours),
    [business]
  );

  const nextOpen = useMemo(
    () => getNextOpeningTime(business.hours),
    [business.hours]
  );

  // Get featured images (first 4)
  const featuredImages = useMemo(
    () => (business.images || []).slice(0, 4),
    [business.images]
  );

  // Get featured reviews (top 3 with highest rating)
  const featuredReviews = useMemo(
    () =>
      (business.reviews || [])
        .filter((r) => r.rating >= 4)
        .slice(0, 3),
    [business.reviews]
  );

  const handleViewAllPhotos = () => {
    setActiveTab("photos");
  };

  const handleImageClick = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Intro Video Section */}
      {business.introVideoUrl && (
        <IntroVideoSection videoUrl={business.introVideoUrl} />
      )}

      {/* Video Gallery Section */}
      {business.photos.length > 0 && (
        <LazyRender rootMargin="300px">
          <VideoPreviewGrid
            videos={business.photos.filter(p => p.type === "VIDEO")}
            totalCount={business.photos.filter(p => p.type === "VIDEO").length}
            onViewAll={() => {
              setGalleryFilter("video");
              setActiveTab("photos");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </LazyRender>
      )}

      {/* Hero Image Gallery Preview */}
      {featuredImages.length > 0 && (
        <LazyRender rootMargin="200px">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2">
              {featuredImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                  onClick={() => handleImageClick(index)}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.altText || `${business.name} photo ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>

            {stats?.totalPhotos > 4 && (
              <div className="p-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full gap-2"
                  onClick={handleViewAllPhotos}
                >
                  <ImageIcon className="h-4 w-4" />
                  View All {stats?.totalPhotos || 0} Photos
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            )}
          </Card>
        </LazyRender>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Rating Card */}
        {stats?.averageRating > 0 && (
          <Card className="group p-5 space-y-3 bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <div className="flex items-center gap-2 text-primary/70">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-widest">Rating</span>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-black text-foreground tracking-tighter">
                {stats?.averageRating?.toFixed(1)}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                {stats?.totalReviews || 0} customer reviews
              </div>
            </div>
          </Card>
        )}

        {/* Reviews Card */}
        <Card
          className="group p-5 space-y-3 bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
          onClick={() => setActiveTab("reviews")}
        >
          <div className="flex items-center gap-2 text-primary/70">
            <MessageSquare className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Reviews</span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-black text-foreground tracking-tighter">
              {stats?.totalReviews || 0}
            </div>
            <div className="text-[10px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View all feedback
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </Card>

        {/* Photos Card */}
        <Card
          className="group p-5 space-y-3 bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
          onClick={() => setActiveTab("photos")}
        >
          <div className="flex items-center gap-2 text-primary/70">
            <ImageIcon className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Photos</span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-black text-foreground tracking-tighter">
              {stats?.totalPhotos || 0}
            </div>
            <div className="text-[10px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Explore gallery
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </Card>

        {/* Products/Services Card */}
        {(stats?.totalProducts > 0 || stats?.totalServices > 0) && (
          <Card
            className="group p-5 space-y-3 bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
            onClick={() => setActiveTab(stats?.totalProducts > 0 ? "products" : "services")}
          >
            <div className="flex items-center gap-2 text-primary/70">
              {stats?.totalProducts > 0 ? (
                <Package className="h-4 w-4" />
              ) : (
                <Wrench className="h-4 w-4" />
              )}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {stats?.totalProducts > 0 ? "Inventory" : "Services"}
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-black text-foreground tracking-tighter">
                {stats?.totalProducts > 0 ? stats.totalProducts : stats?.totalServices}
              </div>
              <div className="text-[10px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Browse catalog
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* About Section Preview */}
      {business.description && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            About {business.name}
          </h2>
          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
            {business.description}
          </p>
          <Button
            variant="ghost"
            className="gap-2 px-0 hover:bg-transparent"
            onClick={() => setActiveTab("about")}
          >
            Read More
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Card>
      )}

      {/* Highlights Section */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Highlights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Verified Badge */}
          {business.isVerified && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
              <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-secondary">Verified Business</p>
                <p className="text-xs text-muted-foreground">
                  Identity and documents verified
                </p>
              </div>
            </div>
          )}

          {/* Open Status */}
          {!business.isTemporarilyClosed && (
            <div
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                isOpen
                  ? "bg-secondary/5 border-secondary/20"
                  : "bg-destructive/5 border-destructive/20"
              )}
            >
              <Clock
                className={cn(
                  "h-5 w-5 flex-shrink-0 mt-0.5",
                  isOpen ? "text-secondary" : "text-destructive"
                )}
              />
              <div>
                <p className="font-medium text-sm">
                  {business.is24x7 ? "Open 24/7" : isOpen ? "Open Now" : "Closed"}
                </p>
                {!business.is24x7 && !isOpen && nextOpen && (
                  <p className="text-xs text-muted-foreground">Opens {nextOpen}</p>
                )}
              </div>
            </div>
          )}

          {/* Delivery Available */}
          {business.hasDelivery && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-border">
              <Package className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Delivery Available</p>
                {business.deliveryRadius && (
                  <p className="text-xs text-muted-foreground">
                    Within {business.deliveryRadius / 1000}km radius
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Staff Count */}
          {stats?.totalStaff > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-border">
              <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Professional Staff</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalStaff} team {stats?.totalStaff === 1 ? "member" : "members"}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Featured Reviews */}
      {featuredReviews.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Featured Reviews
            </h2>
            {stats?.totalReviews > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setActiveTab("reviews")}
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {featuredReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-lg border border-border space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {review.user?.avatar ? (
                      <Image
                        src={review.user?.avatar}
                        alt={`${review.user?.firstName || "User"}'s avatar`}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold">
                        {(review.user?.firstName?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">
                        {review.user?.firstName || "Anonymous"} {review.user?.lastName || ""}
                      </p>
                      <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full flex-shrink-0">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="text-sm font-semibold">{review.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {review.content && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {review.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Contact Information */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Contact Information
        </h2>

        <div className="space-y-3">
          {/* Phone */}
          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <a
                href={`tel:${business.phone}`}
                className="text-foreground hover:text-primary transition-colors"
              >
                {formatPhoneNumber(business.phone)}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-foreground truncate">
                {formatFullAddress(business)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Related Businesses Section */}
      <RelatedBusinessesSection
        relatedBusinessesPromise={relatedBusinessesPromise}
      />
    </div>
  );
}

// Related Businesses Component
function RelatedBusinessesSection({
  relatedBusinessesPromise,
}: {
  relatedBusinessesPromise: Promise<Partial<BusinessDetail>[]>;
}) {
  const relatedBusinesses = use(relatedBusinessesPromise);

  if (!relatedBusinesses || relatedBusinesses.length === 0) return null;

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        You Might Also Like
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedBusinesses.map((b) => (
          <Link
            key={b.id}
            href={`/business_service/${b.slug}`}
            className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors group"
          >
            <div className="flex gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                {b.logo ? (
                  <Image
                    src={b.logo}
                    alt={b.name || "Business"}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold bg-primary/5 text-primary">
                    {(b.name?.[0] || "B").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-semibold truncate group-hover:text-primary transition-colors">
                  {b.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function IntroVideoSection({ videoUrl }: { videoUrl: string }) {
  const embedUrl = useMemo(() => getYouTubeEmbedUrl(videoUrl), [videoUrl]);

  if (!embedUrl) return null;

  return (
    <Card className="overflow-hidden bg-background border-border shadow-sm">
      <div className="p-4 flex items-center gap-2 border-b border-border bg-muted/20">
         <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30">
            <Youtube className="h-4 w-4 text-red-600 dark:text-red-500" />
         </div>
         <h2 className="font-semibold">Video Tour</h2>
      </div>
      <div className="relative w-full aspect-video bg-black">
         <iframe
            src={embedUrl}
            title="Business Intro Video"
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
      </div>
    </Card>
  );
}
