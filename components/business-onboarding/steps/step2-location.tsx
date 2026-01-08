// components/business-onboarding/steps/step2-location.tsx
// Step 2: Location with auto-detection and premium orange theme

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  Navigation,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPinned,
  Compass,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  locationSchema,
  type LocationFormData,
} from "@/lib/validations/business-onboarding.validation";
import {
  useLocation,
  useBusinessOnboardingStore,
} from "@/store/businessOnboarding/business-onboarding.store";
import {
  getCurrentLocation,
  reverseGeocode,
  formatCoordinates,
  isWithinIndiaBounds,
  type GeolocationError,
} from "@/lib/utils/geolocation.utils";
import { StepWrapper } from "../step-wrapper";
import { NavigationControls } from "../navigation-controls";
import { FormField, FormGrid, FormSection } from "../form-fields";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type LocationStatus = "idle" | "detecting" | "success" | "error";

export function Step2Location() {
  const location = useLocation();
  const updateLocation = useBusinessOnboardingStore(
    (state) => state.updateLocation
  );
  const nextStep = useBusinessOnboardingStore((state) => state.nextStep);
  const markStepComplete = useBusinessOnboardingStore(
    (state) => state.markStepComplete
  );

  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationError, setLocationError] = useState<string>("");
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    mode: "onChange",
    defaultValues: {
      latitude: location.latitude || 0,
      longitude: location.longitude || 0,
      addressLine1: location.addressLine1 || "",
      addressLine2: location.addressLine2 || "",
      landmark: location.landmark || "",
      area: location.area || "",
      city: location.city || "",
      district: location.district || "",
      state: location.state || "",
      pincode: location.pincode || "",
      isLocationDetected: location.isLocationDetected || false,
      locationError: location.locationError || "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = form;

  // Watch form changes and auto-save to store
  useEffect(() => {
    const subscription = watch((value) => {
      updateLocation(value as Partial<LocationFormData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateLocation]);

  // Handle location detection
  const handleDetectLocation = useCallback(async () => {
    try {
      setLocationStatus("detecting");
      setLocationError("");
      const toastId = toast.loading("Accessing GPS...");

      console.log("[Location] 🎯 Detecting location...");

      // Get coordinates from browser
      const coords = await getCurrentLocation();

      console.log("[Location] ✅ Coordinates obtained:", coords);

      // Validate coordinates are within India
      if (!isWithinIndiaBounds(coords.latitude, coords.longitude)) {
        toast.dismiss(toastId);
        throw new Error(
          "Location detected outside India. Please enter your address manually."
        );
      }

      // Set coordinates immediately
      setValue("latitude", coords.latitude);
      setValue("longitude", coords.longitude);
      setValue("isLocationDetected", true);

      // Start reverse geocoding
      setIsReverseGeocoding(true);
      toast.loading("Resolving address...", { id: toastId });
      console.log("[Location] 🔄 Reverse geocoding...");

      const address = await reverseGeocode(coords.latitude, coords.longitude);

      console.log("[Location] ✅ Address obtained:", address);

      // Populate form with address
      setValue("addressLine1", address.addressLine1);
      setValue("area", address.area || "");
      setValue("city", address.city);
      setValue("district", address.district || "");
      setValue("state", address.state);
      setValue("pincode", address.pincode);

      setLocationStatus("success");
      setIsReverseGeocoding(false);
      toast.success("Location pinpointed!", { id: toastId });
    } catch (error) {
      console.error("[Location] ❌ Error:", error);

      const geoError = error as GeolocationError;
      const errorMessage =
        geoError.userMessage ||
        (error instanceof Error ? error.message : "Failed to detect location");

      setLocationError(errorMessage);
      setLocationStatus("error");
      setIsReverseGeocoding(false);
      toast.error(errorMessage);

      setValue("isLocationDetected", false);
      setValue("locationError", errorMessage);
    }
  }, [setValue]);

  const onSubmit: SubmitHandler<LocationFormData> = async (data) => {
    try {
      // Validate required fields
      if (!data.latitude || !data.longitude) {
        toast.error("GPS coordinates missing. Please detect location.");
        return;
      }

      updateLocation(data);
      markStepComplete(2);

      toast.success("Location saved! Choose your business type.");
      nextStep();
    } catch (error) {
      console.error("[Step 2] Error:", error);
      toast.error("Failed to save location details.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Physical Location"
        description="Help customers find your doorstep with precision coordinates and address."
        step={2}
      >
        {/* Location Detection */}
        <FormSection title="Geographic Intelligence">
          <div className="space-y-6">
            {/* Detection Button Card */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-8 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-amber-500/5 border-2 border-primary/20 rounded-3xl shadow-xl shadow-primary/5 relative overflow-hidden group">
              {/* Decorative background icon */}
              <Compass className="absolute -right-8 -bottom-8 w-32 h-32 text-primary/5 group-hover:rotate-45 transition-transform duration-1000" />

              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                   <MapPinned className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-foreground tracking-tight">
                    Smart GPS Detection
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
                    Leverage your device's GPS to automatically pin your business on the map for maximum accuracy.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleDetectLocation}
                disabled={locationStatus === "detecting" || isReverseGeocoding}
                size="lg"
                className="w-full md:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-primary to-orange-600 font-bold shadow-xl hover:shadow-primary/30 active:scale-95 transition-all gap-3 shrink-0"
              >
                {locationStatus === "detecting" || isReverseGeocoding ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isReverseGeocoding ? "Resolving..." : "Locating..."}
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    Auto-detect Location
                  </>
                )}
              </Button>
            </div>

            {/* Status Feedback */}
            {locationStatus === "success" && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <p className="text-sm font-bold text-emerald-800">
                  Location verified! We've pre-filled the address details below.
                </p>
              </div>
            )}

            {locationStatus === "error" && locationError && (
              <Alert variant="destructive" className="rounded-2xl border-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-bold">{locationError}</AlertDescription>
              </Alert>
            )}

            {/* Coordinates Display */}
            {watch("latitude") !== 0 && watch("longitude") !== 0 && (
              <div className="flex items-center justify-center gap-4 py-3 px-6 bg-muted/30 rounded-full border-2 border-dashed border-border/50 max-w-fit mx-auto">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Coordinates Locked</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <code className="text-xs font-black text-primary tracking-tighter">
                  {formatCoordinates(watch("latitude"), watch("longitude"))}
                </code>
              </div>
            )}
          </div>
        </FormSection>

        {/* Address Details */}
        <FormSection title="Street Address">
          <FormField
            label="Address Line 1"
            required
            error={errors.addressLine1?.message}
            hint="Plot, Building, Floor and Street"
          >
            <Input
              {...register("addressLine1")}
              placeholder="e.g., Suite 204, Global Heights, MG Road"
              className="h-12 border-2 rounded-xl focus:border-primary focus:ring-primary/10 transition-all font-bold"
            />
          </FormField>

          <FormField
            label="Address Line 2 (Optional)"
            error={errors.addressLine2?.message}
            hint="Floor, Wing, or more details"
          >
            <Input
              {...register("addressLine2")}
              placeholder="e.g., Near City Center"
              className="h-12 border-2 rounded-xl focus:border-primary focus:ring-primary/10 transition-all font-medium"
            />
          </FormField>

          <FormGrid columns={2}>
            <FormField
              label="Landmark"
              error={errors.landmark?.message}
              hint="Prominent nearby place"
            >
              <Input
                {...register("landmark")}
                placeholder="e.g., Opposite Central Bank"
                className="h-12 border-2 rounded-xl focus:border-primary focus:ring-primary/10 transition-all font-medium"
              />
            </FormField>

            <FormField
              label="Area/Locality"
              error={errors.area?.message}
              hint="The general neighborhood name"
            >
              <Input
                {...register("area")}
                placeholder="e.g., Downtown Metro"
                className="h-12 border-2 rounded-xl focus:border-primary focus:ring-primary/10 transition-all font-medium"
              />
            </FormField>
          </FormGrid>
        </FormSection>

        {/* City, State, PIN */}
        <FormSection title="City & Region">
          <FormGrid columns={3}>
            <FormField label="City" required error={errors.city?.message}>
              <Input
                {...register("city")}
                placeholder="New Delhi"
                className="h-12 border-2 rounded-xl font-bold"
              />
            </FormField>

            <FormField label="District" error={errors.district?.message}>
              <Input
                {...register("district")}
                placeholder="Central Delhi"
                className="h-12 border-2 rounded-xl"
              />
            </FormField>

            <FormField label="State" required error={errors.state?.message}>
              <Input
                {...register("state")}
                placeholder="Delhi"
                className="h-12 border-2 rounded-xl font-bold"
              />
            </FormField>
          </FormGrid>

          <div className="max-w-xs pt-4">
            <FormField
              label="PIN Code"
              required
              error={errors.pincode?.message}
              hint="6-digit postal code"
            >
              <Input
                {...register("pincode")}
                type="text"
                placeholder="110001"
                maxLength={6}
                className="h-14 border-2 rounded-xl text-xl font-black tracking-widest text-primary focus:bg-primary/5 transition-all text-center"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Hidden Fields */}
        <input
          type="hidden"
          {...register("latitude", { valueAsNumber: true })}
        />
        <input
          type="hidden"
          {...register("longitude", { valueAsNumber: true })}
        />
        <input type="hidden" {...register("isLocationDetected")} />
      </StepWrapper>

      {/* Navigation */}
      <NavigationControls
        onNext={handleSubmit(onSubmit)}
        isNextDisabled={!isValid}
      />
    </form>
  );
}
