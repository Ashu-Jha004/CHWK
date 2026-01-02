"use client";

import React from "react";
import {
  BookOpen,
  Code2,
  Layout,
  Zap,
  ShieldCheck,
  Globe,
  Smartphone,
  Palette,
  Layers,
  Search,
  MapPin,
  Video,
  Monitor,
  Database,
  Lock,
  Route,
  ChevronRight
} from "lucide-react";

const DocumentationPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Header Section */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className="text-xl font-bold tracking-tight">CHWK <span className="text-primary">Docs</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#overview" className="text-sm font-medium hover:text-primary transition-colors">Overview</a>
            <a href="#tech-stack" className="text-sm font-medium hover:text-primary transition-colors">Tech Stack</a>
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#routes" className="text-sm font-medium hover:text-primary transition-colors">Routes</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Intro */}
        <section id="overview" className="mb-20 animate-scale-in">
          <div className="flex items-center gap-2 text-primary mb-4">
            <BookOpen size={20} />
            <span className="uppercase tracking-widest text-xs font-bold">Documentation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Comprehensive Project <span className="text-gradient">Guide</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
            CHWK is a high-performance, premium local business directory designed with a vibrant Indian aesthetic.
            It connects users with local services through a seamless, mobile-first experience powered by modern web technologies.
          </p>
        </section>

        {/* Tech Stack Grid */}
        <section id="tech-stack" className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Code2 className="text-primary" /> Tech Stack
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TechCard
              title="Frontend Framework"
              items={["Next.js 16 (App Router)", "React 19", "TypeScript"]}
              icon={<Globe className="text-blue-500" />}
            />
            <TechCard
              title="Styling & UI"
              items={["Tailwind CSS 4", "Radix UI", "Lucide Icons", "Glassmorphism"]}
              icon={<Palette className="text-pink-500" />}
            />
            <TechCard
              title="Authentication"
              items={["Clerk Auth", "Role-based Access", "Secure Middleware"]}
              icon={<ShieldCheck className="text-green-500" />}
            />
            <TechCard
              title="Backend & Data"
              items={["Prisma ORM", "PostgreSQL", "TanStack Query", "Zustand"]}
              icon={<Database className="text-indigo-500" />}
            />
            <TechCard
              title="Media & Services"
              items={["Cloudinary Media", "YouTube Integration", "Sentry Monitoring", "Leaflet Maps"]}
              icon={<Layers className="text-orange-500" />}
            />
            <TechCard
              title="Optimization"
              items={["SEO Structured Data", "PWA Support", "Dynamic Sitemap", "Zod Validation"]}
              icon={<Zap className="text-yellow-500" />}
            />
          </div>
        </section>

        {/* Feature Sections */}
        <section id="features" className="mb-24">
          <h2 className="text-3xl font-bold tracking-tight mb-8 flex items-center gap-3">
            <Layout className="text-primary" /> Core Features
          </h2>
          <div className="space-y-12">
            <FeatureRow
              title="Conversion-Optimized Landing Page"
              description="A sophisticated hero section with intelligent search, categorized business browsing, featured listings, stats overview, customer testimonials, and an interactive 'How it Works' guide."
              icon={<Search />}
              tags={["Hero Section", "Stats", "Testimonials", "Smooth Animations"]}
            />
            <FeatureRow
              title="Next-Gen Business Profiles"
              description="Comprehensive business identities with specialized tabs for Overview, About, Services, Products, Staff, Reviews, Photos, and interactive Leaflet Maps."
              icon={<Monitor />}
              tags={["Dynamic Tabs", "Review System", "Staff Management", "Cloudinary Gallery"]}
              reverse
            />
            <FeatureRow
              title="Interactive Mapping"
              description="Seamless Leaflet integration allowing users to visualize business locations, explore neighborhoods, and get directions directly within the app."
              icon={<MapPin />}
              tags={["Leaflet", "Real-time Location", "Business Area Visualization"]}
            />
            <FeatureRow
              title="Multimedia Integration"
              description="Engagement-focused profiles with high-quality Cloudinary image galleries and YouTube intro videos to showcase business personality."
              icon={<Video />}
              tags={["Cloudinary", "YouTube Embed", "Video Previews"]}
              reverse
            />
            <FeatureRow
              title="Progressive Web App (PWA)"
              description="Fully installable experience with custom service workers, web manifests, and an 'Add to Home Screen' prompt for native-like performance."
              icon={<Smartphone />}
              tags={["Service Workers", "Offline Support", "Install Prompts"]}
            />
          </div>
        </section>

        {/* Routes & Architecture */}
        <section id="routes" className="mb-24">
          <h2 className="text-3xl font-bold tracking-tight mb-8 flex items-center gap-3">
            <Route className="text-primary" /> Application Structure
          </h2>
          <div className="bg-muted/50 rounded-2xl p-6 md:p-8 border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Key Routes
                </h3>
                <ul className="space-y-3">
                  <RouteItem path="/" label="Landing Page" />
                  <RouteItem path="/search" label="Business Discovery" />
                  <RouteItem path="/business_service/[slug]" label="Business Detail Page" />
                  <RouteItem path="/sign-in" label="Authentication" />
                  <RouteItem path="/dashboard" label="User/Business Dashboard" />
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Project Organization
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-sm text-primary">app/</span>
                    <span className="text-sm text-muted-foreground">App Router pages and layouts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-sm text-primary">components/</span>
                    <span className="text-sm text-muted-foreground">Reusable UI and feature components</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-sm text-primary">prisma/</span>
                    <span className="text-sm text-muted-foreground">Database schema and migrations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-sm text-primary">lib/</span>
                    <span className="text-sm text-muted-foreground">Server actions and utility functions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Design System Highlight */}
        <section className="bg-secondary text-secondary-foreground rounded-3xl p-8 md:p-12 overflow-hidden relative">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Design Philosophy</h2>
            <p className="text-lg opacity-90 mb-6">
              Vibrant Indian aesthetic combined with professional trust. We use a primary orange theme (#FF6B35)
              symbolizing energy, paired with deep midnight blue for grounding and authority.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm font-medium">Primary Orange</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-sm font-medium">Midnight Blue</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <div className="w-3 h-3 rounded-full bg-[#2A9D8F]" />
                <span className="text-sm font-medium">Success Teal</span>
              </div>
            </div>
          </div>
          {/* Abstract blobs for design */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl -mr-16 -mb-16" />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CHWK Documentation. Powering local connections.
          </p>
        </div>
      </footer>
    </div>
  );
};

