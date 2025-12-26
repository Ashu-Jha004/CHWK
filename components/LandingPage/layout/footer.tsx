"use client";

import { useCallback, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowUp,
} from "lucide-react";
import { useNewsletterSubscription } from "@/hooks/landing_page/use-contact-form";
import { CATEGORIES, TIER_1_CITIES } from "@/lib/(landing_page)/constants";

/**
 * Footer Component
 * Features: Newsletter signup, social links, sitemap, business info
 * Fully responsive and SEO optimized
 */
export function Footer() {
  const [email, setEmail] = useState("");
  const { subscribe, isLoading, successMessage, error, reset } =
    useNewsletterSubscription();

  // Handle newsletter submission
  const handleNewsletterSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      try {
        if (!email.trim()) {
          return;
        }

        subscribe(email);

        // Clear input on success
        if (successMessage) {
          setEmail("");
        }
      } catch (error) {
        console.error("Newsletter submission error:", error);
      }
    },
    [email, subscribe, successMessage]
  );

  // Scroll to top
  const scrollToTop = useCallback(() => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Scroll to top error:", error);
    }
  }, []);

  // Featured categories for footer
  const featuredCategories = useMemo(() => CATEGORIES.slice(0, 6), []);

  // Featured cities for footer
  const featuredCities = useMemo(() => TIER_1_CITIES.slice(0, 6), []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 relative">
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 focus-visible-ring"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <div className="container mx-auto px-4 md:px-6 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="font-bold text-2xl text-white">CHWK</span>
            </div>
            <p className="text-sm leading-relaxed">
              Discover the best local businesses and services across India.
              Connect with trusted restaurants, salons, healthcare providers,
              and more in your city.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3 pt-2">
              <Link
                href="https://facebook.com/chwk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors focus-visible-ring"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </Link>
              <Link
                href="https://twitter.com/chwk_india"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors focus-visible-ring"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="https://instagram.com/chwk_india"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors focus-visible-ring"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </Link>
              <Link
                href="https://linkedin.com/company/chwk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors focus-visible-ring"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link
                href="https://youtube.com/@chwk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors focus-visible-ring"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Popular Categories
            </h3>
            <ul className="space-y-2">
              {featuredCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.id}`}
                    className="text-sm hover:text-primary transition-colors animated-underline inline-block focus-visible-ring"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-primary hover:text-primary/80 font-medium focus-visible-ring"
                >
                  View All Categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Cities */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Top Cities
            </h3>
            <ul className="space-y-2">
              {featuredCities.map((city) => (
                <li key={city}>
                  <Link
                    href={`/city/${city.toLowerCase()}`}
                    className="text-sm hover:text-primary transition-colors animated-underline inline-block focus-visible-ring"
                  >
                    {city}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/cities"
                  className="text-sm text-primary hover:text-primary/80 font-medium focus-visible-ring"
                >
                  View All Cities →
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Stay Updated
            </h3>
            <p className="text-sm mb-4">
              Subscribe to our newsletter for the latest updates and exclusive
              offers.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error || successMessage) reset();
                  }}
                  disabled={isLoading}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gap-2 btn-shine"
              >
                {isLoading ? (
                  "Subscribing..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Subscribe
                  </>
                )}
              </Button>

              {/* Success/Error Messages */}
              {successMessage && (
                <p className="text-xs text-green-400 animate-fade-in">
                  {successMessage}
                </p>
              )}
              {error && (
                <p className="text-xs text-red-400 animate-fade-in">{error}</p>
              )}
            </form>
          </div>
        </div>

        {/* Quick Links */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Company */}
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/press"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Press
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Businesses */}
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">
                For Businesses
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/business/signup"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    List Your Business
                  </Link>
                </li>
                <li>
                  <Link
                    href="/business/login"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Business Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/business/pricing"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Pricing Plans
                  </Link>
                </li>
                <li>
                  <Link
                    href="/business/resources"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Resources
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/help"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-xs hover:text-primary transition-colors focus-visible-ring"
                  >
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h5 className="text-white font-medium text-sm mb-1">Email</h5>
                <a
                  href="mailto:support@chwk.com"
                  className="text-sm hover:text-primary transition-colors focus-visible-ring"
                >
                  support@chwk.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h5 className="text-white font-medium text-sm mb-1">Phone</h5>
                <a
                  href="tel:+911234567890"
                  className="text-sm hover:text-primary transition-colors focus-visible-ring"
                >
                  +91 123 456 7890
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h5 className="text-white font-medium text-sm mb-1">Address</h5>
                <p className="text-sm">Mumbai, Maharashtra, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-center md:text-left">
              © {currentYear} CHWK. All rights reserved. Made with ❤️ in India.
            </p>

            {/* Trust Badges */}
            <div className="flex items-center gap-4">
              <span className="text-xs">🔒 Secure Platform</span>
              <span className="text-xs">✓ Verified Businesses</span>
              <span className="text-xs">⭐ Trusted Reviews</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
