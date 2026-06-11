import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SearchResult, CountryCode } from '@/types';

export interface CompareItem {
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  score?: number;
  grade?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppStore {
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;

  selectedCountry: CountryCode;
  setSelectedCountry: (country: CountryCode) => void;
  healthGoal: string;
  setHealthGoal: (goal: string) => void;
  ageGroup: string;
  setAgeGroup: (age: string) => void;

  hasSelectedCountry: boolean;
  setHasSelectedCountry: (v: boolean) => void;

  compareList: CompareItem[];
  addToCompare: (item: CompareItem) => void;
  removeFromCompare: (barcode: string) => void;
  clearCompare: () => void;

  searchFilters: {
    minGrade: string;
    novaGroup: string;
  };
  setSearchFilters: (filters: { minGrade?: string; novaGroup?: string }) => void;

  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      recentSearches: [],
      addRecentSearch: (query) =>
        set((state) => ({
          recentSearches: [query, ...state.recentSearches.filter((q) => q !== query)].slice(0, 10),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),

      searchResults: [],
      setSearchResults: (results) => set({ searchResults: results }),

      selectedCountry: 'US',
      setSelectedCountry: (country) => set({ selectedCountry: country }),
      healthGoal: 'General Health',
      setHealthGoal: (goal) => set({ healthGoal: goal }),
      ageGroup: 'Adult',
      setAgeGroup: (age) => set({ ageGroup: age }),

      hasSelectedCountry: false,
      setHasSelectedCountry: (v) => set({ hasSelectedCountry: v }),

      compareList: [],
      addToCompare: (item) =>
        set((state) => {
          if (state.compareList.length >= 4) return state;
          if (state.compareList.some((c) => c.barcode === item.barcode)) return state;
          return { compareList: [...state.compareList, item] };
        }),
      removeFromCompare: (barcode) =>
        set((state) => ({
          compareList: state.compareList.filter((c) => c.barcode !== barcode),
        })),
      clearCompare: () => set({ compareList: [] }),

      searchFilters: { minGrade: '', novaGroup: '' },
      setSearchFilters: (filters) =>
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters },
        })),

      toasts: [],
      addToast: (toast) =>
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).slice(2) }],
        })),
      removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'foodscore-storage',
      partialize: (state) => ({
        hasSelectedCountry: state.hasSelectedCountry,
        recentSearches: state.recentSearches,
        selectedCountry: state.selectedCountry,
        compareList: state.compareList,
        searchFilters: state.searchFilters,
      }),
    }
  )
);