/* Sub-components */

const TechCard = ({ title, items, icon }: { title: string, items: string[], icon: React.ReactNode }) => (
  <div className="p-6 rounded-2xl border bg-card text-card-foreground hover:shadow-lg transition-all duration-300 card-hover">
    <div className="mb-4">{icon}</div>
    <h3 className="font-bold mb-3">{title}</h3>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-border" />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const FeatureRow = ({ title, description, icon, tags, reverse = false }: { title: string, description: string, icon: React.ReactNode, tags: string[], reverse?: boolean }) => (
  <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${reverse ? 'md:flex-row-reverse' : ''}`}>
    <div className="flex-1">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 tracking-tight">{title}</h3>
      <p className="text-muted-foreground mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="px-3 py-1 bg-muted rounded-full text-xs font-semibold text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </div>
    <div className="flex-1 w-full aspect-video bg-muted rounded-2xl border border-dashed flex items-center justify-center text-muted-foreground/50 overflow-hidden relative">
      {/* Mock visual element */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="scale-150 opacity-20">{icon}</div>
      <span className="text-sm font-medium relative z-10 tracking-widest uppercase">Feature Preview</span>
    </div>
  </div>
);

const RouteItem = ({ path, label }: { path: string, label: string }) => (
  <li className="flex items-center gap-3 py-1">
    <ChevronRight size={14} className="text-primary" />
    <span className="font-mono text-sm bg-muted-foreground/10 px-2 py-0.5 rounded text-foreground">{path}</span>
    <span className="text-sm text-muted-foreground">— {label}</span>
  </li>
);

export default DocumentationPage;
