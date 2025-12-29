// stores/business-store.ts
import { create } from "zustand";
import { BusinessWithRelations } from "@/types/businessDashboard/dashboard-types";

interface BusinessState {
  // Current business data
  business: BusinessWithRelations | null;
  setBusiness: (business: BusinessWithRelations | null) => void;

  // Loading state
  isLoadingBusiness: boolean;
  setIsLoadingBusiness: (loading: boolean) => void;

  // Error state
  businessError: string | null;
  setBusinessError: (error: string | null) => void;

  // Update helpers
  updateBusinessField: <K extends keyof BusinessWithRelations>(
    field: K,
    value: BusinessWithRelations[K]
  ) => void;

  // Clear business data
  clearBusiness: () => void;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  // Current business
  business: null,
  setBusiness: (business) => set({ business }),

  // Loading
  isLoadingBusiness: false,
  setIsLoadingBusiness: (loading) => set({ isLoadingBusiness: loading }),

  // Error
  businessError: null,
  setBusinessError: (error) => set({ businessError: error }),

  // Update field
  updateBusinessField: (field, value) =>
    set((state) => {
      if (!state.business) return state;
      return {
        business: {
          ...state.business,
          [field]: value,
        },
      };
    }),

  // Clear
  clearBusiness: () =>
    set({
      business: null,
      businessError: null,
      isLoadingBusiness: false,
    }),
}));
