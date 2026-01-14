import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company } from '@/app/map/_models/companies.types';

interface CompanyFavoritesState {
  favoriteCompanyIds: Set<string>;
  toggleFavorite: (companyId: string) => void;
  isFavorite: (companyId: string) => boolean;
  getFavoriteCompanyIds: () => string[];
}

export const useCompanyFavoritesStore = create<CompanyFavoritesState>()(
  persist(
    (set, get) => ({
      favoriteCompanyIds: new Set<string>(),

      toggleFavorite: (companyId) => {
        set((state) => {
          const newSet = new Set(state.favoriteCompanyIds);
          if (newSet.has(companyId)) {
            newSet.delete(companyId);
          } else {
            newSet.add(companyId);
          }
          return { favoriteCompanyIds: newSet };
        });
      },

      isFavorite: (companyId) => {
        return get().favoriteCompanyIds.has(companyId);
      },

      getFavoriteCompanyIds: () => {
        return Array.from(get().favoriteCompanyIds);
      },
    }),
    {
      name: 'company-favorites-storage',
      // Set을 배열로 변환하여 저장
      serialize: (state) => {
        return JSON.stringify({
          favoriteCompanyIds: Array.from(state?.favoriteCompanyIds || []),
        });
      },
      deserialize: (str) => {
        try {
          const parsed = JSON.parse(str);
          return {
            favoriteCompanyIds: new Set(parsed?.favoriteCompanyIds || []),
          };
        } catch (error) {
          return {
            favoriteCompanyIds: new Set<string>(),
          };
        }
      },
    }
  )
);
