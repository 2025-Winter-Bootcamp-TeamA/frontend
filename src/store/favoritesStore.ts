import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TechStack, Corp } from "@/types";
import { MOCK_TECH_STACKS, MOCK_CORPS } from "@/data/mockData";

interface FavoritesState {
  // 기술 스택 관련
  favoriteTechIds: Set<number>;
  toggleTechFavorite: (id: number) => void;
  isTechFavorite: (id: number) => boolean;
  getFavoriteTechStacks: () => TechStack[];

  // 기업 관련
  favoriteCorpIds: Set<number>;
  toggleCorpFavorite: (id: number) => void;
  isCorpFavorite: (id: number) => boolean;
  getFavoriteCorps: () => Corp[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // --- 기술 스택 ---
      favoriteTechIds: new Set([101, 102]), // 초기값
      toggleTechFavorite: (id) =>
        set((state) => {
          const newSet = new Set(state.favoriteTechIds);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return { favoriteTechIds: newSet };
        }),
      isTechFavorite: (id) => get().favoriteTechIds.has(id),
      getFavoriteTechStacks: () => {
        return MOCK_TECH_STACKS.filter((t) => get().favoriteTechIds.has(t.id));
      },

      // --- 기업 ---
      favoriteCorpIds: new Set([1, 2]), // 초기값
      toggleCorpFavorite: (id) =>
        set((state) => {
          const newSet = new Set(state.favoriteCorpIds);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return { favoriteCorpIds: newSet };
        }),
      isCorpFavorite: (id) => get().favoriteCorpIds.has(id),
      getFavoriteCorps: () => {
        return MOCK_CORPS.filter((c) => get().favoriteCorpIds.has(c.id));
      },
    }),
    {
      name: "mypage-favorites-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              favoriteTechIds: new Set(state.favoriteTechIds),
              favoriteCorpIds: new Set(state.favoriteCorpIds),
            },
          };
        },
        setItem: (name, value) => {
          const state = {
            ...value.state,
            favoriteTechIds: Array.from(value.state.favoriteTechIds),
            favoriteCorpIds: Array.from(value.state.favoriteCorpIds),
          };
          localStorage.setItem(name, JSON.stringify({ state }));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);