// components/business-onboarding/steps/step2-location.tsx
// Step 2: Location with auto-detection and reverse geocoding

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

  // Detect location on mount if not already detected
  useEffect(() => {
    if (!location.isLocationDetected) {
      handleDetectLocation();
    } else {
      setLocationStatus("success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle location detection
  const handleDetectLocation = useCallback(async () => {
    try {
      setLocationStatus("detecting");
      setLocationError("");

      console.log("[Location] 🎯 Detecting location...");

      // Get coordinates from browser
      const coords = await getCurrentLocation();

      console.log("[Location] ✅ Coordinates obtained:", coords);

      // Validate coordinates are within India
      if (!isWithinIndiaBounds(coords.latitude, coords.longitude)) {
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
    } catch (error) {
      console.error("[Location] ❌ Error:", error);

      const geoError = error as GeolocationError;
      const errorMessage =
        geoError.userMessage ||
        (error instanceof Error ? error.message : "Failed to detect location");

      setLocationError(errorMessage);
      setLocationStatus("error");
      setIsReverseGeocoding(false);

      setValue("isLocationDetected", false);
      setValue("locationError", errorMessage);
    }
  }, [setValue]);

  const onSubmit: SubmitHandler<LocationFormData> = async (data) => {
    try {
      console.log("[Step 2] Location data:", data);

      // Validate required fields
      if (!data.latitude || !data.longitude) {
        setLocationError(
          "Please detect your location or enter coordinates manually"
        );
        return;
      }

      // Save to store
      updateLocation(data);
      markStepComplete(2);

      // Move to next step
      nextStep();
    } catch (error) {
      console.error("[Step 2] Error:", error);
      setLocationError("Failed to save location. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <StepWrapper
        title="Business Location"
        description="Help customers find you easily with accurate location information"
        step={2}
      >
        {/* Location Detection */}
        <FormSection title="Detect Your Location">
          <div className="space-y-4">
            {/* Detection Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPinned className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Auto-detect location
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    We&apos;ll automatically fill in your address using your
                    current location
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleDetectLocation}
                disabled={locationStatus === "detecting" || isReverseGeocoding}
                variant="default"
                size="lg"
                className="w-full sm:w-auto flex-shrink-0"
              >
                {locationStatus === "detecting" || isReverseGeocoding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isReverseGeocoding ? "Getting address..." : "Detecting..."}
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 mr-2" />
                    Detect Location
                  </>
                )}
              </Button>
            </div>

            {/* Status Messages */}
            {locationStatus === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Location detected successfully! Please verify and update the
                  address details if needed.
                </AlertDescription>
              </Alert>
            )}

            {locationStatus === "error" && locationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}

            {/* Coordinates Display */}
            {watch("latitude") !== 0 && watch("longitude") !== 0 && (
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Coordinates:</span>
                  <code className="text-foreground font-mono text-xs bg-background px-2 py-1 rounded">
                    {formatCoordinates(watch("latitude"), watch("longitude"))}
                  </code>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        {/* Address Details */}
        <FormSection title="Address Details">
          <FormField
            label="Address Line 1"
            required
            error={errors.addressLine1?.message}
            hint="Building number, street name"
          >
            <Input
              {...register("addressLine1")}
              placeholder="e.g., 123, MG Road"
            />
          </FormField>

          <FormField
            label="Address Line 2"
            error={errors.addressLine2?.message}
            hint="Additional address details (optional)"
          >
            <Input
              {...register("addressLine2")}
              placeholder="e.g., Near City Mall"
            />
          </FormField>

          <FormGrid columns={2}>
            <FormField
              label="Landmark"
              error={errors.landmark?.message}
              hint="Nearby landmark for easy identification"
            >
              <Input
                {...register("landmark")}
                placeholder="e.g., Opposite Metro Station"
              />
            </FormField>

            <FormField
              label="Area/Locality"
              error={errors.area?.message}
              hint="Neighborhood or locality name"
            >
              <Input
                {...register("area")}
                placeholder="e.g., Connaught Place"
              />
            </FormField>
          </FormGrid>
        </FormSection>

        {/* City, State, PIN */}
        <FormSection title="City & State">
          <FormGrid columns={3}>
            <FormField label="City" required error={errors.city?.message}>
              <Input {...register("city")} placeholder="e.g., New Delhi" />
            </FormField>

            <FormField label="District" error={errors.district?.message}>
              <Input
                {...register("district")}
                placeholder="e.g., Central Delhi"
              />
            </FormField>

            <FormField label="State" required error={errors.state?.message}>
              <Input {...register("state")} placeholder="e.g., Delhi" />
            </FormField>
          </FormGrid>

          <FormField
            label="PIN Code"
            required
            error={errors.pincode?.message}
            hint="6-digit Indian postal code"
          >
            <Input
              {...register("pincode")}
              type="text"
              placeholder="110001"
              maxLength={6}
              className="max-w-xs"
            />
          </FormField>
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
