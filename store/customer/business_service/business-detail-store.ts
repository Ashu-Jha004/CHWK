// store/business-detail-store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import {
  TabId,
  GalleryFilter,
  MenuItemFilter,
  MenuItemSort,
  ReviewFilter,
  ReviewSort,
  GalleryState,
} from "@/types/customer/business/business-detail";

// ===========================
// Store State Interface
// ===========================
interface BusinessDetailState {
  // Tab Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Sidebar State (Desktop)
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Mobile Detection
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;

  // Gallery State
  galleryState: GalleryState;
  setGalleryOpen: (open: boolean) => void;
  setGalleryIndex: (index: number) => void;
  setGalleryFilter: (filter: GalleryFilter) => void;
  nextGalleryImage: () => void;
  prevGalleryImage: () => void;
  resetGallery: () => void;

  // Menu/Products Filter & Sort
  menuFilter: MenuItemFilter;
  menuSort: MenuItemSort;
  setMenuFilter: (filter: MenuItemFilter) => void;
  setMenuSort: (sort: MenuItemSort) => void;
  resetMenuFilters: () => void;

  // Services Filter & Sort
  serviceFilter: MenuItemFilter;
  serviceSort: MenuItemSort;
  setServiceFilter: (filter: MenuItemFilter) => void;
  setServiceSort: (sort: MenuItemSort) => void;
  resetServiceFilters: () => void;

  // Reviews Filter & Sort
  reviewFilter: ReviewFilter;
  reviewSort: ReviewSort;
  setReviewFilter: (filter: ReviewFilter) => void;
  setReviewSort: (sort: ReviewSort) => void;
  resetReviewFilters: () => void;

  // Search within page
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Scroll Position (for sticky header)
  scrollY: number;
  setScrollY: (y: number) => void;

  // Business Save State (Placeholder)
  isSaved: boolean;
  toggleSave: () => void;

  // Share Modal
  shareModalOpen: boolean;
  setShareModalOpen: (open: boolean) => void;

  // Report Modal (Placeholder)
  reportModalOpen: boolean;
  setReportModalOpen: (open: boolean) => void;

  // Complaint Modal
  complaintModalOpen: boolean;
  setComplaintModalOpen: (open: boolean) => void;

  // Global Reset
  resetAllFilters: () => void;
}

// ===========================
// Initial State Values
// ===========================
const initialGalleryState: GalleryState = {
  currentIndex: 0,
  isOpen: false,
  filter: "all",
};

// ===========================
// Zustand Store with Persistence
// ===========================
export const useBusinessDetailStore = create<BusinessDetailState>()(
  persist(
    (set, get) => ({
      // Initial Values
      activeTab: "overview",
      sidebarOpen: true,
      isMobile: false,
      galleryState: initialGalleryState,
      menuFilter: "all",
      menuSort: "default",
      serviceFilter: "all",
      serviceSort: "default",
      reviewFilter: "all",
      reviewSort: "recent",
      searchQuery: "",
      scrollY: 0,
      isSaved: false,
      shareModalOpen: false,
      reportModalOpen: false,
      complaintModalOpen: false,

      // Tab Navigation Actions
      setActiveTab: (tab) => {
        set({ activeTab: tab });
        // Auto-close sidebar on mobile when tab changes
        if (get().isMobile) {
          set({ sidebarOpen: false });
        }
      },

      // Sidebar Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Mobile Detection
      setIsMobile: (mobile) => {
        const currentState = get();
        // Only update if value actually changed to prevent infinite loops
        if (currentState.isMobile !== mobile) {
          set({ isMobile: mobile });
          // Auto-close sidebar on mobile
          if (mobile && currentState.sidebarOpen) {
            set({ sidebarOpen: false });
          }
        }
      },

      // Gallery Actions
      setGalleryOpen: (open) =>
        set((state) => ({
          galleryState: { ...state.galleryState, isOpen: open },
        })),

      setGalleryIndex: (index) =>
        set((state) => ({
          galleryState: { ...state.galleryState, currentIndex: index },
        })),

      setGalleryFilter: (filter) =>
        set((state) => ({
          galleryState: { ...state.galleryState, filter },
        })),

      nextGalleryImage: () =>
        set((state) => ({
          galleryState: {
            ...state.galleryState,
            currentIndex: state.galleryState.currentIndex + 1,
          },
        })),

      prevGalleryImage: () =>
        set((state) => ({
          galleryState: {
            ...state.galleryState,
            currentIndex: Math.max(0, state.galleryState.currentIndex - 1),
          },
        })),

      resetGallery: () => set({ galleryState: initialGalleryState }),

      // Menu Filter & Sort Actions
      setMenuFilter: (filter) => set({ menuFilter: filter }),
      setMenuSort: (sort) => set({ menuSort: sort }),
      resetMenuFilters: () => set({ menuFilter: "all", menuSort: "default" }),

      // Service Filter & Sort Actions
      setServiceFilter: (filter) => set({ serviceFilter: filter }),
      setServiceSort: (sort) => set({ serviceSort: sort }),
      resetServiceFilters: () => set({ serviceFilter: "all", serviceSort: "default" }),

      // Review Filter & Sort Actions
      setReviewFilter: (filter) => set({ reviewFilter: filter }),
      setReviewSort: (sort) => set({ reviewSort: sort }),
      resetReviewFilters: () => set({ reviewFilter: "all", reviewSort: "recent" }),

      // Search Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      clearSearch: () => set({ searchQuery: "" }),

      // Scroll Actions
      setScrollY: (y) => {
        const currentState = get();
        if (currentState.scrollY !== y) {
          set({ scrollY: y });
        }
      },

      // Save Actions (Placeholder)
      toggleSave: () => set((state) => ({ isSaved: !state.isSaved })),

      // Share Modal Actions
      setShareModalOpen: (open) => set({ shareModalOpen: open }),

      // Report Modal Actions
      setReportModalOpen: (open) => set({ reportModalOpen: open }),

      // Complaint Modal Actions
      setComplaintModalOpen: (open) => set({ complaintModalOpen: open }),

      // Global Reset
      resetAllFilters: () =>
        set({
          menuFilter: "all",
          menuSort: "default",
          serviceFilter: "all",
          serviceSort: "default",
          reviewFilter: "all",
          reviewSort: "recent",
          searchQuery: "",
        }),
    }),
    {
      name: "business-detail-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist certain values (not scroll position, modal states)
      partialize: (state) => ({
        activeTab: state.activeTab,
        sidebarOpen: state.sidebarOpen,
        isSaved: state.isSaved,
        menuFilter: state.menuFilter,
        menuSort: state.menuSort,
        serviceFilter: state.serviceFilter,
        serviceSort: state.serviceSort,
        reviewFilter: state.reviewFilter,
        reviewSort: state.reviewSort,
      }),
    }
  )
);

