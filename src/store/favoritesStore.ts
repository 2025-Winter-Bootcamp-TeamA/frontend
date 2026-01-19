import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FavoriteTechStack, TechCategory } from '@/app/mypage/_models/favorites.types';

interface FavoritesState {
  techStacks: FavoriteTechStack[];
  addTechStack: (tech: FavoriteTechStack) => void;
  removeTechStack: (id: string) => void;
  toggleTechStack: (tech: FavoriteTechStack) => void;
  isTechStackFavorite: (id: string) => boolean;
  getFavoriteTechStacks: () => FavoriteTechStack[];
}

// 카테고리 매핑 (CATEGORY_INFO의 카테고리명 -> TechCategory)
const mapCategoryToTechCategory = (categoryName: string): TechCategory => {
  const mapping: Record<string, TechCategory> = {
    'Frontend': 'frontend',
    'Backend': 'backend',
    'AI & Data': 'ai-data',
    'DevOps': 'devops',
    'Embedded': 'etc',
    'Game Dev': 'etc',
    'Security': 'etc',
  };
  return mapping[categoryName] || 'etc';
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      techStacks: [],

      addTechStack: (tech) => {
        set((state) => {
          // 이미 존재하는지 확인
          const exists = state.techStacks.some((t) => t.id === tech.id);
          if (exists) {
            // 이미 있으면 isFavorite만 true로 업데이트
            return {
              techStacks: state.techStacks.map((t) =>
                t.id === tech.id ? { ...t, isFavorite: true } : t
              ),
            };
          }
          // 없으면 추가
          return {
            techStacks: [...state.techStacks, { ...tech, isFavorite: true }],
          };
        });
      },

      removeTechStack: (id) => {
        set((state) => ({
          techStacks: state.techStacks.map((t) =>
            t.id === id ? { ...t, isFavorite: false } : t
          ),
        }));
      },

      toggleTechStack: (tech) => {
        const state = get();
        const isFavorite = state.isTechStackFavorite(tech.id);
        
        if (isFavorite) {
          state.removeTechStack(tech.id);
        } else {
          state.addTechStack(tech);
        }
      },

      isTechStackFavorite: (id) => {
        const tech = get().techStacks.find((t) => t.id === id);
        return tech?.isFavorite ?? false;
      },

      getFavoriteTechStacks: () => {
        return get().techStacks.filter((t) => t.isFavorite);
      },
    }),
    {
      name: 'favorites-storage',
    }
  )
);

// 헬퍼 함수: CATEGORY_INFO의 노드를 FavoriteTechStack으로 변환
export const createTechStackFromNode = (
  nodeId: string,
  nodeDesc: string,
  categoryName: string,
  categoryColor: string
): FavoriteTechStack => {
  return {
    id: nodeId,
    name: nodeId,
    category: mapCategoryToTechCategory(categoryName),
    level: 'junior', // 기본값
    logoUrl: `/logos/${nodeId.toLowerCase().replace(/\s+/g, '').replace('.', '')}.svg`,
    docsUrl: `https://www.google.com/search?q=${encodeURIComponent(nodeId)}+official+documentation`,
    createdAt: new Date().toISOString(),
    isFavorite: false, // store에서 관리
  };
};
