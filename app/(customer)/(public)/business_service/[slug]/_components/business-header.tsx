// app/business_service/[slug]/_components/business-header.tsx

"use client";

import { useMemo, useState, useEffect } from "react";
import { BusinessDetail, BusinessStats } from "@/types/customer/business/business-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Share2,
  Bookmark,
  Flag,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Navigation,
  FileText,
} from "lucide-react";
import Image from "next/image";
import {
  formatPhoneNumber,
  formatShortAddress,
  formatFullAddress,
  getPriceRangeLabel,
  isBusinessOpenNow,
  getNextOpeningTime,
  generateWhatsAppURL,
  generateCallURL,
  generateGoogleMapsURL,
} from "@/lib/utils/business-detail-utils";
import { useBusinessDetailStore } from "@/store/customer/business_service/business-detail-store";
import { cn } from "@/lib/utils";

interface BusinessHeaderProps {
  business: BusinessDetail;
  stats: BusinessStats;
}

export function BusinessHeader({ business, stats }: BusinessHeaderProps) {
  const { isSaved, toggleSave, setShareModalOpen, setReportModalOpen } =
    useBusinessDetailStore();
  const [actionTabOpen, setActionTabOpen] = useState(false);

  // Hydration mismatch prevention: Calculate time-based status only on client
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [nextOpen, setNextOpen] = useState<string | null>(null);

  useEffect(() => {
    setIsOpen(isBusinessOpenNow(business, business?.hours));
    setNextOpen(getNextOpeningTime(business?.hours));
  }, [business]);

  if (!business) return null;

  const validStats = stats || {
    averageRating: 0,
    totalReviews: 0,
    priceRange: null,
  };

  const whatsappUrl = generateWhatsAppURL(business.phone, business.name);
  const callUrl = generateCallURL(business.phone);
  const mapsUrl = generateGoogleMapsURL({
    latitude: business.latitude,
    longitude: business.longitude,
    businessName: business.name,
    address: formatShortAddress(business),
  });

  // Get cover image source (prefer root coverImage, then featured image, then first image)
  const coverImageObject = useMemo(() => {
    if (!business.images || !Array.isArray(business.images)) return null;
    const featuredImage = business.images.find(img => img?.isFeatured && img?.isApproved);
    return featuredImage || business.images.find(img => img?.isApproved) || null;
  }, [business.images]);

  const displayCoverImage = business.coverImage || coverImageObject?.imageUrl;

  return (
    <>
      {/* Cover Image Banner */}
      {displayCoverImage && (
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden bg-muted">
          <Image
            src={displayCoverImage}
            alt={(coverImageObject as any)?.altText || `${business.name} cover`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            quality={100}
          />
          {/* Gradient Overlay for better header visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

          {/* Business name overlay on cover */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto container-padding">
              <div className="max-w-4xl">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg mb-2">
                  {business.name}
                </h1>
                {business.shortDescription && (
                  <p className="text-base md:text-lg text-white/90 drop-shadow-md line-clamp-2">
                    {business.shortDescription}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header - Always visible */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto container-padding py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
            {/* Left: Business Info */}
            <div className="space-y-4">
              {/* Business Name & Categories */}
              {/* Business Name & Categories */}
              <div className="space-y-2">
                {/* Fallback H1 for SEO when no cover image exists */}
                {!displayCoverImage && (
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-1">
                    {business.name}
                  </h1>
                )}

                <div className="flex items-start gap-3">
                  {business.isVerified && (
                    <Badge variant="secondary" className="gap-1 mt-1 bg-secondary/10 text-secondary border-secondary/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Categories */}
                <nav aria-label="Breadcrumb status" className="flex flex-wrap gap-2">
                  {business.categories && Array.isArray(business.categories) && business.categories.slice(0, 3).map((cat) => (
                    <Badge key={cat?.categoryId || Math.random()} variant="outline" className="hover:bg-muted transition-colors">
                      {cat?.category?.name || "Category"}
                    </Badge>
                  ))}
                </nav>
              </div>

              {/* Rating & Reviews */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {validStats.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-semibold text-foreground">
                        {validStats.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      ({validStats.totalReviews} reviews)
                    </span>
                  </div>
                )}

                {validStats.priceRange && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {getPriceRangeLabel(validStats.priceRange)}
                    </span>
                  </>
                )}
              </div>

              {/* Address & Status */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-muted-foreground cursor-help min-w-0 max-w-[200px] sm:max-w-[400px]">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{formatShortAddress(business)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs text-center">
                      {formatFullAddress(business)}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <span className="text-muted-foreground">•</span>

                {business.isTemporarilyClosed ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Temporarily Closed
                  </Badge>
                ) : business.is24x7 ? (
                  <Badge variant="secondary" className="gap-1 bg-secondary/10 text-secondary border-secondary/20">
                    <Clock className="h-3 w-3" />
                    Open 24/7
                  </Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {isOpen === null ? (
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        <span
                          className={cn(
                            "font-medium",
                            isOpen ? "text-secondary" : "text-destructive"
                          )}
                        >
                          {isOpen ? "Open Now" : "Closed"}
                        </span>
                        {!isOpen && nextOpen && (
                          <span className="text-muted-foreground text-xs">
                            • Opens {nextOpen}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons - Mobile Only in Main Header */}
              <div className="flex flex-wrap gap-3 pt-2 lg:hidden">
                <Button asChild size="default" className="gap-2 flex-1 sm:flex-initial">
                  <a href={callUrl}>
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                </Button>
                <Button asChild size="default" variant="secondary" className="gap-2 flex-1 sm:flex-initial">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
                <Button asChild size="default" variant="outline" className="gap-2 flex-1 sm:flex-initial">
                  <a href={mapsUrl} target="_blank" rel="no opener noreferrer">
                    <Navigation className="h-4 w-4" />
                    Directions
                  </a>
                </Button>
              </div>
            </div>

            {/* Right: Logo & Actions (Desktop) */}
            <div className="hidden lg:flex flex-col items-end gap-4">
              {/* Business Logo */}
              {business.logo && (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-border shadow-lg">
                  <Image
                    src={business.logo}
                    alt={`${business.name || "Business"} logo`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 128px, 256px"
                    priority
                    quality={100}
                  />
                </div>
              )}

              {/* Desktop Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-end">
                <Button asChild size="default" className="gap-2">
                  <a href={callUrl}>
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                </Button>
                <Button asChild size="default" variant="secondary" className="gap-2">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
                <Button asChild size="default" variant="outline" className="gap-2">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-4 w-4" />
                    Directions
                  </a>
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={toggleSave}
                  className={cn(isSaved && "bg-primary/10 border-primary")}
                >
                  <Bookmark
                    className={cn("h-4 w-4", isSaved && "fill-primary text-primary")}
                  />
                </Button>
                <Button size="icon" variant="outline" onClick={() => setShareModalOpen(true)}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => setReportModalOpen(true)}>
                  <Flag className="h-4 w-4" />
                </Button>
                {business.website && (
                  <Button asChild size="icon" variant="outline">
                    <a href={business.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Temporary Closure Notice */}
          {(business as any).isTemporarilyClosed && (business as any).temporaryClosureReason && (
            <Card className="mt-4 p-4 bg-destructive/5 border-destructive/20">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-destructive">Temporarily Closed</p>
                  <p className="text-sm text-muted-foreground">
                    {(business as any).temporaryClosureReason}
                  </p>
                  {(business as any).temporaryClosureEnd && (
                    <p className="text-sm text-muted-foreground">
                      Expected to reopen on{" "}
                      {new Date((business as any).temporaryClosureEnd).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>


    </>
  );
}
