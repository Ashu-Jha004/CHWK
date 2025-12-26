"use client";
import { Metadata } from "next";
import { Header } from "@/components/LandingPage/layout/header";
import { Footer } from "@/components/LandingPage/layout/footer";
import { HeroSection } from "@/components/LandingPage/hero-section";
import { SectionWrapper } from "@/components/LandingPage/layout/section-wrapper";
import { SectionHeader } from "@/components/LandingPage/layout/section-header";
import { StatsSection } from "@/components/LandingPage/stats-section";
import { FeaturedBusinessesSection } from "@/components/LandingPage/featured-businesses-section";
import { CategoriesSection } from "@/components/LandingPage/categories-section";
import { BusinessFeaturesSection } from "@/components/LandingPage/business-features-section";
import { CustomerFeaturesSection } from "@/components/LandingPage/customer-features-section";
import { HowItWorksSection } from "@/components/LandingPage/how-it-works-section";
import { FinalCTASection } from "@/components/LandingPage/final-cta-section";
import { TestimonialsSection } from "@/components/LandingPage/testimonials-section";
export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Stats Section */}
        <StatsSection />

        {/* Categories Section */}
        <CategoriesSection />

        {/* Featured Businesses */}
        <FeaturedBusinessesSection />

        {/* Customer Features */}
        <CustomerFeaturesSection />

        {/* Business Features */}
        <BusinessFeaturesSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Final CTA */}
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
}
