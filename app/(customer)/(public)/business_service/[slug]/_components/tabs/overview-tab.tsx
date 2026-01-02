// app/business_service/[slug]/_components/tabs/overview-tab.tsx

"use client";

import { useMemo, use } from "react";
import { BusinessDetail, BusinessStats } from "@/types/customer/business/business-detail";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  Heart,
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

interface OverviewTabProps {
  business: BusinessDetail;
  stats: BusinessStats;
  relatedBusinessesPromise: Promise<Partial<BusinessDetail>[]>;
}

export function OverviewTab({
  business,
  stats,
  relatedBusinessesPromise,
}: OverviewTabProps) {
  const { setActiveTab, setGalleryOpen, setGalleryIndex } = useBusinessDetailStore();

  const isOpen = useMemo(
    () => isBusinessOpenNow(business, business.hours),
    [business]
  );

  const nextOpen = useMemo(
    () => getNextOpeningTime(business.hours),
    [business.hours]
  );

  const ratingBreakdown = useMemo(
    () => calculateRatingBreakdown(business.reviews),
    [business.reviews]
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
      {/* Hero Image Gallery Preview */}
      {featuredImages.length > 0 && (
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
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>

          {stats.totalPhotos > 4 && (
            <div className="p-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full gap-2"
                onClick={handleViewAllPhotos}
              >
                <ImageIcon className="h-4 w-4" />
                View All {stats.totalPhotos} Photos
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Rating Card */}
        {stats.averageRating > 0 && (
          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Rating</span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.totalReviews} reviews
              </div>
            </div>
          </Card>
        )}

        {/* Reviews Card */}
        <Card
          className="p-4 space-y-2 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveTab("reviews")}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">Reviews</span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-foreground">
              {stats.totalReviews}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              View all
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </Card>

        {/* Photos Card */}
        <Card
          className="p-4 space-y-2 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveTab("photos")}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Photos</span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-foreground">
              {stats.totalPhotos}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              View gallery
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </Card>

        {/* Products/Services Card */}
        {(stats.totalProducts > 0 || stats.totalServices > 0) && (
          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              {stats.totalProducts > 0 ? (
                <Package className="h-4 w-4" />
              ) : (
                <Wrench className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {stats.totalProducts > 0 ? "Products" : "Services"}
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">
                {stats.totalProducts > 0 ? stats.totalProducts : stats.totalServices}
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </Card>
        )}
      </div>

      {/* Intro Video Section */}
      {business.introVideoUrl && (
        <IntroVideoSection videoUrl={business.introVideoUrl} />
      )}

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
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Verified Business</p>
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
                "flex items-start gap-3 p-3 rounded-lg border",
                isOpen
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-orange-500/5 border-orange-500/20"
              )}
            >
              <Clock
                className={cn(
                  "h-5 w-5 flex-shrink-0 mt-0.5",
                  isOpen ? "text-green-600" : "text-orange-600"
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

          {/* Emergency Service */}
          {business.hasEmergencyService && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Emergency Service</p>
                {business.emergencyContactNumber && (
                  <p className="text-xs text-muted-foreground">
                    {formatPhoneNumber(business.emergencyContactNumber)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Methods */}
          {(business.acceptsUPI ||
            business.acceptsCards ||
            business.acceptsNetBanking) && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-border">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Multiple Payment Options</p>
                <p className="text-xs text-muted-foreground">
                  {[
                    business.acceptsCash && "Cash",
                    business.acceptsUPI && "UPI",
                    business.acceptsCards && "Cards",
                    business.acceptsNetBanking && "Net Banking",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Staff Count */}
          {stats.totalStaff > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-border">
              <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Professional Staff</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalStaff} team {stats.totalStaff === 1 ? "member" : "members"}
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
            {stats.totalReviews > 3 && (
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
                    {review.user.avatar ? (
                      <Image
                        src={review.user.avatar}
                        alt={`${review.user.firstName || "User"}'s avatar`}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold">
                        {(review.user.firstName?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">
                        {review.user.firstName} {review.user.lastName}
                      </p>
                      <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full flex-shrink-0">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span className="text-sm font-semibold">{review.rating}</span>
                      </div>
                    </div>
                    {review.title && (
                      <p className="text-sm font-medium text-foreground mt-1">
                        {review.title}
                      </p>
                    )}
                  </div>
                </div>

                {review.content && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {review.content}
                  </p>
                )}

                {review.photos?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {review.photos.slice(0, 3).map((photo) => (
                      <div
                        key={photo.id}
                        className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                      >
                        <Image
                          src={photo.url}
                          alt={photo.caption || "Review photo"}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ))}
                  </div>
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

          {/* Email */}
          {business.email && (
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <a
                  href={`mailto:${business.email}`}
                  className="text-foreground hover:text-primary transition-colors break-all"
                >
                  {business.email}
                </a>
              </div>
            </div>
          )}

          {/* Website */}
          {business.website && (
            <div className="flex items-start gap-3">
              <Globe className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors break-all"
                >
                  {business.website}
                </a>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-foreground">{formatFullAddress(business)}</p>
              <Button
                variant="link"
                size="sm"
                className="px-0 h-auto mt-1"
                onClick={() => setActiveTab("contact")}
              >
                View on map
                <ChevronRight className="h-4 w-4" />
              </Button>
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
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-bold">
                      {b.averageRating?.toFixed(1) || "New"}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    ({b.totalReviews || 0} reviews)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {b.area}, {b.city}
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

