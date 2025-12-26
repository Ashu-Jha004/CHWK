"use client";

import { SectionWrapper } from "./layout/section-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Store,
  Search,
  Mail,
  Loader2,
} from "lucide-react"; // or lucide-react
import { useState, useCallback } from "react";
import { useNewsletterSubscription } from "@/hooks/landing_page/use-contact-form";
import { cn } from "@/lib/utils";

export function FinalCTASection() {
  const [email, setEmail] = useState("");
  const { subscribe, isLoading, successMessage, error, reset } =
    useNewsletterSubscription();

  const handleNewsletterSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      subscribe(email);
      if (successMessage) setEmail("");
    },
    [email, subscribe, successMessage]
  );

  return (
    <SectionWrapper background="white" className="pb-20">
      {/* Main CTA: High Contrast Dark Mode Card */}
      <div className="relative group bg-slate-950 rounded-[2.5rem] p-10 md:p-20 text-white mb-24 overflow-hidden shadow-2xl">
        {/* Modern Mesh Gradient Background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-primary-foreground mb-8 animate-bounce-slow">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold tracking-wide">
              Start your journey today
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-[1.1]">
            Ready to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
              transform
            </span>{" "}
            your reach?
          </h2>

          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed">
            Join a community of 850,000+ users discovering local excellence
            every single day.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 h-14 text-lg shadow-[0_0_20px_rgba(255,107,53,0.4)] transition-all hover:scale-105"
            >
              <Search className="w-5 h-5 mr-2" />
              Explore Market
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 rounded-full px-10 h-14 text-lg"
            >
              <Store className="w-5 h-5 mr-2" />
              List Business
            </Button>
          </div>

          {/* Trust Indicators with improved styling */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-12 pt-8 border-t border-white/10">
            {["Free to start", "No credit card", "Verified listings"].map(
              (text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-slate-400 text-sm font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {text}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Newsletter: Clean & Minimalist */}
      <div className="relative max-w-4xl mx-auto">
        <div className="bg-slate-50 rounded-[2rem] p-8 md:p-12 border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-md text-center lg:text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Stay in the loop
            </h3>
            <p className="text-slate-600">
              Get weekly insights on business growth and local trends delivered
              straight to your inbox.
            </p>
          </div>

          <div className="w-full max-w-md">
            <form
              onSubmit={handleNewsletterSubmit}
              className="relative space-y-3"
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error || successMessage) reset();
                  }}
                  disabled={isLoading}
                  className="pl-12 h-16 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all text-lg"
                  required
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Join <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>

              {/* Status Messages with feedback styling */}
              {successMessage && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm animate-in fade-in slide-in-from-top-1">
                  <CheckCircle2 className="w-4 h-4" /> {successMessage}
                </div>
              )}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg animate-in fade-in">
                  {error}
                </div>
              )}
            </form>
            <p className="text-center lg:text-left text-xs text-slate-400 mt-4 px-2">
              Join 12,000+ subscribers. No spam, ever.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
