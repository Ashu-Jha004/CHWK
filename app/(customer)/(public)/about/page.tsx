"use client";

import React from "react";
import Image from "next/image";
import { Header } from "@/components/LandingPage/layout/header";
import { Footer } from "@/components/LandingPage/layout/footer";
import { SectionWrapper } from "@/components/LandingPage/layout/section-wrapper";
import { SectionHeader } from "@/components/LandingPage/layout/section-header";
import {
  Users,
  Target,
  Rocket,
  Heart,
  Trophy,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-muted">
          <div className="container-padding relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-2xl">
                <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  Our Story
                </span>
                <h1 className="text-responsive-3xl font-bold mb-6 leading-tight">
                  Revolutionizing the way <br />
                  <span className="text-gradient">India Connects</span> with <br />
                  Local Businesses
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  CHWK was founded with a single mission: to empower local businesses in India
                  by providing them with a premium, digital stage to showcase their excellence
                  and connect with customers seamlessly.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/search"
                    className="px-8 py-3.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 btn-shine shadow-lg shadow-primary/20"
                  >
                    Explore Businesses <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/onboarding"
                    className="px-8 py-3.5 bg-white text-foreground border border-border rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Join as a Partner
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                  <Image
                    src="/images/about/hero.png"
                    alt="CHWK Team Collaboration"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        </section>

        {/* Vision & Mission */}
        <SectionWrapper className="bg-white">
          <SectionHeader
            title="Vision & Mission"
            subtitle="What drives us forward every day"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-muted border border-border card-hover">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become India's most trusted and vibrant ecosystem for local discovery,
                where every business, no matter how small, has the opportunity to thrive.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-muted border border-border card-hover">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                Bridge the digital divide for local service providers by offering
                cutting-edge tools, high-performance profiles, and an unmatched user experience.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-muted border border-border card-hover">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-4">Our Values</h3>
              <p className="text-muted-foreground leading-relaxed">
                Trust, Transparency, and Community are at our core. We believe in building
                relationships that benefit both the customer and the business owner.
              </p>
            </div>
          </div>
        </SectionWrapper>

        {/* Our Founders */}
        <section className="section-spacing bg-muted">
          <div className="container-padding">
            <SectionHeader
              title="The Faces Behind CHWK"
              subtitle="Meet the visionaries leading the revolution"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Founder 1 */}
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start glass p-8 rounded-3xl border border-white/20 shadow-xl">
                <div className="w-48 h-48 relative rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                  <Image
                    src="/images/about/founder_ashu.png"
                    alt="Ashu Jha"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Ashu Jha</h3>
                  <p className="text-primary font-medium mb-4">CEO & Founder</p>
                  <p className="text-muted-foreground leading-relaxed">
                    With over 3 years of experience in the Indian tech ecosystem, Ashu formerly led
                    product departments at major marketplaces. He founded CHWK to solve the
                    fragmentation he saw in local service discovery.
                  </p>
                  <div className="mt-6 flex gap-4">
                    <button className="text-muted-foreground hover:text-primary transition-colors">LinkedIn</button>
                    <button className="text-muted-foreground hover:text-primary transition-colors">Twitter</button>
                  </div>
                </div>
              </div>

              {/* Founder 2 */}
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start glass p-8 rounded-3xl border border-white/20 shadow-xl">
                <div className="w-48 h-48 relative rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                  <Image
                    src="/images/about/founder_priya.png"
                    alt="Priya Iyer"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Pragati Jha</h3>
                  <p className="text-primary font-medium mb-4">COO & Co-Founder</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Pragati is a community builder at heart. Her background in operations and local
                    governance collaborations has been instrumental in onboarding our first
                    5,000+ businesses across Tier 1 and Tier 2 cities.
                  </p>
                  <div className="mt-6 flex gap-4">
                    <button className="text-muted-foreground hover:text-primary transition-colors">LinkedIn</button>
                    <button className="text-muted-foreground hover:text-primary transition-colors">Twitter</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Details & Stats */}
        <SectionWrapper className="bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-responsive-2xl font-bold mb-8">Built for the <span className="text-gradient">Modern Bharat</span></h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 self-start">
                    <Trophy className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Verified Excellence</h4>
                    <p className="text-muted-foreground">Every business on CHWK goes through a verification process to ensure trust and quality for our users.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 self-start">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Community First</h4>
                    <p className="text-muted-foreground">We prioritize user feedback and community growth, creating a self-sustaining loop of quality discovery.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 self-start">
                    <Lightbulb className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Cutting Edge Tech</h4>
                    <p className="text-muted-foreground">Our AI-powered search and modern UI make discovery faster than any other directory in the market.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/about/team_collab.png"
                alt="Our Team at Work"
                width={800}
                height={600}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
                <div className="text-white">
                  <p className="text-2xl font-bold">50+ Passionate Individuals</p>
                  <p className="text-white/80 text-sm">Working across 5 cities to build the future of local commerce.</p>
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Global Reach / Cities (Simulated) */}
        <section className="py-20 bg-muted">
          <div className="container-padding text-center">
            <h2 className="text-responsive-xl font-bold mb-12">Growing Fast Across India</h2>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               {["MUMBAI", "DELHI", "BANGALORE", "HYDERABAD", "CHENNAI", "PUNE"].map((city) => (
                 <span key={city} className="text-2xl font-black tracking-widest">{city}</span>
               ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-spacing text-center bg-white">
          <div className="container-padding">
            <div className="glass p-12 md:p-20 rounded-[3rem] border border-primary/10 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
               <h2 className="text-responsive-2xl font-bold mb-6">Ready to Experience the Difference?</h2>
               <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                 Whether you're looking for a service or looking to grow your business,
                 CHWK is here to make it happen.
               </p>
               <div className="flex flex-wrap justify-center gap-4">
                 <Link href="/search" className="px-10 py-4 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all btn-shine shadow-xl shadow-primary/25">
                   Start Searching
                 </Link>
                 <Link href="/sign-up" className="px-10 py-4 bg-foreground text-white rounded-xl font-bold hover:scale-105 transition-all shadow-xl">
                   Join the Community
                 </Link>
               </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
