"use client";

import { useMemo } from "react";
import Image from "next/image";
import { SectionWrapper } from "./layout/section-wrapper";
import { SectionHeader } from "./layout/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Users,
  BarChart3,
  MessageSquare,
  Camera,
  Calendar,
  Megaphone,
  Smartphone,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface BusinessFeature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  size?: "small" | "large";
}

export function BusinessFeaturesSection() {
  const features: BusinessFeature[] = useMemo(
    () => [
      {
        id: "listing",
        icon: Store,
        title: "Free Business Listing",
        description:
          "Create your business profile for free and reach thousands of potential customers in your area.",
        badge: "Free",
        size: "large",
      },
      {
        id: "analytics",
        icon: BarChart3,
        title: "Performance Analytics",
        description: "Track your performance with actionable insights.",
        badge: "Pro",
      },
      {
        id: "reviews",
        icon: MessageSquare,
        title: "Review Management",
        description:
          "Respond to customer reviews and build trust effortlessly.",
      },
      {
        id: "bookings",
        icon: Calendar,
        title: "Online Bookings",
        description: "Accept appointments directly through your profile.",
        badge: "Pro",
        size: "large",
      },
      {
        id: "marketing",
        icon: Megaphone,
        title: "Marketing Tools",
        description:
          "Promote your business with targeted ads and special offers.",
      },
      {
        id: "photos",
        icon: Camera,
        title: "Photo Gallery",
        description: "Showcase your business with unlimited high-res media.",
      },
    ],
    []
  );

  return (
    <SectionWrapper
      id="business-features"
      background="gray"
      className="overflow-hidden"
    >
      <SectionHeader
        badge="Business Solutions"
        title="Scale Your Local Presence"
        description="CHWK provides the professional tools you need to capture more leads and outshine the competition."
        align="center"
      />

      {/* Hero: Bento-style Featured Section */}
      <div className="relative mb-20">
        <div className="absolute inset-0 bg-primary/5 rounded-3xl -rotate-1 scale-[1.02]" />
        <div className="relative grid lg:grid-cols-5 gap-0 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-2xl">
          {/* Content Side */}
          <div className="lg:col-span-2 p-8 md:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-primary font-semibold mb-4">
              <TrendingUp className="w-5 h-5" />
              <span>Verified Results</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Turn your business into a{" "}
              <span className="text-primary">local icon.</span>
            </h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Join 61,000+ owners using our suite to drive revenue. CHWK
              isn&apos;t just a directory—it&apos;s your digital storefront.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Appear in top search results",
                "Direct WhatsApp integration",
                "Real-time lead alerts",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-700">
                  <div className="bg-green-100 p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="rounded-full px-8 shadow-primary transition-transform hover:scale-105"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full gap-2 group"
              >
                Watch Demo{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Dynamic Image/Dashboard Side */}
          <div className="lg:col-span-3 relative min-h-[400px] bg-gray-50 overflow-hidden">
            <Image
              src="/images/features/business-owner.png"
              alt="Dashboard Preview"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            {/* Floating Glass UI Elements */}
            <div className="absolute top-10 right-10 glass p-4 rounded-2xl animate-bounce-slow shadow-xl">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-400 p-2 rounded-lg text-white">
                  <Star className="fill-current w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">New Review!</p>
                  <p className="text-[10px] opacity-70">
                    {"Best service in town..."}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-10 left-10 glass p-5 rounded-2xl shadow-2xl backdrop-blur-xl border-white/20">
              <p className="text-sm font-semibold mb-2">Monthly Leads</p>
              <div className="flex items-end gap-1 h-12">
                {[40, 70, 45, 90, 65, 80].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-2 bg-primary/40 rounded-t-sm"
                  />
                ))}
              </div>
              <p className="text-xl font-bold mt-2 text-primary">+24%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-20">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className={cn(
                "group relative p-8 rounded-3xl bg-white border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]",
                feature.size === "large" ? "md:col-span-2" : "col-span-1"
              )}
            >
              <div className="mb-6 inline-flex p-4 rounded-2xl bg-gray-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Icon className="w-6 h-6" />
              </div>
              {feature.badge && (
                <Badge className="absolute top-8 right-8 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                  {feature.badge}
                </Badge>
              )}
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h4>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {feature.description}
              </p>
              <div className="mt-6 flex items-center gap-2 text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 cursor-pointer">
                <span>Learn more</span> <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 rounded-3xl overflow-hidden shadow-inner mb-20">
        {[
          { label: "Lead Growth", val: "40%", icon: TrendingUp },
          { label: "Active Users", val: "850K+", icon: Users },
          { label: "Setup Cost", val: "₹0", icon: DollarSign },
          { label: "Cities", val: "25+", icon: Target },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-10 text-center hover:bg-gray-50 transition-colors"
          >
            <stat.icon className="w-6 h-6 mx-auto mb-4 text-primary opacity-50" />
            <div className="text-4xl font-black text-gray-900 mb-2">
              {stat.val}
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action: Sleek Design */}
      <div className="relative bg-gray-900 rounded-[3rem] p-12 text-center overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 px-4 py-1">
            Ready to start?
          </Badge>
          <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Scale your vision today.
          </h3>
          <p className="text-gray-400 text-lg mb-10">
            Join the elite network of Indian businesses. No credit card, no
            hidden fees, just growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white rounded-full h-14 px-10 text-lg"
            >
              List My Business
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10 rounded-full h-14 px-10 text-lg"
            >
              View Premium
            </Button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
