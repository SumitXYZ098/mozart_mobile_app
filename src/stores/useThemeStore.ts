import { create } from "zustand";
import { storageAPI } from "@/utils/storage";

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (isDark: boolean) => Promise<void>;
  loadThemeFromStorage: () => Promise<void>;
}

const STORAGE_KEY = "isDarkMode";

export const useThemeStore = create<ThemeStore>((set) => ({
  isDarkMode: false,

  toggleTheme: async () => {
    set((state) => {
      const newMode = !state.isDarkMode;
      storageAPI.setItem(STORAGE_KEY, JSON.stringify(newMode)).catch((err) =>
        console.warn("Failed to save theme:", err)
      );
      return { isDarkMode: newMode };
    });
  },

  setTheme: async (isDark: boolean) => {
    set({ isDarkMode: isDark });
    await storageAPI.setItem(STORAGE_KEY, JSON.stringify(isDark));
  },

  loadThemeFromStorage: async () => {
    try {
      set({ isDarkMode: false });
      await storageAPI.setItem(STORAGE_KEY, JSON.stringify(false));
    } catch (err) {
      console.warn("Failed to reset theme:", err);
    }
  },
}));
