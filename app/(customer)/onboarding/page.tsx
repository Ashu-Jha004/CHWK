"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import { Loader2, MapPin } from "lucide-react"; // Recommended for professional iconography

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

  // 1. Sync Pincode to City/State (The "Magic" UX)
  useEffect(() => {
    // Inside your useEffect
    const fetchLocationData = async (pin: string) => {
      setIsFetchingPin(true);
      try {
        const res = await fetch(`/api/location/pincode/${pin}`);

        if (!res.ok) {
          // THIS WILL TELL US IF IT'S A 404, 500, OR 400
          const errorData = await res.json();
          console.error("API Error Response:", errorData);
          return;
        }

        const data = await res.json();
        setValue("city", data.city, { shouldValidate: true });
        setValue("state", data.state, { shouldValidate: true });
      } catch (err) {
        // THIS WILL TELL US IF IT'S A NETWORK/CORS ERROR
        console.error("Network or Parsing Error:", err);
      } finally {
        setIsFetchingPin(false);
      }
    };

    if (pincodeValue?.length === 6) {
      fetchLocationData(pincodeValue);
    }
  }, [pincodeValue, setValue]);

  // 2. Hydration Guard: Prevents UI flash from localStorage sync
  if (!isHydrated) return null;

  const handleNext = async () => {
    const fieldsByStep: (keyof OnboardingData)[][] = [
      ["firstName", "lastName", "username"],
      ["phone"],
      ["pincode", "city", "state"],
    ];

    const isStepValid = await trigger(fieldsByStep[step - 1]);

    if (isStepValid) {
      updateFormData(getValues());
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    updateFormData(getValues());
    setStep(step - 1);
  };

  const onSubmit = async (data: OnboardingData) => {
    const res = await completeOnboarding(data);
    if (res.success) {
      reset(); // Clear persistent store
      await user?.reload(); // Sync Clerk session
      router.push("/");
    } else {
      alert(res.error || "Something went wrong during submission");
    }
  };

  const handleAutoLocation = async () => {
    const coords = await detectLocation();
    if (coords) {
      // Mapping Zustand store keys to React Hook Form keys
      setValue("latitude", coords.lat);
      setValue("longitude", coords.lng);
    }
  };

  const progressWidth = `${(step / 3) * 100}%`;

  return (
    <div className="max-w-xl mx-auto p-8 border rounded-lg shadow-md bg-white mt-10">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Setup Profile</h1>
          <p className="text-sm font-medium text-gray-500">Step {step} of 3</p>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold border-b pb-2 text-gray-700">
              Personal Details
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                First Name
              </label>
              <input
                {...register("firstName")}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Last Name
              </label>
              <input
                {...register("lastName")}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Username
              </label>
              <input
                {...register("username")}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Contact */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold border-b pb-2 text-gray-700">
              Contact Information
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone Number (India)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  +91
                </span>
                <input
                  {...register("phone")}
                  placeholder="9876543210"
                  className="w-full border p-2 pl-12 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-semibold border-b pb-2 text-gray-700">
              Service Location
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Pincode
                </label>
                <div className="relative">
                  <input
                    {...register("pincode")}
                    maxLength={6}
                    placeholder="6-digit PIN"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {isFetchingPin && (
                    <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-blue-500" />
                  )}
                </div>
                {errors.pincode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.pincode.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  City
                </label>
                <input
                  {...register("city")}
                  readOnly={isFetchingPin}
                  className={`w-full border p-2 rounded ${
                    isFetchingPin ? "bg-gray-50 opacity-50" : ""
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  State
                </label>
                <input
                  {...register("state")}
                  readOnly={isFetchingPin}
                  className={`w-full border p-2 rounded ${
                    isFetchingPin ? "bg-gray-50 opacity-50" : ""
                  }`}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoLocation}
              className="w-full text-sm text-blue-600 font-medium py-3 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex justify-center items-center gap-2"
            >
              <MapPin className="h-4 w-4" /> Use Current Geolocation (Lat/Long)
            </button>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isFetchingPin}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold p-3 rounded-lg disabled:opacity-50 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Finalizing..." : "Complete Setup"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
