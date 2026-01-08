"use client";

import * as React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  onboardingSchema,
  OnboardingData,
} from "@/lib/onboarding/validations/onboarding";
import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";
import { completeOnboarding } from "./_actions";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const {
    step,
    setStep,
    formData,
    updateFormData,
    detectLocation,
    isHydrated,
    reset,
  } = useOnboardingStore();

  const { user } = useUser();
  const router = useRouter();
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: formData,
  });

  const pincodeValue = watch("pincode");

  // 1. Debounced Pincode Lookup for Better Performance
  useEffect(() => {
    const fetchLocationData = async (pin: string) => {
      setIsFetchingPin(true);
      setPincodeError(null);

      try {
        const res = await fetch(`/api/location/pincode/${pin}`);

        if (!res.ok) {
          const errorData = await res.json();
          const errorMessage = errorData.error === "Not found"
            ? "Invalid pincode. Please check and try again."
            : "Unable to fetch location. Please enter manually.";

          setPincodeError(errorMessage);
          toast.error(errorMessage);
          console.error("Pincode API Error:", errorData);
          return;
        }

        const data = await res.json();
        setValue("city", data.city, { shouldValidate: true });
        setValue("state", data.state, { shouldValidate: true });
        setPincodeError(null);
        toast.success("Location detected successfully!");
      } catch (err) {
        const errorMessage = "Network error. Please check your connection.";
        setPincodeError(errorMessage);
        toast.error(errorMessage);
        console.error("Network Error:", err);
      } finally {
        setIsFetchingPin(false);
      }
    };

    // Debounce the API call
    if (pincodeValue?.length === 6) {
      const timeoutId = setTimeout(() => {
        fetchLocationData(pincodeValue);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setPincodeError(null);
    }
  }, [pincodeValue, setValue]);

  // 2. Hydration Guard: Prevents UI flash from localStorage sync
  if (!isHydrated) return null;

  const handleNext = useCallback(async () => {
    const fieldsByStep: (keyof OnboardingData)[][] = [
      ["firstName", "lastName", "username"],
      ["phone"],
      ["pincode", "city", "state"],
    ];

    const isStepValid = await trigger(fieldsByStep[step - 1]);

    if (isStepValid) {
      updateFormData(getValues());
      setStep(step + 1);
      toast.success(`Step ${step} completed!`);
    } else {
      toast.error("Please fix the errors before continuing.");
    }
  }, [step, trigger, getValues, updateFormData, setStep]);

  const handleBack = useCallback(() => {
    updateFormData(getValues());
    setStep(step - 1);
  }, [getValues, updateFormData, setStep, step]);

  const onSubmit = useCallback(async (data: OnboardingData) => {
    try {
      toast.loading("Setting up your profile...");
      const res = await completeOnboarding(data);

      if (res.success) {
        toast.dismiss();
        toast.success("Welcome! Your profile is all set up!");
        reset(); // Clear persistent store
        await user?.reload(); // Sync Clerk session

        // Small delay for better UX
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else {
        toast.dismiss();
        toast.error(res.error || "Something went wrong. Please try again.");

        // Log details for debugging
        if (res.details) {
          console.error("Validation errors:", res.details);
        }
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Onboarding submission error:", error);
    }
  }, [reset, user, router]);

  const handleAutoLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    toast.loading("Detecting your location...");

    try {
      const coords = await detectLocation();

      if (coords) {
        setValue("latitude", coords.lat);
        setValue("longitude", coords.lng);
        toast.dismiss();
        toast.success("Location detected successfully!");
      } else {
        toast.dismiss();
        toast.error("Could not detect location. Please enable location access.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to detect location. Please try again.");
      console.error("Location detection error:", error);
    } finally {
      setIsDetectingLocation(false);
    }
  }, [detectLocation, setValue]);

  const progressWidth = useMemo(() => `${(step / 3) * 100}%`, [step]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white p-8 border border-border rounded-2xl shadow-xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              Setup Your Profile
            </h1>
            <p className="text-sm font-semibold text-muted-foreground">
              Step {step} of 3
            </p>
          </div>
          <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-amber-500 h-full transition-all duration-500 ease-out shadow-lg shadow-primary/20"
              style={{ width: progressWidth }}
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={3}
              aria-label={`Progress: Step ${step} of 3`}
            />
          </div>
        </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold border-b-2 border-primary/20 pb-3 text-foreground flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              Personal Details
            </h2>

            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-semibold text-foreground mb-1.5">
                First Name <span className="text-destructive">*</span>
              </label>
              <input
                id="firstName"
                {...register("firstName")}
                className={cn(
                  "w-full border-2 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background",
                  errors.firstName && "border-destructive focus:ring-destructive/20 focus:border-destructive"
                )}
                placeholder="Enter your first name"
                aria-invalid={errors.firstName ? "true" : "false"}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
              />
              {errors.firstName && (
                <p id="firstName-error" className="text-destructive text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-semibold text-foreground mb-1.5">
                Last Name <span className="text-destructive">*</span>
              </label>
              <input
                id="lastName"
                {...register("lastName")}
                className={cn(
                  "w-full border-2 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background",
                  errors.lastName && "border-destructive focus:ring-destructive/20 focus:border-destructive"
                )}
                placeholder="Enter your last name"
                aria-invalid={errors.lastName ? "true" : "false"}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
              />
              {errors.lastName && (
                <p id="lastName-error" className="text-destructive text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-foreground mb-1.5">
                Username <span className="text-destructive">*</span>
              </label>
              <input
                id="username"
                {...register("username")}
                className={cn(
                  "w-full border-2 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background",
                  errors.username && "border-destructive focus:ring-destructive/20 focus:border-destructive"
                )}
                placeholder="Choose a unique username"
                aria-invalid={errors.username ? "true" : "false"}
                aria-describedby={errors.username ? "username-error" : undefined}
              />
              {errors.username && (
                <p id="username-error" className="text-destructive text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.username.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white font-bold p-3.5 rounded-lg transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] mt-6"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Contact */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold border-b-2 border-primary/20 pb-3 text-foreground flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              Contact Information
            </h2>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-1.5">
                Phone Number (India) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-muted-foreground font-medium">
                  +91
                </span>
                <input
                  id="phone"
                  {...register("phone")}
                  placeholder="9876543210"
                  type="tel"
                  maxLength={10}
                  className={cn(
                    "w-full border-2 p-3 pl-14 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background",
                    errors.phone && "border-destructive focus:ring-destructive/20 focus:border-destructive"
                  )}
                  aria-invalid={errors.phone ? "true" : "false"}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
              </div>
              {errors.phone && (
                <p id="phone-error" className="text-destructive text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 border-2 border-border p-3 rounded-lg hover:bg-muted transition-all font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white font-bold p-3 rounded-lg transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold border-b-2 border-primary/20 pb-3 text-foreground flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              Service Location
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <label htmlFor="pincode" className="block text-sm font-semibold text-foreground mb-1.5">
                  Pincode <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="pincode"
                    {...register("pincode")}
                    maxLength={6}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    placeholder="Enter 6-digit PIN code"
                    className={cn(
                      "w-full border-2 p-3 pr-10 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background",
                      (errors.pincode || pincodeError) && "border-destructive focus:ring-destructive/20 focus:border-destructive",
                      isFetchingPin && "bg-muted/30"
                    )}
                    aria-invalid={errors.pincode || pincodeError ? "true" : "false"}
                    aria-describedby={errors.pincode || pincodeError ? "pincode-error" : undefined}
                  />
                  {isFetchingPin && (
                    <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-primary" />
                  )}
                  {!isFetchingPin && !errors.pincode && !pincodeError && pincodeValue?.length === 6 && (
                    <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-success" />
                  )}
                </div>
                {(errors.pincode || pincodeError) && (
                  <p id="pincode-error" className="text-destructive text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.pincode?.message || pincodeError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm font-semibold text-foreground mb-1.5">
                  City <span className="text-destructive">*</span>
                </label>
                <input
                  id="city"
                  {...register("city")}
                  readOnly={isFetchingPin}
                  className={cn(
                    "w-full border-2 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background",
                    isFetchingPin && "bg-muted/30 cursor-not-allowed",
                    errors.city && "border-destructive focus:ring-destructive/20 focus:border-destructive"
                  )}
                  placeholder="Auto-filled from pincode"
                  aria-invalid={errors.city ? "true" : "false"}
                  aria-describedby={errors.city ? "city-error" : undefined}
                />
                {errors.city && (
                  <p id="city-error" className="text-destructive text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm font-semibold text-foreground mb-1.5">
                  State <span className="text-destructive">*</span>
                </label>
                <input
                  id="state"
                  {...register("state")}
                  readOnly={isFetchingPin}
                  className={cn(
                    "w-full border-2 p-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background",
                    isFetchingPin && "bg-muted/30 cursor-not-allowed",
                    errors.state && "border-destructive focus:ring-destructive/20 focus:border-destructive"
                  )}
                  placeholder="Auto-filled from pincode"
                  aria-invalid={errors.state ? "true" : "false"}
                  aria-describedby={errors.state ? "state-error" : undefined}
                />
                {errors.state && (
                  <p id="state-error" className="text-destructive text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoLocation}
              disabled={isDetectingLocation}
              className="w-full text-sm text-primary font-semibold py-3.5 border-2 border-dashed border-primary/30 rounded-lg hover:bg-primary/5 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isDetectingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Detecting Location...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Use Current Geolocation (Optional)
                </>
              )}
            </button>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 border-2 border-border p-3 rounded-lg hover:bg-muted transition-all font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isFetchingPin}
                className="flex-1 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white font-bold p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </button>
            </div>
          </div>
        )}
      </form>
      </div>
    </div>
  );
}
