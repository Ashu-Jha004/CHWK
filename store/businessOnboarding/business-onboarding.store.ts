// lib/store/business-onboarding.store.ts
// Zustand store for business onboarding with localStorage persistence (Updated with Photos)

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  BusinessOnboardingState,
  BasicInfoData,
  LocationData,
  CategoryData,
  BusinessHoursData,
  BusinessDetailsData,
  DocumentationData,
  OptionalData,
  ONBOARDING_STEPS,
} from "@/types/businessOnboarding/business-onboarding.types";

// Photos data type
interface PhotosData {
  logoUrl: string;
  coverImageUrl?: string;
  photoUrls: string[];
}

// Define what data each step returns
type StepData =
  | Partial<BasicInfoData>
  | Partial<LocationData>
  | Partial<CategoryData>
  | Partial<BusinessHoursData>
  | Partial<BusinessDetailsData>
  | Partial<DocumentationData>
  | Partial<PhotosData>
  | Partial<OptionalData>
  | BusinessOnboardingState;

interface OnboardingActions {
  // Navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  jumpToStep: (step: number) => void;
  markStepComplete: (step: number) => void;

  // Data updates for each step
  updateBasicInfo: (data: Partial<BasicInfoData>) => void;
  updateLocation: (data: Partial<LocationData>) => void;
  updateCategories: (data: Partial<CategoryData>) => void;
  updateBusinessHours: (data: Partial<BusinessHoursData>) => void;
  updateBusinessDetails: (data: Partial<BusinessDetailsData>) => void;
  updateDocumentation: (data: Partial<DocumentationData>) => void;
  updatePhotos: (data: Partial<PhotosData>) => void;
  updateOptional: (data: Partial<OptionalData>) => void;

  // Submission
  setSubmitting: (isSubmitting: boolean) => void;
  setSubmitError: (error: string | undefined) => void;
  setComplete: (isComplete: boolean) => void;

  // Utility
  resetForm: () => void;
  canProceedToNextStep: () => boolean;
  getStepData: (step: number) => StepData;
}

// Extended state to include photos
interface ExtendedOnboardingState extends BusinessOnboardingState {
  photos: PhotosData;
}

type OnboardingStore = ExtendedOnboardingState & OnboardingActions;

const initialState: ExtendedOnboardingState = {
  currentStep: 1,
  completedSteps: [],
  basicInfo: {},
  location: {},
  categories: {},
  businessHours: {
    is24x7: false,
    hours: [],
  },
  businessDetails: {
    acceptsBookings: false,
    acceptsOrders: false,
    hasDelivery: false,
    hasPickup: false,
    hasDineIn: false,
    hasEmergencyService: false,
    amenityIds: [],
  },
  documentation: {
    documents: [],
  },
  photos: {
    logoUrl: "",
    coverImageUrl: undefined,
    photoUrls: [],
  },
  optional: {},
  isSubmitting: false,
  submitError: undefined,
  isComplete: false,
};

