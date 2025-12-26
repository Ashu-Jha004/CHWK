"use client";

import { useState, useMemo, useCallback } from "react";
import { SectionWrapper } from "./layout/section-wrapper";
import { SectionHeader } from "./layout/section-header";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  Star,
  Phone,
  FileText,
  CheckCircle2,
  Upload,
  Users,
  TrendingUp,
  UserCircle2,
  ShoppingBag,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
}

type UserType = "customer" | "business";

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<UserType>("customer");

  const customerSteps: Step[] = useMemo(
    () => [
      {
        id: "search",
        number: "01",
        title: "Search & Discover",
        description:
          "Instantly find local services. Browse verified profiles with real photos and live ratings.",
        icon: Search,
        color: "text-orange-500",
        gradient: "from-orange-500/20 to-transparent",
      },
      {
        id: "explore",
        number: "02",
        title: "Compare Options",
        description:
          "Deep dive into business history, read authentic reviews, and view service catalogs.",
        icon: MapPin,
        color: "text-blue-500",
        gradient: "from-blue-500/20 to-transparent",
      },
      {
        id: "review",
        number: "03",
        title: "Verify Quality",
        description:
          "Check past customer experiences and community-vetted success stories.",
        icon: Star,
        color: "text-yellow-500",
        gradient: "from-yellow-500/20 to-transparent",
      },
      {
        id: "connect",
        number: "04",
        title: "Direct Connect",
        description:
          "Book directly, chat on WhatsApp, or call without any middleman fees.",
        icon: Phone,
        color: "text-emerald-500",
        gradient: "from-emerald-500/20 to-transparent",
      },
    ],
    []
  );

  const businessSteps: Step[] = useMemo(
    () => [
      {
        id: "signup",
        number: "01",
        title: "Digital Storefront",
        description:
          "Claim your profile and build a professional digital presence in under 5 minutes.",
        icon: FileText,
        color: "text-orange-500",
        gradient: "from-orange-500/20 to-transparent",
      },
      {
        id: "verify",
        number: "02",
        title: "Fast Verification",
        description:
          "Get the 'CHWK Verified' badge within 24 hours to skyrocket your credibility.",
        icon: CheckCircle2,
        color: "text-emerald-500",
        gradient: "from-emerald-500/20 to-transparent",
      },
      {
        id: "enhance",
        number: "03",
        title: "Showcase Skills",
        description:
          "Upload your best work and list services to attract high-intent customers.",
        icon: Upload,
        color: "text-blue-500",
        gradient: "from-blue-500/20 to-transparent",
      },
      {
        id: "grow",
        number: "04",
        title: "Scale Revenue",
        description:
          "Monitor leads, respond to reviews, and see your inquiries grow month-over-month.",
        icon: TrendingUp,
        color: "text-purple-500",
        gradient: "from-purple-500/20 to-transparent",
      },
    ],
    []
  );

  const activeSteps = activeTab === "customer" ? customerSteps : businessSteps;

  return (
    <SectionWrapper
      id="how-it-works"
      background="white"
      className="overflow-hidden"
    >
      <SectionHeader
        badge="Experience CHWK"
        title="Connecting local needs to local expertise"
        description="Whether you're looking for a service or looking to grow, we've made the journey seamless."
        align="center"
      />

      {/* Modern Interactive Tab Switcher */}
      <div className="flex justify-center mb-20">
        <div className="relative flex bg-slate-100 p-1 rounded-2xl w-full max-w-[400px]">
          <div
            className={cn(
              "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out",
              activeTab === "business" ? "translate-x-full" : "translate-x-0"
            )}
          />
          <button
            onClick={() => setActiveTab("customer")}
            className={cn(
              "relative z-10 flex-1 py-3 text-sm font-bold transition-colors",
              activeTab === "customer" ? "text-primary" : "text-slate-500"
            )}
          >
            For Customers
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={cn(
              "relative z-10 flex-1 py-3 text-sm font-bold transition-colors",
              activeTab === "business" ? "text-primary" : "text-slate-500"
            )}
          >
            For Businesses
          </button>
        </div>
      </div>

      {/* Dynamic Steps Grid */}
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Connection Line (Desktop) */}
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-slate-100 -translate-y-1/2 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {activeSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id + activeTab}
                className="group relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
              >
                {/* Step Number Background */}
                <span className="absolute -top-4 -right-2 text-7xl font-black text-slate-50 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                  {step.number}
                </span>

                <div
                  className={cn(
                    "inline-flex p-4 rounded-2xl mb-6 bg-gradient-to-br transition-transform group-hover:scale-110 duration-300",
                    step.gradient
                  )}
                >
                  <Icon className={cn("w-8 h-8", step.color)} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-widest",
                      step.color
                    )}
                  >
                    Step {step.number}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
                  {step.title}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {step.description}
                </p>

                <div className="w-8 h-1 bg-slate-100 group-hover:w-full group-hover:bg-primary transition-all duration-500" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-24 max-w-5xl mx-auto">
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 relative overflow-hidden">
          {/* Decorative Blur */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 blur-[80px] rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {activeTab === "customer"
                  ? "Ready to find your pro?"
                  : "Ready to scale your business?"}
              </h3>
              <p className="text-slate-400">
                Join the CHWK ecosystem and experience the difference.
              </p>
            </div>

            <Button
              size="lg"
              className="rounded-full h-14 px-10 gap-2 btn-shine shadow-xl"
            >
              {activeTab === "customer"
                ? "Start Searching"
                : "List My Business"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
