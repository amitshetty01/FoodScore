import { create } from 'zustand';
import { SearchResult, CountryCode } from '@/types';

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

  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const useAppStore = create<AppStore>((set) => ({
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

  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).slice(2) }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
