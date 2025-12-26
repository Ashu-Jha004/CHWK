"use client";

import { useState, useEffect, useCallback, useMemo, JSX } from "react";
import { SectionWrapper } from "./layout/section-wrapper";
import { SectionHeader } from "./layout/section-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TESTIMONIALS, type Testimonial } from "@/lib/(landing_page)/constants";
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building2,
  User,
  Play,
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Testimonials Section Component
 * Displays customer and business testimonials in a carousel
 * Features auto-rotation, manual navigation, and pause functionality
 */
export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Group testimonials for desktop view (3 per slide)
  const testimonialsPerSlide = 3;
  const totalSlides = Math.ceil(TESTIMONIALS.length / testimonialsPerSlide);

  // Get visible testimonials for current slide
  const visibleTestimonials = useMemo(() => {
    const start = currentIndex * testimonialsPerSlide;
    return TESTIMONIALS.slice(start, start + testimonialsPerSlide);
  }, [currentIndex]);

  // Navigation handlers
  const goToNext = useCallback(() => {
    try {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    } catch (error) {
      console.error("Error navigating to next slide:", error);
    }
  }, [totalSlides]);

  const goToPrevious = useCallback(() => {
    try {
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    } catch (error) {
      console.error("Error navigating to previous slide:", error);
    }
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    try {
      setCurrentIndex(index);
    } catch (error) {
      console.error("Error navigating to slide:", error);
    }
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isPaused) return;

    const interval = setInterval(() => {
      goToNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, isPaused, goToNext]);

  // Toggle auto-play
  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev) => !prev);
  }, []);

  // Pause on hover
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Render star rating
  const renderStars = useCallback((rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              "w-4 h-4",
              index < rating
                ? "fill-accent text-accent"
                : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
      </div>
    );
  }, []);

  return (
    <SectionWrapper id="testimonials" background="gray">
      <SectionHeader
        badge="Testimonials"
        title="What Our Community Says"
        description="Real stories from real people who've discovered amazing local businesses through CHWK"
        align="center"
      />

      {/* Carousel Container */}
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Desktop Grid View */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-8">
          {visibleTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              renderStars={renderStars}
              index={index}
            />
          ))}
        </div>

        {/* Tablet View (2 columns) */}
        <div className="hidden md:grid lg:hidden md:grid-cols-2 gap-6 mb-8">
          {visibleTestimonials.slice(0, 2).map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              renderStars={renderStars}
              index={index}
            />
          ))}
        </div>

        {/* Mobile View (1 column) */}
        <div className="md:hidden mb-8">
          {visibleTestimonials.slice(0, 1).map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              renderStars={renderStars}
              index={index}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-colors focus-visible-ring z-10"
          aria-label="Previous testimonials"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>

        <button
          onClick={goToNext}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-colors focus-visible-ring z-10"
          aria-label="Next testimonials"
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Slide Indicators */}
        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all focus-visible-ring",
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAutoPlay}
          className="gap-2"
        >
          {isAutoPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Play</span>
            </>
          )}
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="mt-16 bg-white rounded-2xl p-8 md:p-12 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              4.8/5
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
            <div className="flex justify-center mt-2">{renderStars(5)}</div>
          </div>

          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              320K+
            </div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>

          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              98%
            </div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </div>

          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              850K+
            </div>
            <div className="text-sm text-gray-600">Happy Users</div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

/**
 * Individual Testimonial Card Component
 */
interface TestimonialCardProps {
  testimonial: Testimonial;
  renderStars: (rating: number) => JSX.Element;
  index: number;
}

function TestimonialCard({
  testimonial,
  renderStars,
  index,
}: TestimonialCardProps) {
  return (
    <Card
      className={cn(
        "relative bg-white p-6 md:p-8 border-0 shadow-md hover:shadow-xl",
        "transition-all duration-300 overflow-hidden",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Quote Icon */}
      <div className="absolute top-6 right-6 opacity-10">
        <Quote className="w-16 h-16 text-primary" />
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-4 relative z-10">
        {/* Avatar */}
        <Avatar className="w-14 h-14 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
            {testimonial.avatar}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1">
          <h4 className="font-bold text-lg text-gray-900">
            {testimonial.name}
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            {testimonial.business ? (
              <>
                <Building2 className="w-4 h-4" />
                <span>{testimonial.business}</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                <span>{testimonial.role}</span>
              </>
            )}
          </div>

          {/* Rating */}
          {renderStars(testimonial.rating)}
        </div>
      </div>

      {/* Review Content */}
      <blockquote className="text-gray-700 leading-relaxed mb-4 relative z-10">
        {testimonial.content}
      </blockquote>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <MapPin className="w-4 h-4" />
        <span>{testimonial.location}</span>
      </div>

      {/* Badge for Business Owners */}
      {testimonial.business && (
        <Badge
          variant="secondary"
          className="absolute top-6 left-6 bg-primary/10 text-primary"
        >
          Business Owner
        </Badge>
      )}
    </Card>
  );
}
