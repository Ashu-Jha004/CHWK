// components/search/business-card.tsx
// Individual business card with image, rating, distance

"use client";

import Link from "next/link";
import Image from "next/image";
import { BusinessSearchResult } from "@/types/search/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, IndianRupee, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/search/utils";

interface BusinessCardProps {
  business: BusinessSearchResult;
}

const PRICE_SYMBOLS = {
  BUDGET: "₹",
  MODERATE: "₹₹",
  EXPENSIVE: "₹₹₹",
  LUXURY: "₹₹₹₹",
};

export function BusinessCard({ business }: BusinessCardProps) {
  const primaryCategory =
    business.categories.find((c) => c.isPrimary)?.name ||
    business.categories[0]?.name;

  console.log(business.slug);
  return (
    <Card className="card-hover overflow-hidden group h-full">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {business.coverImage || business.logo ? (
          <Image
            src={business.coverImage || business.logo || ""}
            alt={business.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <span className="text-4xl font-bold text-primary/30">
              {business.name.charAt(0)} helo
            </span>
          </div>
        )}

        {/* Verified Badge */}
        {business.isVerified && (
          <Badge className="absolute top-3 right-3 bg-white/90 text-primary border-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )}

        {/* Distance Badge */}
        {business.distance !== undefined && (
          <Badge className="absolute top-3 left-3 bg-black/70 text-white border-0">
            <MapPin className="h-3 w-3 mr-1" />
            {formatDistance(business.distance)}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Business Name */}

        <div>
          <Link href={`/business_service/${business.slug}`}>
            {" "}
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {business.name}
            </h3>
          </Link>
          {primaryCategory && (
            <p className="text-sm text-muted-foreground">{primaryCategory}</p>
          )}
        </div>

        {/* Rating & Reviews */}
        {business.averageRating !== null && business.averageRating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-sm font-semibold text-primary">
                {business.averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({business.totalReviews}{" "}
              {business.totalReviews === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}

        {/* Price Range */}
        {business.priceRange && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <IndianRupee className="h-4 w-4" />
            <span className="text-sm font-mono">
              {PRICE_SYMBOLS[business.priceRange]}
            </span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {business.area && `${business.area}, `}
            {business.city}
          </span>
        </div>

        {/* Short Description */}
        {business.shortDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {business.shortDescription}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
