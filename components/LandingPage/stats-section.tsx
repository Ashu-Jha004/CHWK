"use client";

import { useMemo } from "react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SectionWrapper } from "@/components/LandingPage/layout/section-wrapper";
import { STATS } from "@/lib/(landing_page)/constants";
import {
  Building2,
  Users,
  Star,
  MapPin,
  TrendingUp,
  Shield,
  Award,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Statistics Section Component
 * Displays key metrics with animated counters
 * Shows trust indicators and achievements
 */
export function StatsSection() {
  // Stats data with icons
  const statsData = useMemo(
    () => [
      {
        id: "businesses",
        value: STATS.businesses,
        label: "Verified Businesses",
        icon: Building2,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        id: "customers",
        value: STATS.customers,
        label: "Happy Customers",
        icon: Users,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        id: "reviews",
        value: STATS.reviews,
        label: "Genuine Reviews",
        icon: Star,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        id: "cities",
        value: STATS.cities,
        label: "Cities Covered",
        icon: MapPin,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
    ],
    []
  );

  // Trust indicators
  const trustIndicators = useMemo(
    () => [
      {
        icon: Shield,
        title: "Verified Businesses",
        description: "All businesses are verified by our team",
      },
      {
        icon: Award,
        title: "Quality Assurance",
        description: "Only the best make it to our platform",
      },
      {
        icon: CheckCircle2,
        title: "Authentic Reviews",
        description: "100% genuine customer feedback",
      },
      {
        icon: TrendingUp,
        title: "Growing Network",
        description: "New businesses added daily",
      },
    ],
    []
  );

  return (
    <SectionWrapper
      background="none"
      className="relative -mt-16 pb-24"
      animate={false}
    >
      {/* Stats Cards */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
          {statsData.map((stat, index) => (
            <div
              key={stat.id}
              className=" rounded-2xl  shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-8 text-center animate-scale-in group hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                  stat.bgColor
                )}
              >
                <stat.icon className={cn("w-8 h-8", stat.color)} />
              </div>

              {/* Counter */}
              <div
                className={cn(
                  "text-4xl md:text-5xl font-bold mb-2",
                  stat.color
                )}
              >
                <AnimatedCounter end={stat.value} suffix="+" duration={2500} />
              </div>

              {/* Label */}
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Why Choose CHWK?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to connecting you with the best local
              businesses through our verified and trusted platform.
            </p>
          </div>

          {/* Trust Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustIndicators.map((indicator, index) => (
              <div
                key={index}
                className="bg-gradient-to-br  rounded-xl p-6 border border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-md animate-fade-in-up group"
                style={{ animationDelay: `${index * 150 + 400}ms` }}
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <indicator.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 mb-2">
                  {indicator.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {indicator.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Trust Badges */}
        <div className="mt-16 bg-gradient-primary rounded-2xl p-8 md:p-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              India&apos;s Most Trusted Local Business Platform
            </h3>
            <p className=" mb-8 max-w-2xl mx-auto">
              Join thousands of businesses and millions of customers who trust
              CHWK for authentic local discovery and connections.
            </p>

            {/* Achievement Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold mb-1">4.8★</div>
                <div className="text-sm ">Average Rating</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold mb-1">98%</div>
                <div className="text-sm ">Satisfaction Rate</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold mb-1">24/7</div>
                <div className="text-sm ">Support Available</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold mb-1">100%</div>
                <div className="text-sm ">Secure Platform</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
