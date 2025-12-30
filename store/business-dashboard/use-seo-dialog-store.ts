// store/use-seo-dialog-store.ts
import { create } from "zustand";

interface SEODialogState {
  isOpen: boolean;
  tempKeywords: string[];
  setIsOpen: (open: boolean) => void;
  setTempKeywords: (keywords: string[]) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
}

export const useSEODialogStore = create<SEODialogState>((set) => ({
  isOpen: false,
  tempKeywords: [],
  setIsOpen: (open) => set({ isOpen: open }),
  setTempKeywords: (keywords) => set({ tempKeywords: keywords }),
  addKeyword: (keyword) =>
    set((state) => ({
      // Clean keyword: lowercase, trimmed, no duplicates
      tempKeywords: state.tempKeywords.includes(keyword.trim().toLowerCase())
        ? state.tempKeywords
        : [...state.tempKeywords, keyword.trim().toLowerCase()],
    })),
  removeKeyword: (keyword) =>
    set((state) => ({
      tempKeywords: state.tempKeywords.filter((k) => k !== keyword),
    })),
}));
