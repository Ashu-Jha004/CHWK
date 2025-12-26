"use client";

import { useMemo } from "react";
import Image from "next/image";
import { SectionWrapper } from "./layout/section-wrapper";
import { SectionHeader } from "./layout/section-header";
import { Button } from "@/components/ui/button";
import {
  Search,
  Star,
  MapPin,
  Shield,
  Clock,
  Heart,
  MessageSquare,
  Filter,
  Bell,
  TrendingUp,
  Award,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

/**
 * Customer Features Section
 * Showcases benefits and features for customers with hero image
 */
export function CustomerFeaturesSection() {
  const features: Feature[] = useMemo(
    () => [
      {
        id: "search",
        icon: Search,
        title: "Smart Search",
        description:
          "Find exactly what you need with our intelligent search that understands your preferences and location.",
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        id: "reviews",
        icon: Star,
        title: "Verified Reviews",
        description:
          "Read authentic reviews from real customers to make informed decisions about local businesses.",
        color: "text-accent",
        bgColor: "bg-accent/10",
      },
      {
        id: "nearby",
        icon: MapPin,
        title: "Location-Based",
        description:
          "Discover businesses near you with accurate distance calculations and easy navigation.",
        color: "text-success",
        bgColor: "bg-success/10",
      },
      {
        id: "secure",
        icon: Shield,
        title: "Safe & Secure",
        description:
          "Your data is protected with enterprise-grade security. All businesses are verified by our team.",
        color: "text-secondary",
        bgColor: "bg-secondary/10",
      },
      {
        id: "realtime",
        icon: Clock,
        title: "Real-Time Info",
        description:
          "Get up-to-date information on business hours, availability, and current wait times.",
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        id: "favorites",
        icon: Heart,
        title: "Save Favorites",
        description:
          "Create lists of your favorite businesses and get notified about special offers and updates.",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
      },
      {
        id: "compare",
        icon: Filter,
        title: "Easy Comparison",
        description:
          "Compare multiple businesses side-by-side based on ratings, prices, and services offered.",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
      },
      {
        id: "notifications",
        icon: Bell,
        title: "Smart Alerts",
        description:
          "Receive personalized notifications about new businesses, deals, and reviews in your area.",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
      },
      {
        id: "trending",
        icon: TrendingUp,
        title: "Trending Spots",
        description:
          "Discover what's popular in your neighborhood with our trending businesses feature.",
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10",
      },
    ],
    []
  );

  const benefits = useMemo(
    () => [
      {
        icon: Award,
        title: "Quality Guaranteed",
        stat: "98%",
        description: "Customer satisfaction rate",
      },
      {
        icon: CheckCircle2,
        title: "Verified Listings",
        stat: "100%",
        description: "All businesses verified",
      },
      {
        icon: Star,
        title: "Trusted Reviews",
        stat: "320K+",
        description: "Authentic customer reviews",
      },
      {
        icon: MessageSquare,
        title: "Quick Support",
        stat: "24/7",
        description: "Customer support available",
      },
    ],
    []
  );

  return (
    <SectionWrapper id="customer-features" background="white">
      <SectionHeader
        badge="For Customers"
        title="Everything You Need to Find Local Businesses"
        description="Discover, compare, and connect with the best local businesses in your area with our powerful features"
        align="center"
      />

      {/* Hero Image Section */}
      <div className="mb-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 p-8 md:p-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image */}
          <div className="relative h-[300px] md:h-[400px] lg:h-[450px] rounded-xl overflow-hidden shadow-2xl order-2 lg:order-1">
            <Image
              src="/images/features/customer-feature.png"
              alt="Happy customers using CHWK app to discover local businesses"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {/* Overlay Badge */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary fill-primary" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">4.8/5 Rating</div>
                  <div className="text-sm text-gray-600">
                    From 850K+ happy users
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Find Your Perfect Match, Every Time
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Whether you&apos;re looking for a new restaurant to try, a
              reliable plumber, or the best salon in town, CHWK makes it easy to
              discover verified local businesses that match your needs.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-primary mb-1">61K+</div>
                <div className="text-sm text-gray-600">Verified Businesses</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-primary mb-1">25+</div>
                <div className="text-sm text-gray-600">Cities Covered</div>
              </div>
            </div>

            <Button size="lg" className="gap-2 btn-shine">
              Start Exploring
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;

          return (
            <div
              key={feature.id}
              className={cn(
                "group relative bg-gradient-to-br from-white to-gray-50",
                "rounded-2xl p-6 border border-gray-100",
                "hover:border-transparent hover:shadow-xl",
                "transition-all duration-300",
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                  "transition-transform duration-300 group-hover:scale-110",
                  feature.bgColor
                )}
              >
                <IconComponent className={cn("w-7 h-7", feature.color)} />
              </div>

              {/* Content */}
              <h3 className="font-bold text-xl text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect Line */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  feature.color.replace("text-", "bg-")
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Benefits Banner */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Why Customers Love CHWK
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join millions of satisfied customers who trust CHWK for their local
            business discovery needs
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;

            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-1">
                  {benefit.stat}
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  {benefit.title}
                </div>
                <div className="text-sm text-gray-600">
                  {benefit.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button size="lg" className="gap-2 btn-shine">
            Get Started for Free
            <CheckCircle2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}
