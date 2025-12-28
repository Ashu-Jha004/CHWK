// components/business-onboarding/steps/step8-review.tsx
// Step 8: Review all information and submit (Fixed)

"use client";

import React, { useState } from "react";
import {
  Check,
  Edit,
  Building2,
  MapPin,
  Tag,
  Clock,
  Star,
  FileText,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { DayOfWeek } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useBusinessOnboardingStore } from "@/store/businessOnboarding/business-onboarding.store";
import { StepWrapper } from "../step-wrapper";

const DAYS_MAP: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function Step8Review() {
  // Get store data - this will re-render when store updates
  const store = useBusinessOnboardingStore();
  const {
    basicInfo,
    location,
    categories,
    businessHours,
    businessDetails,
    documentation,
    photos,
    isSubmitting,
    submitError,
  } = store;

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async () => {
    if (store.isSubmitting) return;

    if (!agreedToTerms) {
      store.setSubmitError("Please agree to the terms and conditions");
      return;
    }

    try {
      store.setSubmitting(true);
      store.setSubmitError(undefined);

      // ✅ Get FRESH data from store at submission time
      const freshState = useBusinessOnboardingStore.getState();

      console.log("[Review] Fresh state:", freshState);
      console.log("[Review] Basic info:", freshState.basicInfo);

      // Prepare submission data
      const submissionData = {
        basicInfo: freshState.basicInfo,
        location: freshState.location,
        categories: freshState.categories,
        businessHours: freshState.businessHours,
        businessDetails: freshState.businessDetails,
        documentation: freshState.documentation,
        photos: freshState.photos,
      };

      console.log("[Review] Submitting data:", submissionData);

      // API call
      const response = await fetch("/api/business/onboarding-v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      const result = await response.json();
      console.log("[Review] Submission successful:", result);

      store.setComplete(true);

      // Redirect to success page or dashboard
      // router.push('/business/dashboard');
    } catch (error) {
      console.error("[Review] Submission error:", error);
      store.setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to submit. Please try again."
      );
    } finally {
      store.setSubmitting(false);
    }
  };

  return (
    <StepWrapper
      title="Review & Submit"
      description="Review your information before submitting"
      step={8}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <ReviewSection
          icon={<Building2 className="w-5 h-5" />}
          title="Basic Information"
          onEdit={() => store.jumpToStep(1)}
        >
          <ReviewItem label="Business Name" value={basicInfo.name} />
          <ReviewItem label="Email" value={basicInfo.email} />
          <ReviewItem label="Phone" value={basicInfo.phone} />
          {basicInfo.description && (
            <ReviewItem label="Description" value={basicInfo.description} />
          )}
          {basicInfo.website && (
            <ReviewItem label="Website" value={basicInfo.website} />
          )}
          {basicInfo.isPartOfChain && (
            <>
              <ReviewItem label="Chain Name" value={basicInfo.chainName} />
              {basicInfo.branchName && (
                <ReviewItem label="Branch" value={basicInfo.branchName} />
              )}
            </>
          )}
        </ReviewSection>

        {/* Location */}
        <ReviewSection
          icon={<MapPin className="w-5 h-5" />}
          title="Location"
          onEdit={() => store.jumpToStep(2)}
        >
          <ReviewItem
            label="Address"
            value={`${location.addressLine1}${
              location.addressLine2 ? ", " + location.addressLine2 : ""
            }`}
          />
          {location.landmark && (
            <ReviewItem label="Landmark" value={location.landmark} />
          )}
          <ReviewItem
            label="City"
            value={`${location.city}, ${location.state} - ${location.pincode}`}
          />
          <ReviewItem
            label="Coordinates"
            value={`${location.latitude?.toFixed(
              6
            )}, ${location.longitude?.toFixed(6)}`}
          />
        </ReviewSection>

        {/* Categories */}
        <ReviewSection
          icon={<Tag className="w-5 h-5" />}
          title="Categories"
          onEdit={() => store.jumpToStep(3)}
        >
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Primary Category
            </p>
            <Badge variant="default">{categories.primaryCategoryId}</Badge>

            {categories.additionalCategoryIds &&
              categories.additionalCategoryIds.length > 0 && (
                <>
                  <p className="text-sm font-medium text-foreground mt-4">
                    Additional Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.additionalCategoryIds.map((catId) => (
                      <Badge key={catId} variant="secondary">
                        {catId}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
          </div>
        </ReviewSection>

        {/* Business Hours */}
        <ReviewSection
          icon={<Clock className="w-5 h-5" />}
          title="Business Hours"
          onEdit={() => store.jumpToStep(4)}
        >
          {businessHours.is24x7 ? (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-primary">Open 24/7</p>
            </div>
          ) : (
            <div className="space-y-2">
              {businessHours.hours?.map((hour) => (
                <div
                  key={hour.dayOfWeek}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-foreground w-24">
                    {DAYS_MAP[hour.dayOfWeek]}
                  </span>
                  {hour.isClosed ? (
                    <span className="text-muted-foreground">Closed</span>
                  ) : (
                    <span className="text-foreground">
                      {hour.openTime} - {hour.closeTime}
                      {hour.hasSplitShift &&
                        hour.splitCloseTime &&
                        hour.splitReopenTime && (
                          <span className="text-muted-foreground ml-2">
                            (Break: {hour.splitCloseTime} -{" "}
                            {hour.splitReopenTime})
                          </span>
                        )}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </ReviewSection>

        {/* Business Details */}
        <ReviewSection
          icon={<Star className="w-5 h-5" />}
          title="Business Details & Features"
          onEdit={() => store.jumpToStep(5)}
        >
          {businessDetails.priceRange && (
            <ReviewItem
              label="Price Range"
              value={businessDetails.priceRange}
            />
          )}

          <div className="space-y-2 mt-3">
            <p className="text-sm font-medium text-foreground">Features</p>
            <div className="flex flex-wrap gap-2">
              {businessDetails.acceptsBookings && (
                <Badge variant="outline">Bookings</Badge>
              )}
              {businessDetails.acceptsOrders && (
                <Badge variant="outline">Orders</Badge>
              )}
              {businessDetails.hasDelivery && (
                <Badge variant="outline">Delivery</Badge>
              )}
              {businessDetails.hasPickup && (
                <Badge variant="outline">Pickup</Badge>
              )}
              {businessDetails.hasDineIn && (
                <Badge variant="outline">Dine-In</Badge>
              )}
              {businessDetails.hasEmergencyService && (
                <Badge variant="outline">Emergency 24/7</Badge>
              )}
            </div>
          </div>

          {businessDetails.amenityIds &&
            businessDetails.amenityIds.length > 0 && (
              <div className="mt-3">
                <ReviewItem
                  label="Amenities"
                  value={`${businessDetails.amenityIds.length} selected`}
                />
              </div>
            )}
        </ReviewSection>

        {/* Documentation */}
        <ReviewSection
          icon={<FileText className="w-5 h-5" />}
          title="Documentation"
          onEdit={() => store.jumpToStep(6)}
        >
          {documentation.gstNumber && (
            <ReviewItem label="GST Number" value={documentation.gstNumber} />
          )}
          {documentation.panNumber && (
            <ReviewItem label="PAN Number" value={documentation.panNumber} />
          )}
          <ReviewItem
            label="Documents Uploaded"
            value={`${documentation.documents?.length || 0} files`}
          />
        </ReviewSection>

        {/* Photos */}
        <ReviewSection
          icon={<ImageIcon className="w-5 h-5" />}
          title="Photos & Media"
          onEdit={() => store.jumpToStep(7)}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.logoUrl && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Logo</p>
                <div className="aspect-square rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photos.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            {photos.coverImageUrl && (
              <div className="space-y-1 col-span-2">
                <p className="text-xs text-muted-foreground">Cover Image</p>
                <div className="aspect-video rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photos.coverImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          <ReviewItem
            label="Gallery Photos"
            value={`${photos.photoUrls?.length || 0} photos`}
          />
        </ReviewSection>

        {/* Terms & Conditions */}
        <div className="p-6 border rounded-lg bg-muted/30">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) =>
                setAgreedToTerms(checked as boolean)
              }
            />
            <div className="space-y-1">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the terms and conditions
              </Label>
              <p className="text-xs text-muted-foreground">
                By submitting this form, you agree to our{" "}
                <a
                  href="/terms"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => store.jumpToStep(7)}
            disabled={isSubmitting}
          >
            Back to Photos
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!agreedToTerms || isSubmitting}
            size="lg"
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </div>
    </StepWrapper>
  );
}

// Helper Components

interface ReviewSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}

function ReviewSection({ icon, title, children, onEdit }: ReviewSectionProps) {
  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface ReviewItemProps {
  label: string;
  value?: string | null;
}

function ReviewItem({ label, value }: ReviewItemProps) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-2">
      <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
