/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "@/api/type";
import { getUserDetail } from "@/api/userPublicApi";
import { storageAPI } from "@/utils/storage";
import { create } from "zustand";



interface AuthStore {
  usersList: User[] | [];
  user: User | null;
  error: string | null;
  isAuthLoaded: boolean;
  setUsersList: (users: User[]) => void;
  setUser: (user: User | null, rememberMe?: boolean) => Promise<void>;
  logOut: () => Promise<void>;
  loadUserFromStorage: () => Promise<void>;
  setError: (error: string | null) => void;
}

const STORAGE_KEY = "authUser";

export const useAuthStore = create<AuthStore>((set) => ({
  usersList: [],
  user: null,
  error: null,
  isAuthLoaded: false,

  setUsersList: (usersList) => set({ usersList }),

  /**
   * Save user in store and AsyncStorage
   * rememberMe = true => persist indefinitely
   * rememberMe = false => expire after 60 minutes
   */
  setUser: async (user, rememberMe = false) => {
    set({ user });

    if (!user) {
      await storageAPI.removeItem(STORAGE_KEY);
      return;
    }

    const ttlMinutes = rememberMe ? undefined : 1440; // 1 hour session for non-remembered
    await storageAPI.setItem(STORAGE_KEY, JSON.stringify(user), ttlMinutes);
  },

  /**
   * Clear user from store and AsyncStorage
   */
  logOut: async () => {
    set({ user: null });
    await storageAPI.removeItem(STORAGE_KEY);
  },

  /**
   * Load user from AsyncStorage on app start
   */
  loadUserFromStorage: async () => {
    try {
      const savedUser = await storageAPI.getItem(STORAGE_KEY);

      if (!savedUser) {
        set({ isAuthLoaded: true });
        return;
      }

      const parsedUser: User = JSON.parse(savedUser);

      if (parsedUser?.id && parsedUser?.token) {
        try {
          const fullUser = await getUserDetail(parsedUser.id, parsedUser.token);

          if (fullUser.blocked) {
            // blocked users get logged out
            await storageAPI.removeItem(STORAGE_KEY);
            set({ user: null, isAuthLoaded: true });
            return;
          }

          set({ user: fullUser, isAuthLoaded: true });
        } catch (apiError) {
          // failed to fetch full user, fallback to stored data
          console.warn("Failed to refresh user:", apiError);
          set({ user: parsedUser, isAuthLoaded: true });
        }
      } else {
        set({ user: parsedUser, isAuthLoaded: true });
      }
    } catch (err) {
      console.warn("loadUserFromStorage error:", err);
      set({ isAuthLoaded: true });
    }
  },

  setError: (error) => set({ error }),
}));
