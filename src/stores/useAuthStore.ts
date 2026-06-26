import { User } from "@/api/type";
import { getUserDetail } from "@/api/userPublicApi";
import { storageAPI } from "@/utils/storage";
import { secureStoreAPI } from "@/utils/secureStore";
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
  refreshUserProfile: () => Promise<void>;
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
   * Save user in store and AsyncStorage / SecureStore
   */
  setUser: async (user, rememberMe = false) => {
    set({ user });

    if (!user) {
      await storageAPI.removeItem(STORAGE_KEY);
      await secureStoreAPI.removeItem("userToken");
      return;
    }

    // Save token in SecureStore
    if (user.token) {
      await secureStoreAPI.setItem("userToken", user.token);
    } else {
      await secureStoreAPI.removeItem("userToken");
    }

    // Strip token from details saved to standard AsyncStorage
    const { token: _token, ...userToSave } = user;

    const ttlMinutes = rememberMe ? undefined : 1440; 
    await storageAPI.setItem(STORAGE_KEY, JSON.stringify(userToSave), ttlMinutes);
  },

  /**
   * Clear user from store, AsyncStorage, and SecureStore
   */
  logOut: async () => {
    await storageAPI.removeItem(STORAGE_KEY);
    await secureStoreAPI.removeItem("userToken");
    set({ user: null });
  },

  /**
   * Load user from AsyncStorage and SecureStore on app start
   */
  loadUserFromStorage: async () => {
    try {
      const savedToken = await secureStoreAPI.getItem("userToken");
      const savedUser = await storageAPI.getItem(STORAGE_KEY);

      if (!savedToken || !savedUser) {
        // If one is missing, clear both to keep state consistent
        await secureStoreAPI.removeItem("userToken");
        await storageAPI.removeItem(STORAGE_KEY);
        set({ user: null, isAuthLoaded: true });
        return;
      }

      const parsedUser: User = JSON.parse(savedUser);
      // Restore token to in-memory user object
      parsedUser.token = savedToken;

      if (parsedUser?.id && parsedUser?.token) {
        try {
          const fullUser = await getUserDetail(parsedUser.id, parsedUser.token);

          if (fullUser.blocked) {
            // Blocked users get logged out
            await secureStoreAPI.removeItem("userToken");
            await storageAPI.removeItem(STORAGE_KEY);
            set({ user: null, isAuthLoaded: true });
            return;
          }

          const updatedUser = {
            ...parsedUser,
            ...fullUser,
            token: parsedUser.token, // preserve token in memory
          };

          // Save profile details to AsyncStorage (excluding token)
          const { token: _token, ...profileToSave } = updatedUser;
          await storageAPI.setItem(STORAGE_KEY, JSON.stringify(profileToSave));

          set({ user: updatedUser, isAuthLoaded: true });
        } catch (apiError) {
          // Failed to fetch full user from network, fallback to stored data in memory
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

  refreshUserProfile: async () => {
    const { user, setUser } = useAuthStore.getState();
    if (!user || !user.token || !user.id) return;
    try {
      const fullUser = await getUserDetail(user.id, user.token);
      const updatedUser = {
        ...user,
        ...fullUser,
        token: user.token, // preserve token
      };
      await setUser(updatedUser, true);
    } catch (apiError) {
      console.warn("Failed to refresh user profile:", apiError);
      throw apiError;
    }
  },

  setError: (error) => set({ error }),
}));
