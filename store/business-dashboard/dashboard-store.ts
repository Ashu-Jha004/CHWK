// stores/dashboard-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type DashboardTab =
  | "overview"
  | "profile"
  | "reviews"
  | "staff"
  | "complaints";

export type ProfileTab =
  | "basic-info"
  | "hours"
  | "photos"
  | "categories"
  | "service-settings"
  | "legal";

interface DashboardState {
  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Active tabs
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;

  // Profile sub-tabs
  activeProfileTab: ProfileTab;
  setActiveProfileTab: (tab: ProfileTab) => void;

  // Refresh states (for manual refetch)
  refreshTrigger: number;
  triggerRefresh: () => void;

  // Mobile detection
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Selected items (for bulk actions)
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  toggleSelectedItem: (id: string) => void;
  clearSelection: () => void;

  // Reset all state
  resetDashboard: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Sidebar state
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Active tabs
      activeTab: "overview",
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Profile sub-tabs
      activeProfileTab: "basic-info",
      setActiveProfileTab: (tab) => set({ activeProfileTab: tab }),

      // Refresh trigger
      refreshTrigger: 0,
      triggerRefresh: () =>
        set((state) => ({
          refreshTrigger: state.refreshTrigger + 1,
        })),

      // Mobile detection
      isMobile: false,
      setIsMobile: (mobile) => set({ isMobile: mobile }),

      // Loading states
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Selected items
      selectedItems: [],
      setSelectedItems: (items) => set({ selectedItems: items }),
      toggleSelectedItem: (id) =>
        set((state) => {
          const isSelected = state.selectedItems.includes(id);
          return {
            selectedItems: isSelected
              ? state.selectedItems.filter((itemId) => itemId !== id)
              : [...state.selectedItems, id],
          };
        }),
      clearSelection: () => set({ selectedItems: [] }),

      // Reset
      resetDashboard: () =>
        set({
          sidebarOpen: true,
          activeTab: "overview",
          activeProfileTab: "basic-info",
          selectedItems: [],
          isLoading: false,
        }),
    }),
    {
      name: "dashboard-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist certain keys
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        activeTab: state.activeTab,
        activeProfileTab: state.activeProfileTab,
      }),
    }
  )
);
