// components/search/business-card.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Star, MapPin, IndianRupee, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const PRICE_SYMBOLS = {
  BUDGET: "₹",
  MODERATE: "₹₹",
  EXPENSIVE: "₹₹₹",
  LUXURY: "₹₹₹₹",
};

export function BusinessCard({ business }: { business: any }) {
  console.log(business);
  return (
    <Link href={`/business_service/${business.slug}`} className="block h-full group">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-muted/60 h-full flex flex-col relative bg-card">
        {/* Top Image Section */}
        <div className="relative h-44 w-full bg-muted overflow-hidden">
          <Image
            src={business?.coverImage || "/placeholder-cover.jpg"}
            alt={business.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Business Logo Overlay */}
          {business.logo && (
            <div className="absolute bottom-2 right-2 w-12 h-12 rounded-lg border-2 border-white overflow-hidden shadow-lg bg-white">
              <Image
                src={business.logo}
                alt={`${business.name} logo`}
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* Verification Badge */}
          {business.isVerified && (
            <div className="absolute top-2 left-2 flex gap-1">
              <Badge className="bg-secondary text-secondary-foreground border-none flex items-center gap-1 shadow-md">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </Badge>
            </div>
          )}

          {/* Open Status Badge (Mocked for now as backend logic needs date-fns) */}
          <div className="absolute top-2 right-2">
             <Badge variant={business.isOpen === false ? "destructive" : "default"}
                    className={cn("shadow-md", business.isOpen === false ? "bg-red-500" : "bg-green-600 hover:bg-green-700")}>
               {business.isOpen === false ? "Closed" : "Open Now"}
             </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          {/* Name and Rating */}
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {business.name}
            </h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-xs font-bold text-yellow-700">
                {business.averageRating?.toFixed(1) || "New"}
              </span>
            </div>
          </div>

          {/* Subtitle / Category */}
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight line-clamp-1">
             {business.categories?.[0]?.name || "Local Business"} • {business.totalReviews || 0} Reviews
          </p>

          {/* Location & Meta Info */}
          <div className="space-y-1.5 mt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-muted-foreground text-sm gap-1.5 min-w-0 cursor-help">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="truncate italic">
                      {business.area ? `${business.area}, ` : ""}
                      {business.city}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {business.area ? `${business.area}, ` : ""}
                  {business.city}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-3 text-xs font-semibold">
              {business.priceRange && (
                <div className="flex items-center text-secondary">
                  <IndianRupee className="w-3 h-3" />
                  <span>{PRICE_SYMBOLS[business.priceRange as keyof typeof PRICE_SYMBOLS]}</span>
                </div>
              )}
              {/* Optional: Show Distance if lat/lon logic is active */}
              {business.distance && (
                <span className="text-blue-600">{business.distance.toFixed(1)} km away</span>
              )}
            </div>
          </div>

          {/* Metadata Keywords (The "Smart Search" Tags) */}
          <div className="flex flex-wrap gap-1 mt-auto pt-3">
            {business.metadataKeywords?.slice(0, 3).map((keyword: string) => (
              <Badge
                key={keyword}
                variant="outline"
                className="text-[10px] font-normal py-0 bg-muted/30 text-muted-foreground border-muted-foreground/20"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}