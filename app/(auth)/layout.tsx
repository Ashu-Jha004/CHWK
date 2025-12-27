import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  Building2,
  Star,
  Users,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-white">
      {/* Left Side: Form Container */}
      <main className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Logo & Header */}
          <div className="mb-8">
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Image
                    src="/logo.png"
                    alt="CHWK Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  CHWK
                </h1>
              </div>
            </Link>

            {/* Back to Home Link */}
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1 group"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to home
            </Link>
          </div>

          {/* Form Content (children) */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 auth-card">
            {children}
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Right Side: Marketing/Visual Column */}
      <div className="hidden lg:flex relative flex-1 bg-gradient-to-br from-primary via-accent to-secondary overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-8 gap-4 transform rotate-12 scale-150">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full aspect-square rounded-lg border border-white/20"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Top Section: Main Message */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                Trusted by 850K+ users
              </span>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
              Discover & Connect with Local Businesses
            </h2>
            <p className="text-xl text-white/90 mb-12 leading-relaxed max-w-md">
              Join thousands of customers and businesses already using CHWK to
              grow and discover amazing local services.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">61K+</div>
                </div>
                <p className="text-white/80 text-sm">Verified Businesses</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">4.8/5</div>
                </div>
                <p className="text-white/80 text-sm">Average Rating</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">850K+</div>
                </div>
                <p className="text-white/80 text-sm">Active Users</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">25+</div>
                </div>
                <p className="text-white/80 text-sm">Cities Covered</p>
              </div>
            </div>
          </div>

          {/* Bottom Section: Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Why Choose CHWK?</h3>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Verified Businesses</p>
                <p className="text-sm text-white/70">
                  All businesses are verified by our team for quality assurance
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Safe & Secure</p>
                <p className="text-sm text-white/70">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Quick Setup</p>
                <p className="text-sm text-white/70">
                  Get started in minutes with our simple onboarding
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-white text-white" />
              ))}
            </div>
            <p className="text-white/90 mb-4 italic">
              CHWK transformed how we connect with customers. Our business grew
              40% in just 2 months!
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-semibold">
                RK
              </div>
              <div>
                <p className="font-semibold">Rajesh Kumar</p>
                <p className="text-sm text-white/70">
                  Restaurant Owner, Bangalore
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