// ===========================
// Selector Hooks for Performance
// ===========================

// Tab selectors
export const useActiveTab = () => useBusinessDetailStore((state) => state.activeTab);
export const useSetActiveTab = () => useBusinessDetailStore((state) => state.setActiveTab);

// Sidebar selectors
export const useSidebarOpen = () => useBusinessDetailStore((state) => state.sidebarOpen);
export const useToggleSidebar = () => useBusinessDetailStore((state) => state.toggleSidebar);

// Mobile selectors
export const useIsMobile = () => useBusinessDetailStore((state) => state.isMobile);

// Gallery selectors
export const useGalleryState = () => useBusinessDetailStore((state) => state.galleryState);
export const useGalleryActions = () =>
  useBusinessDetailStore(
    useShallow((state) => ({
      setGalleryOpen: state.setGalleryOpen,
      setGalleryIndex: state.setGalleryIndex,
      setGalleryFilter: state.setGalleryFilter,
      nextGalleryImage: state.nextGalleryImage,
      prevGalleryImage: state.prevGalleryImage,
      resetGallery: state.resetGallery,
    }))
  );

// Menu selectors
export const useMenuFilters = () =>
  useBusinessDetailStore(
    useShallow((state) => ({
      filter: state.menuFilter,
      sort: state.menuSort,
    }))
  );

export const useMenuActions = () =>
  useBusinessDetailStore(
    useShallow((state) => ({
      setMenuFilter: state.setMenuFilter,
      setMenuSort: state.setMenuSort,
      resetMenuFilters: state.resetMenuFilters,
    }))
  );

// Service selectors
export const useServiceFilters = () =>
  useBusinessDetailStore(
    useShallow((state) => ({
      filter: state.serviceFilter,
      sort: state.serviceSort,
    }))
  );

export const useServiceActions = () =>
  useBusinessDetailStore(
    useShallow((state) => ({
      setServiceFilter: state.setServiceFilter,
      setServiceSort: state.setServiceSort,
      resetServiceFilters: state.resetServiceFilters,
    }))
  );

// Review selectors
export const useReviewFilters = () =>
  useBusinessDetailStore(
    useShallow((state) => ({
      filter: state.reviewFilter,
      sort: state.reviewSort,
    }))
  );

export const useReviewActions = () =>
  useBusinessDetailStore(
    useShallow((state) => ({
      setReviewFilter: state.setReviewFilter,
      setReviewSort: state.setReviewSort,
      resetReviewFilters: state.resetReviewFilters,
    }))
  );

// Search selectors
export const useSearchQuery = () => useBusinessDetailStore((state) => state.searchQuery);
export const useSearchActions = () =>
  useBusinessDetailStore(
    useShallow((state) => ({
      setSearchQuery: state.setSearchQuery,
      clearSearch: state.clearSearch,
    }))
  );

// Scroll selectors
export const useScrollY = () => useBusinessDetailStore((state) => state.scrollY);

// Save selectors
export const useIsSaved = () => useBusinessDetailStore((state) => state.isSaved);
export const useToggleSave = () => useBusinessDetailStore((state) => state.toggleSave);

// Modal selectors
export const useShareModal = () =>
  useBusinessDetailStore(
    useShallow((state) => ({
      isOpen: state.shareModalOpen,
      setOpen: state.setShareModalOpen,
    }))
  );

export const useReportModal = () =>
  useBusinessDetailStore(
    useShallow((state) => ({
      isOpen: state.reportModalOpen,
      setOpen: state.setReportModalOpen,
    }))
  );

export const useComplaintModal = () =>
  useBusinessDetailStore(
    useShallow((state) => ({
      isOpen: state.complaintModalOpen,
      setOpen: state.setComplaintModalOpen,
    }))
  );
