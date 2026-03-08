import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeState = {
    isDark: boolean;
    toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            isDark: true,
            toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
        }),
        {
            name: 'todoflow-theme',
        }
    )
);
