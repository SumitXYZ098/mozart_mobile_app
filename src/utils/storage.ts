import AsyncStorage from "@react-native-async-storage/async-storage";

type StoredItem = {
  value: string;
  expiresAt?: number; // unix timestamp in ms
};

export const storageAPI = {
  /**
   * Store a value with optional TTL (in minutes)
   */
  setItem: async (key: string, value: string, ttlMinutes?: number) => {
    const item: StoredItem = {
      value,
      expiresAt: ttlMinutes ? Date.now() + ttlMinutes * 60 * 1000 : undefined,
    };
    try {
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (err) {
      console.log("AsyncStorage setItem error:", err);
    }
  },

  /**
   * Retrieve a value, returning null if expired or not found
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;

      const parsed: StoredItem = JSON.parse(raw);

      if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
        // expired, remove key
        await AsyncStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (err) {
      console.log("AsyncStorage getItem error:", err);
      return null;
    }
  },

  /**
   * Remove a stored item
   */
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.log("AsyncStorage removeItem error:", err);
    }
  },
};
