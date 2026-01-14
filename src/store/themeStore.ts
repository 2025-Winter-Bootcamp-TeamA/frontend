import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        // HTML 요소에 클래스 적용
        if (typeof window !== 'undefined') {
          const html = document.documentElement;
          html.classList.remove('light', 'dark');
          html.classList.add(theme);
        }
      },
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          // HTML 요소에 클래스 적용
          if (typeof window !== 'undefined') {
            const html = document.documentElement;
            html.classList.remove('light', 'dark');
            html.classList.add(newTheme);
          }
          return { theme: newTheme };
        });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // 저장된 테마를 HTML에 적용
        if (state && typeof window !== 'undefined') {
          const html = document.documentElement;
          html.classList.remove('light', 'dark');
          html.classList.add(state.theme);
        }
      },
    }
  )
);
