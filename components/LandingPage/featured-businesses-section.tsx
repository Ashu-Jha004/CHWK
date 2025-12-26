"use client";

import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "./layout/section-wrapper";
import { SectionHeader } from "./layout/section-header";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  TrendingUp,
  Award,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Mock featured businesses data
interface FeaturedBusiness {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
  isOpen: boolean;
  isTrending: boolean;
  isVerified: boolean;
  image: string;
  tags: string[];
  description: string;
}

/**
 * Featured Businesses Section
 * Showcases top-rated and trending businesses
 */
export function FeaturedBusinessesSection() {
  const [likedBusinesses, setLikedBusinesses] = useState<Set<string>>(
    new Set()
  );

  // Mock data - In production, this would come from API
  const featuredBusinesses: FeaturedBusiness[] = useMemo(
    () => [
      {
        id: "1",
        name: "Spice Garden Restaurant",
        category: "Restaurants",
        rating: 4.8,
        reviewCount: 1250,
        location: "Bandra West, Mumbai",
        distance: "1.2 km",
        isOpen: true,
        isTrending: true,
        isVerified: true,
        image: "/images/categories/category-resturant.png",
        tags: ["Indian", "Fine Dining", "Family Friendly"],
        description: "Authentic Indian cuisine with modern presentation",
      },
      {
        id: "2",
        name: "Glamour Salon & Spa",
        category: "Salons",
        rating: 4.9,
        reviewCount: 890,
        location: "Koramangala, Bangalore",
        distance: "0.8 km",
        isOpen: true,
        isTrending: true,
        isVerified: true,
        image: "/images/categories/category-salon.png",
        tags: ["Unisex", "Spa", "Premium"],
        description: "Premium beauty and wellness services",
      },
      {
        id: "3",
        name: "HealthFirst Clinic",
        category: "Healthcare",
        rating: 4.7,
        reviewCount: 620,
        location: "Connaught Place, Delhi",
        distance: "2.5 km",
        isOpen: true,
        isTrending: false,
        isVerified: true,
        image: "/images/categories/category-healthcare.png",
        tags: ["General", "Emergency", "Insurance"],
        description: "Comprehensive healthcare services for all",
      },
      {
        id: "4",
        name: "Tech Solutions Pro",
        category: "Professional Services",
        rating: 4.6,
        reviewCount: 450,
        location: "Hitech City, Hyderabad",
        distance: "3.1 km",
        isOpen: false,
        isTrending: false,
        isVerified: true,
        image: "/images/categories/category-professional.png",
        tags: ["IT Services", "24x7 Support", "Enterprise"],
        description: "Professional IT solutions for businesses",
      },
    ],
    []
  );

  // Handle like toggle
  const handleLikeToggle = useCallback((businessId: string) => {
    setLikedBusinesses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(businessId)) {
        newSet.delete(businessId);
      } else {
        newSet.add(businessId);
      }
      return newSet;
    });
  }, []);

  // Handle business click
  const handleBusinessClick = useCallback((business: FeaturedBusiness) => {
    console.log("Business clicked:", business.name);
    // TODO: Navigate to business detail page
    // router.push(`/business/${business.id}`);
  }, []);

  return (
    <SectionWrapper id="featured" background="gray">
      <SectionHeader
        badge="Featured"
        title="Trending Businesses"
        description="Discover highly-rated local businesses recommended by our community"
        align="center"
      />

      {/* Businesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredBusinesses.map((business, index) => (
          <Card
            key={business.id}
            className={cn(
              "group overflow-hidden border-0 shadow-md hover:shadow-2xl",
              "transition-all duration-300 cursor-pointer",
              "animate-fade-in-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Image Container */}
            <div
              className="relative h-48 bg-gray-200 overflow-hidden"
              onClick={() => handleBusinessClick(business)}
            >
              {/* Image prompt for AI generation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-gray-500 text-center px-4">
                  <Image
                    src={business.image}
                    alt={business.name}
                    fill
                    className="object-cover"
                  />
                </p>
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {business.isTrending && (
                  <Badge className="bg-primary/90 backdrop-blur-sm gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </Badge>
                )}
                {business.isVerified && (
                  <Badge className="bg-success/90 backdrop-blur-sm gap-1">
                    <Award className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Like Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikeToggle(business.id);
                }}
                className={cn(
                  "absolute top-3 right-3 w-9 h-9 rounded-full",
                  "bg-white/90 backdrop-blur-sm flex items-center justify-center",
                  "hover:scale-110 transition-transform focus-visible-ring"
                )}
              >
                <Heart
                  className={cn(
                    "w-5 h-5 transition-colors",
                    likedBusinesses.has(business.id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600"
                  )}
                />
              </Button>

              {/* Open/Closed Status */}
              <div className="absolute bottom-3 left-3">
                <Badge
                  variant={business.isOpen ? "default" : "secondary"}
                  className={cn(
                    "backdrop-blur-sm",
                    business.isOpen ? "bg-success/90" : "bg-gray-600/90"
                  )}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {business.isOpen ? "Open Now" : "Closed"}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-4" onClick={() => handleBusinessClick(business)}>
              {/* Title & Category */}
              <div className="mb-2">
                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                  {business.name}
                </h3>
                <p className="text-xs text-gray-500">{business.category}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 bg-success/10 px-2 py-1 rounded">
                  <Star className="w-4 h-4 fill-success text-success" />
                  <span className="font-semibold text-sm text-gray-900">
                    {business.rating}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  ({business.reviewCount} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {business.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {business.tags.slice(0, 2).map((tag, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-xs border-gray-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Location & Distance */}
              <div className="flex items-start gap-2 text-xs text-gray-500 mb-4">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="line-clamp-1">{business.location}</p>
                  <p className="text-primary font-medium">
                    {business.distance} away
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("View details:", business.name);
                  }}
                >
                  View Details
                  <ExternalLink className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Call business:", business.name);
                  }}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View More Button */}
      <div className="text-center mt-12">
        <Button size="lg" className="gap-2 group">
          Explore More Businesses
          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