export const useBusinessOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ==================== NAVIGATION ====================

      setCurrentStep: (step: number) => {
        if (step < 1 || step > ONBOARDING_STEPS.length) {
          console.error(`[Onboarding Store] Invalid step: ${step}`);
          return;
        }

        set({ currentStep: step });

        // Debug log
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Onboarding] Moved to step ${step}: ${
              ONBOARDING_STEPS[step - 1].title
            }`
          );
        }
      },

      nextStep: () => {
        const { currentStep, completedSteps } = get();
        const nextStep = currentStep + 1;

        if (nextStep <= ONBOARDING_STEPS.length) {
          // Mark current step as completed
          if (!completedSteps.includes(currentStep)) {
            set({
              completedSteps: [...completedSteps, currentStep],
              currentStep: nextStep,
            });
          } else {
            set({ currentStep: nextStep });
          }

          // Scroll to top of page
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });

          // Scroll to top
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      },

      jumpToStep: (step: number) => {
        const { completedSteps } = get();

        // Can only jump to completed steps or next incomplete step
        const canJump = completedSteps.includes(step - 1) || step === 1;

        if (canJump && step >= 1 && step <= ONBOARDING_STEPS.length) {
          set({ currentStep: step });

          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        } else {
          console.warn(
            `[Onboarding] Cannot jump to step ${step}. Complete previous steps first.`
          );
        }
      },

      markStepComplete: (step: number) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(step)) {
          set({ completedSteps: [...completedSteps, step] });
        }
      },

      // ==================== DATA UPDATES ====================

      updateBasicInfo: (data: Partial<BasicInfoData>) => {
        set((state) => ({
          basicInfo: { ...state.basicInfo, ...data },
        }));

        if (process.env.NODE_ENV === "development") {
          console.log("[Onboarding] Basic info updated:", data);
        }
      },

      updateLocation: (data: Partial<LocationData>) => {
        set((state) => ({
          location: { ...state.location, ...data },
        }));

        if (process.env.NODE_ENV === "development") {
          console.log("[Onboarding] Location updated:", data);
        }
      },

      updateCategories: (data: Partial<CategoryData>) => {
        set((state) => ({
          categories: { ...state.categories, ...data },
        }));

        if (process.env.NODE_ENV === "development") {
          console.log("[Onboarding] Categories updated:", data);
        }
      },

      updateBusinessHours: (data: Partial<BusinessHoursData>) => {
        set((state) => ({
          businessHours: { ...state.businessHours, ...data },
        }));

        if (process.env.NODE_ENV === "development") {
          console.log("[Onboarding] Business hours updated:", data);
        }
      },

      updateBusinessDetails: (data: Partial<BusinessDetailsData>) => {
        set((state) => ({
          businessDetails: { ...state.businessDetails, ...data },
        }));

        if (process.env.NODE_ENV === "development") {
          console.log("[Onboarding] Business details updated:", data);
        }
      },

      updateDocumentation: (data: Partial<DocumentationData>) => {
        set((state) => ({
          documentation: { ...state.documentation, ...data },
        }));

        if (process.env.NODE_ENV === "development") {
          console.log("[Onboarding] Documentation updated");
        }
      },

      updatePhotos: (data: Partial<PhotosData>) => {
        set((state) => ({
          photos: { ...state.photos, ...data },
        }));

        if (process.env.NODE_ENV === "development") {
          console.log("[Onboarding] Photos updated:", data);
        }
      },

      updateOptional: (data: Partial<OptionalData>) => {
        set((state) => ({
          optional: { ...state.optional, ...data },
        }));

        if (process.env.NODE_ENV === "development") {
          console.log("[Onboarding] Optional data updated:", data);
        }
      },

      // ==================== SUBMISSION ====================

      setSubmitting: (isSubmitting: boolean) => {
        set({ isSubmitting });
      },

      setSubmitError: (error: string | undefined) => {
        set({ submitError: error });

        if (error && process.env.NODE_ENV === "development") {
          console.error("[Onboarding] Submit error:", error);
        }
      },

      setComplete: (isComplete: boolean) => {
        set({ isComplete });

        if (isComplete) {
          console.log("[Onboarding] ✅ Form submission complete!");
        }
      },

      // ==================== UTILITY ====================

      resetForm: () => {
        set(initialState);

        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("business-onboarding-storage");
        }

        console.log("[Onboarding] Form reset");
      },

      canProceedToNextStep: (): boolean => {
        const state = get();
        const { currentStep } = state;

        // Basic validation - check if required fields for current step are filled
        switch (currentStep) {
          case 1: // Basic Info
            return Boolean(
              state.basicInfo.name &&
                state.basicInfo.phone &&
                state.basicInfo.email
            );

          case 2: // Location
            return Boolean(
              state.location.latitude &&
                state.location.longitude &&
                state.location.addressLine1 &&
                state.location.city &&
                state.location.state &&
                state.location.pincode
            );

          case 3: // Categories
            return Boolean(state.categories.primaryCategoryId);

          case 4: // Business Hours
            return (
              state.businessHours.is24x7 === true ||
              Boolean(
                state.businessHours.hours &&
                  state.businessHours.hours.length > 0
              )
            );

          case 5: // Business Details
            return true; // All fields optional in this step

          case 6: // Documentation
            return Boolean(
              state.documentation.documents &&
                state.documentation.documents.length > 0
            );

          case 7: // Photos
            return Boolean(
              state.photos.logoUrl &&
                state.photos.photoUrls &&
                state.photos.photoUrls.length >= 3
            );

          case 8: // Optional
            return true; // Always can proceed (optional step)

          case 9: // Review
            return true;

          default:
            return false;
        }
      },

      getStepData: (step: number): StepData => {
        const state = get();

        switch (step) {
          case 1:
            return state.basicInfo;
          case 2:
            return state.location;
          case 3:
            return state.categories;
          case 4:
            return state.businessHours;
          case 5:
            return state.businessDetails;
          case 6:
            return state.documentation;
          case 7:
            return state.photos;
          case 8:
            return state.optional;
          case 9:
            return state; // Full state for review
          default:
            return {};
        }
      },
    }),
    {
      name: "business-onboarding-storage",
      storage: createJSONStorage(() => localStorage),

      // Only persist form data, not UI state
      partialize: (state) => ({
        basicInfo: state.basicInfo,
        location: state.location,
        categories: state.categories,
        businessHours: state.businessHours,
        businessDetails: state.businessDetails,
        documentation: state.documentation,
        photos: state.photos,
        optional: state.optional,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
      }),

      // Rehydration handler
      onRehydrateStorage: () => (state) => {
        if (state && process.env.NODE_ENV === "development") {
          console.log("[Onboarding] 📦 State rehydrated from localStorage");
          console.log("Current step:", state.currentStep);
          console.log("Completed steps:", state.completedSteps);
        }
      },
    }
  )
);

// ==================== SELECTORS (for optimized re-renders) ====================

export const useCurrentStep = () =>
  useBusinessOnboardingStore((state) => state.currentStep);

export const useCompletedSteps = () =>
  useBusinessOnboardingStore((state) => state.completedSteps);

export const useBasicInfo = () =>
  useBusinessOnboardingStore((state) => state.basicInfo);

export const useLocation = () =>
  useBusinessOnboardingStore((state) => state.location);

export const useCategories = () =>
  useBusinessOnboardingStore((state) => state.categories);

export const useBusinessHours = () =>
  useBusinessOnboardingStore((state) => state.businessHours);

export const useBusinessDetails = () =>
  useBusinessOnboardingStore((state) => state.businessDetails);

export const useDocumentation = () =>
  useBusinessOnboardingStore((state) => state.documentation);

export const usePhotos = () =>
  useBusinessOnboardingStore((state) => state.photos);

export const useOptionalData = () =>
  useBusinessOnboardingStore((state) => state.optional);

export const useIsSubmitting = () =>
  useBusinessOnboardingStore((state) => state.isSubmitting);

export const useSubmitError = () =>
  useBusinessOnboardingStore((state) => state.submitError);

export const useIsComplete = () =>
  useBusinessOnboardingStore((state) => state.isComplete);
