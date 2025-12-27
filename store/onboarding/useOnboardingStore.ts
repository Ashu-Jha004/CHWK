/* eslint-disable @typescript-eslint/no-explicit-any */
// store/useOnboardingStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { OnboardingData } from "@/lib/onboarding/validations/onboarding";

interface OnboardingStore {
  step: number;
  formData: Partial<OnboardingData>;
  isHydrated: boolean; // Production safety for Next.js
  setStep: (step: number) => void;
  updateFormData: (data: Partial<OnboardingData>) => void;
  detectLocation: () => Promise<{ lat: number; lng: number } | null>;
  reset: () => void;
  setHydrated: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      step: 1,
      formData: {},
      isHydrated: false,

      setStep: (step) => set({ step }),

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      /**
       * Senior Engineering Note: Centralizing Geolocation here allows us to
       * update the store immediately and return the values for the UI.
       */
      detectLocation: async () => {
        return new Promise((resolve) => {
          if (typeof window === "undefined" || !navigator.geolocation) {
            console.warn("Geolocation is not supported by this browser.");
            return resolve(null);
          }

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              };
              set((state) => ({
                formData: { ...state.formData, ...coords },
              }));
              resolve({ lat: coords.latitude, lng: coords.longitude });
            },
            (error) => {
              // Senior Tip: Map the error code to a human-readable message
              const errorMessages: any = {
                [error.PERMISSION_DENIED]:
                  "User denied the request for Geolocation.",
                [error.POSITION_UNAVAILABLE]:
                  "Location information is unavailable.",
                [error.TIMEOUT]: "The request to get user location timed out.",
              };

              console.error(
                "Location detection failed:",
                errorMessages[error.code] || "An unknown error occurred."
              );
              resolve(null);
            },
            {
              enableHighAccuracy: false, // Set to false first for faster response on slow networks
              timeout: 10000, // Increased to 10s for better reliability in India/mobile
              maximumAge: 60000, // Accept a cached location up to 1 minute old
            }
          );
        });
      },

      reset: () => {
        set({ step: 1, formData: {} });
        if (typeof window !== "undefined") {
          localStorage.removeItem("onboarding-storage");
        }
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => localStorage),
      // Ensure hydration is handled correctly in Next.js
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
