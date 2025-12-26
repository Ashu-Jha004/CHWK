import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * UI State Interface
 * Manages global UI state across the application
 */
interface UIState {
  // Mobile navigation
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
  toggleMobileMenu: () => void;

  // Search functionality
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  searchLocation: string;
  setSearchLocation: (location: string) => void;

  // Active category filter
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;

  // Modal/Dialog states
  isAuthModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  authModalType: "signin" | "signup" | "business";
  setAuthModalType: (type: "signin" | "signup" | "business") => void;

  // User preferences (persisted)
  preferredCity: string;
  setPreferredCity: (city: string) => void;

  // Loading states
  isPageLoading: boolean;
  setPageLoading: (isLoading: boolean) => void;

  // Error handling
  globalError: string | null;
  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;

  // Reset all state
  resetUIState: () => void;
}

/**
 * Initial state values
 */
const initialState = {
  isMobileMenuOpen: false,
  searchQuery: "",
  searchLocation: "",
  activeCategory: null,
  isAuthModalOpen: false,
  authModalType: "signin" as const,
  preferredCity: "Mumbai",
  isPageLoading: false,
  globalError: null,
};

/**
 * UI Store with Zustand
 * Handles all global UI state with persistence and devtools
 */
export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,

        // Mobile menu actions
        setMobileMenuOpen: (isOpen: boolean) => {
          try {
            set({ isMobileMenuOpen: isOpen }, false, "setMobileMenuOpen");
            // Prevent body scroll when menu is open
            if (typeof document !== "undefined") {
              document.body.style.overflow = isOpen ? "hidden" : "unset";
            }
          } catch (error) {
            console.error("Error setting mobile menu state:", error);
          }
        },

        toggleMobileMenu: () => {
          try {
            const currentState = get().isMobileMenuOpen;
            set({ isMobileMenuOpen: !currentState }, false, "toggleMobileMenu");
            if (typeof document !== "undefined") {
              document.body.style.overflow = !currentState ? "hidden" : "unset";
            }
          } catch (error) {
            console.error("Error toggling mobile menu:", error);
          }
        },

        // Search actions
        setSearchQuery: (query: string) => {
          try {
            set({ searchQuery: query }, false, "setSearchQuery");
          } catch (error) {
            console.error("Error setting search query:", error);
          }
        },

        clearSearch: () => {
          try {
            set(
              { searchQuery: "", activeCategory: null },
              false,
              "clearSearch"
            );
          } catch (error) {
            console.error("Error clearing search:", error);
          }
        },

        setSearchLocation: (location: string) => {
          try {
            set({ searchLocation: location }, false, "setSearchLocation");
          } catch (error) {
            console.error("Error setting search location:", error);
          }
        },

        // Category actions
        setActiveCategory: (category: string | null) => {
          try {
            set({ activeCategory: category }, false, "setActiveCategory");
          } catch (error) {
            console.error("Error setting active category:", error);
          }
        },

        // Auth modal actions
        setAuthModalOpen: (isOpen: boolean) => {
          try {
            set({ isAuthModalOpen: isOpen }, false, "setAuthModalOpen");
            // Prevent body scroll when modal is open
            if (typeof document !== "undefined") {
              document.body.style.overflow = isOpen ? "hidden" : "unset";
            }
          } catch (error) {
            console.error("Error setting auth modal state:", error);
          }
        },

        setAuthModalType: (type: "signin" | "signup" | "business") => {
          try {
            set({ authModalType: type }, false, "setAuthModalType");
          } catch (error) {
            console.error("Error setting auth modal type:", error);
          }
        },

        // User preferences
        setPreferredCity: (city: string) => {
          try {
            set({ preferredCity: city }, false, "setPreferredCity");
          } catch (error) {
            console.error("Error setting preferred city:", error);
          }
        },

        // Loading state
        setPageLoading: (isLoading: boolean) => {
          try {
            set({ isPageLoading: isLoading }, false, "setPageLoading");
          } catch (error) {
            console.error("Error setting page loading state:", error);
          }
        },

        // Error handling
        setGlobalError: (error: string | null) => {
          try {
            set({ globalError: error }, false, "setGlobalError");
          } catch (err) {
            console.error("Error setting global error:", err);
          }
        },

        clearGlobalError: () => {
          try {
            set({ globalError: null }, false, "clearGlobalError");
          } catch (error) {
            console.error("Error clearing global error:", error);
          }
        },

        // Reset state
        resetUIState: () => {
          try {
            set(initialState, false, "resetUIState");
            if (typeof document !== "undefined") {
              document.body.style.overflow = "unset";
            }
          } catch (error) {
            console.error("Error resetting UI state:", error);
          }
        },
      }),
      {
        name: "chwk-ui-storage",
        // Only persist specific values
        partialize: (state) => ({
          preferredCity: state.preferredCity,
          searchLocation: state.searchLocation,
        }),
        // Storage configuration with error handling
        storage: {
          getItem: (name) => {
            try {
              const str = localStorage.getItem(name);
              return str ? JSON.parse(str) : null;
            } catch (error) {
              console.error("Error reading from localStorage:", error);
              return null;
            }
          },
          setItem: (name, value) => {
            try {
              localStorage.setItem(name, JSON.stringify(value));
            } catch (error) {
              console.error("Error writing to localStorage:", error);
            }
          },
          removeItem: (name) => {
            try {
              localStorage.removeItem(name);
            } catch (error) {
              console.error("Error removing from localStorage:", error);
            }
          },
        },
      }
    ),
    {
      name: "CHWK UI Store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

/**
 * Selectors for optimized component renders
 * Use these in components for better performance
 */
export const uiSelectors = {
  // Mobile menu
  useMobileMenu: () => {
    const isOpen = useUIStore((state) => state.isMobileMenuOpen);
    const setOpen = useUIStore((state) => state.setMobileMenuOpen);
    const toggle = useUIStore((state) => state.toggleMobileMenu);
    return { isOpen, setOpen, toggle };
  },

  // Search
  useSearch: () => {
    const query = useUIStore((state) => state.searchQuery);
    const location = useUIStore((state) => state.searchLocation);
    const setQuery = useUIStore((state) => state.setSearchQuery);
    const setLocation = useUIStore((state) => state.setSearchLocation);
    const clear = useUIStore((state) => state.clearSearch);
    return { query, location, setQuery, setLocation, clear };
  },

  // Category
  useCategory: () => {
    const active = useUIStore((state) => state.activeCategory);
    const setActive = useUIStore((state) => state.setActiveCategory);
    return { active, setActive };
  },

  // Auth modal
  useAuthModal: () => {
    const isOpen = useUIStore((state) => state.isAuthModalOpen);
    const type = useUIStore((state) => state.authModalType);
    const setOpen = useUIStore((state) => state.setAuthModalOpen);
    const setType = useUIStore((state) => state.setAuthModalType);
    return { isOpen, type, setOpen, setType };
  },

  // City preference
  usePreferredCity: () => {
    const city = useUIStore((state) => state.preferredCity);
    const setCity = useUIStore((state) => state.setPreferredCity);
    return { city, setCity };
  },

  // Loading
  usePageLoading: () => {
    const isLoading = useUIStore((state) => state.isPageLoading);
    const setLoading = useUIStore((state) => state.setPageLoading);
    return { isLoading, setLoading };
  },

  // Error
  useGlobalError: () => {
    const error = useUIStore((state) => state.globalError);
    const setError = useUIStore((state) => state.setGlobalError);
    const clear = useUIStore((state) => state.clearGlobalError);
    return { error, setError, clear };
  },
};

/**
 * Hook for debugging - logs state changes
 * Only active in development
 */
export const useUIStoreDebug = () => {
  if (process.env.NODE_ENV === "development") {
    useUIStore.subscribe((state, prevState) => {
      console.log("UI Store Updated:", {
        previous: prevState,
        current: state,
      });
    });
  }
};
