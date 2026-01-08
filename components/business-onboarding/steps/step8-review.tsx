// components/business-onboarding/steps/step8-review.tsx
// Step 8: Final Review & Submission with premium orange theme

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
  ShieldCheck,
  Zap,
  ChevronRight,
} from "lucide-react";
import { DayOfWeek } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useBusinessOnboardingStore } from "@/store/businessOnboarding/business-onboarding.store";
import { StepWrapper } from "../step-wrapper";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
      toast.error("Please accept the Terms & Conditions to proceed.");
      return;
    }

    const submissionToast = toast.loading("Synthesizing your business profile...");

    try {
      store.setSubmitting(true);
      store.setSubmitError(undefined);

      const freshState = useBusinessOnboardingStore.getState();

      const submissionData = {
        basicInfo: freshState.basicInfo,
        location: freshState.location,
        categories: freshState.categories,
        businessHours: freshState.businessHours,
        businessDetails: freshState.businessDetails,
        documentation: freshState.documentation,
        photos: freshState.photos,
        optional: freshState.optional,
      };

      const response = await fetch("/api/business/onboarding-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (process.env.NODE_ENV === "development") {
          console.error("[Onboarding] Submission failed details:", errorData);
        }
        throw new Error(errorData.message || "Onboarding failed");
      }

      toast.success("Welcome aboard! Your business is now live.", { id: submissionToast });
      store.setComplete(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Submission failed";
      toast.error(msg, { id: submissionToast });
      store.setSubmitError(msg);
    } finally {
      store.setSubmitting(false);
    }
  };

  return (
    <StepWrapper
      title="Final Proclamation"
      description="Behold your enterprise's digital manifest. One final glance before we launch into the ecosystem."
      step={8}
    >
      <div className="space-y-8">
        {/* Welcome Summary Card */}
        <div className="p-8 bg-gradient-to-br from-primary to-orange-700 rounded-[2.5rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
           <Zap className="absolute -right-4 -top-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
           <div className="relative z-10">
              <h3 className="text-3xl font-black tracking-tight mb-2">Ready for Liftoff?</h3>
              <p className="text-orange-100 font-medium max-w-md">
                You've successfully documented <strong>{basicInfo.name}</strong>.
                Complete this submission to begin receiving local customer traffic.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Identity Section */}
          <ReviewSection
            icon={<Building2 className="w-5 h-5" />}
            title="Identity"
            onEdit={() => store.jumpToStep(1)}
          >
            <ReviewItem label="Brand Name" value={basicInfo.name} />
            <ReviewItem label="Direct Email" value={basicInfo.email} />
            <ReviewItem label="Primary Hotline" value={basicInfo.phone} />
            {basicInfo.website && <ReviewItem label="Digital Portal" value={basicInfo.website} />}
            {basicInfo.isPartOfChain && (
              <div className="mt-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Chain Affiliation</p>
                 <p className="text-xs font-bold">{basicInfo.chainName} ({basicInfo.branchName || 'Headquarters'})</p>
              </div>
            )}
          </ReviewSection>

          {/* Logistics Section */}
          <ReviewSection
            icon={<MapPin className="w-5 h-5" />}
            title="Logistics"
            onEdit={() => store.jumpToStep(2)}
          >
            <ReviewItem
              label="Street Address"
              value={`${location.addressLine1}${location.addressLine2 ? ", " + location.addressLine2 : ""}`}
            />
            <ReviewItem
              label="Region"
              value={`${location.city}, ${location.state} ${location.pincode}`}
            />
            <div className="flex items-center gap-2 mt-3">
               <Badge variant="outline" className="font-mono text-[9px] border-primary/20 text-primary">GPS {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}</Badge>
            </div>
          </ReviewSection>

          {/* Classification Section */}
          <ReviewSection
            icon={<Tag className="w-5 h-5" />}
            title="Classification"
            onEdit={() => store.jumpToStep(3)}
          >
            <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Primary Industry</p>
                  <Badge className="bg-primary hover:bg-primary shadow-lg shadow-primary/10 px-4 py-1.5 rounded-xl text-xs font-black">
                    {categories.primaryCategoryId}
                  </Badge>
               </div>
               {categories.additionalCategoryIds && categories.additionalCategoryIds.length > 0 && (
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Secondary Sectors</p>
                    <div className="flex flex-wrap gap-2">
                       {categories.additionalCategoryIds.map(id => (
                         <Badge key={id} variant="secondary" className="px-3 py-1 rounded-lg font-bold">
                           {id}
                         </Badge>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          </ReviewSection>

          {/* Chronology Section */}
          <ReviewSection
            icon={<Clock className="w-5 h-5" />}
            title="Availability"
            onEdit={() => store.jumpToStep(4)}
          >
            {businessHours.is24x7 ? (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-black text-emerald-900 uppercase tracking-widest">Always Open (24/7)</span>
              </div>
            ) : (
              <div className="space-y-2 p-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                {businessHours.hours?.map((hour) => (
                  <div key={hour.dayOfWeek} className="flex items-center justify-between py-1 border-b border-border/50 last:border-none">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground w-20">
                      {DAYS_MAP[hour.dayOfWeek]}
                    </span>
                    {hour.isClosed ? (
                      <Badge variant="outline" className="text-[8px] bg-red-50 text-red-600 border-red-100 uppercase font-black">Closed</Badge>
                    ) : (
                      <span className="text-xs font-black text-foreground">
                        {hour.openTime} – {hour.closeTime}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ReviewSection>

          {/* Offerings Section */}
          <ReviewSection
            icon={<Star className="w-5 h-5" />}
            title="Offerings"
            onEdit={() => store.jumpToStep(5)}
          >
            <div className="space-y-4">
               {businessDetails.priceRange && (
                 <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price Index:</p>
                    <span className="text-lg font-black text-primary tracking-widest">{businessDetails.priceRange}</span>
                 </div>
               )}
               <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'acceptsBookings', label: 'Bookings' },
                    { key: 'acceptsOrders', label: 'Orders' },
                    { key: 'hasDelivery', label: 'Delivery' },
                    { key: 'hasPickup', label: 'Pickup' },
                    { key: 'hasDineIn', label: 'Dine-In' },
                    { key: 'hasEmergencyService', label: 'Emergency' }
                  ].map(feature => (
                    businessDetails[feature.key as keyof typeof businessDetails] && (
                      <Badge key={feature.key} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 font-bold px-3 py-1">
                        {feature.label}
                      </Badge>
                    )
                  ))}
               </div>
               {businessDetails.amenityIds && businessDetails.amenityIds.length > 0 && (
                  <div className="p-3 bg-muted/30 rounded-xl border-border border-2 border-dashed">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{businessDetails.amenityIds.length} Amenities Provisioned</p>
                  </div>
               )}
            </div>
          </ReviewSection>

          {/* Authentication Section */}
          <ReviewSection
            icon={<FileText className="w-5 h-5" />}
            title="Authentication"
            onEdit={() => store.jumpToStep(6)}
          >
            <div className="space-y-3">
               {documentation.gstNumber && <ReviewItem label="GST Identity" value={documentation.gstNumber} />}
               {documentation.panNumber && <ReviewItem label="Tax Identity" value={documentation.panNumber} />}
               <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-100 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-widest">
                    {documentation.documents?.length || 0} Assets Uploaded
                  </span>
               </div>
            </div>
          </ReviewSection>
        </div>

        {/* Media Highlights */}
        <ReviewSection
          icon={<ImageIcon className="w-5 h-5" />}
          title="Media Portfolio"
          onEdit={() => store.jumpToStep(7)}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {photos.logoUrl && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Digital Logo</p>
                <div className="aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                  <img src={photos.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            {photos.coverImageUrl && (
              <div className="space-y-2 md:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Banner</p>
                <div className="aspect-[21/9] rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                  <img src={photos.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex items-center gap-3 p-4 bg-muted/20 border-2 border-dashed border-border rounded-2xl overflow-x-auto custom-scrollbar">
             {photos.photoUrls?.slice(0, 5).map((url, i) => (
                <div key={i} className="w-12 h-12 rounded-lg border-2 border-white shadow-sm overflow-hidden shrink-0">
                   <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                </div>
             ))}
             {photos.photoUrls && photos.photoUrls.length > 5 && (
               <Badge variant="secondary" className="h-10 px-3 rounded-xl font-black">+{photos.photoUrls.length - 5} More</Badge>
             )}
          </div>
        </ReviewSection>

        {/* Final Consent */}
        <div className={cn(
           "p-8 rounded-[2.5rem] border-2 transition-all duration-500",
           agreedToTerms ? "bg-emerald-50 border-emerald-200 shadow-xl shadow-emerald-500/5" : "bg-muted/30 border-border"
        )}>
          <div className="flex items-start gap-4">
             <div className="pt-1">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => {
                    setAgreedToTerms(checked as boolean);
                    if (checked) toast.success("Commitment recorded!");
                  }}
                  className="w-6 h-6 rounded-lg data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
             </div>
            <div className="space-y-2">
              <Label
                htmlFor="terms"
                className="text-lg font-black text-foreground tracking-tight cursor-pointer"
              >
                Honorary Agreement
              </Label>
              <p className="text-sm text-foreground/70 font-medium leading-relaxed max-w-2xl">
                By ticking this box, I solemnly swear that the information provided is accurate and I am authorized to register this establishment.
                I agree to the <a href="/terms" className="text-primary font-black hover:underline" target="_blank">Terms of Service</a> & <a href="/privacy" className="text-primary font-black hover:underline" target="_blank">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pt-10 border-t-2 border-dashed">
          <Button
            type="button"
            variant="outline"
            onClick={() => store.jumpToStep(7)}
            disabled={isSubmitting}
            className="w-full sm:w-auto h-14 px-10 rounded-2xl font-black uppercase tracking-widest border-2 hover:bg-muted/50 transition-all"
          >
            Review Graphics
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!agreedToTerms || isSubmitting}
            className={cn(
              "w-full sm:ml-auto h-14 px-12 rounded-2xl font-black uppercase tracking-widest text-white shadow-2xl transition-all active:scale-95 flex gap-3",
              agreedToTerms
                ? "bg-gradient-to-r from-primary via-orange-600 to-amber-600 hover:shadow-primary/30"
                : "bg-muted text-muted-foreground grayscale cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm & Launch
                <ChevronRight className="w-5 h-5" />
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
    <div className="p-8 rounded-[2rem] bg-background border-2 border-border shadow-xl shadow-muted/50 hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 relative group overflow-hidden">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary shadow-inner">
            {icon}
          </div>
          <h3 className="text-xl font-black text-foreground tracking-tight">{title}</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="rounded-xl h-10 px-4 font-black uppercase tracking-tighter text-[10px] hover:bg-primary/10 hover:text-primary transition-all flex gap-1.5"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit
        </Button>
      </div>
      <div className="space-y-4 relative z-10">{children}</div>
      {/* Decorative background element */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
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
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground leading-relaxed">{value}</p>
    </div>
  );
}
