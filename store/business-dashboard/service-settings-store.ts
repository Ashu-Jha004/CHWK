// stores/service-settings-store.ts

import { create } from "zustand";

// ==================== TYPES ====================

export type ServiceSettingsSection =
  | "service-types" // What you offer
  | "service-areas" // Radius + pincodes
  | "payment-methods" // Payment options
  | "catalog" // Items/Services list
  | "add-edit-item"; // Add/Edit form

export interface ServiceSettingsDraft {
  isDirty: boolean;
  hasUnsavedChanges: boolean;
  lastSaved?: Date;
}

export interface SelectedItems {
  itemIds: string[];
  selectAll: boolean;
}

// ==================== STORE INTERFACE ====================

interface ServiceSettingsStore {
  // Active section within service settings tab
  activeSection: ServiceSettingsSection;
  setActiveSection: (section: ServiceSettingsSection) => void;

  // Draft state for unsaved changes
  draft: ServiceSettingsDraft;
  setDraft: (draft: Partial<ServiceSettingsDraft>) => void;
  resetDraft: () => void;

  // Item selection for bulk operations
  selectedItems: SelectedItems;
  setSelectedItems: (items: Partial<SelectedItems>) => void;
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: (itemIds: string[]) => void;
  clearSelectedItems: () => void;

  // Currently editing item ID (for modal/form)
  editingItemId: string | null;
  setEditingItemId: (id: string | null) => void;

  // Service area being edited
  editingAreaId: string | null;
  setEditingAreaId: (id: string | null) => void;

  // Reset everything
  resetStore: () => void;
}

// ==================== INITIAL STATE ====================

const initialState = {
  activeSection: "service-types" as ServiceSettingsSection,
  draft: {
    isDirty: false,
    hasUnsavedChanges: false,
  },
  selectedItems: {
    itemIds: [],
    selectAll: false,
  },
  editingItemId: null,
  editingAreaId: null,
};

// ==================== STORE IMPLEMENTATION ====================

export const useServiceSettingsStore = create<ServiceSettingsStore>((set) => ({
  ...initialState,

  // Section navigation
  setActiveSection: (section) => set({ activeSection: section }),

  // Draft state management
  setDraft: (draft) =>
    set((state) => ({
      draft: { ...state.draft, ...draft },
    })),

  resetDraft: () =>
    set({
      draft: {
        isDirty: false,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
      },
    }),

  // Item selection (bulk operations)
  setSelectedItems: (items) =>
    set((state) => ({
      selectedItems: { ...state.selectedItems, ...items },
    })),

  toggleItemSelection: (itemId) =>
    set((state) => {
      const currentIds = state.selectedItems.itemIds;
      const isSelected = currentIds.includes(itemId);

      return {
        selectedItems: {
          ...state.selectedItems,
          itemIds: isSelected
            ? currentIds.filter((id) => id !== itemId)
            : [...currentIds, itemId],
          selectAll: false,
        },
      };
    }),

  selectAllItems: (itemIds) =>
    set({
      selectedItems: {
        itemIds,
        selectAll: true,
      },
    }),

  clearSelectedItems: () =>
    set({
      selectedItems: {
        itemIds: [],
        selectAll: false,
      },
    }),

  // Edit modals
  setEditingItemId: (id) => set({ editingItemId: id }),
  setEditingAreaId: (id) => set({ editingAreaId: id }),

  // Reset entire store
  resetStore: () => set(initialState),
}));
