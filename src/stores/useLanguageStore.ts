import { create } from "zustand";
import { storageAPI } from "@/utils/storage";

interface LanguageStore {
  /** The currently selected language */
  language: string;
  /** Set and persist the language */
  setLanguage: (lang: string) => Promise<void>;
  /** Hydrate the language state from local storage */
  loadLanguageFromStorage: () => Promise<void>;
}

const STORAGE_KEY = "userLanguage";

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: "English",

  setLanguage: async (lang: string) => {
    set({ language: lang });
    await storageAPI.setItem(STORAGE_KEY, lang);
  },

  loadLanguageFromStorage: async () => {
    try {
      const saved = await storageAPI.getItem(STORAGE_KEY);
      if (saved) {
        set({ language: saved });
      }
    } catch (err) {
      console.warn("Failed to load language from storage:", err);
    }
  },
}));
