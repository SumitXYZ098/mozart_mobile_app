import * as SecureStore from "expo-secure-store";

export const secureStoreAPI = {
  /**
   * Securely store a string value
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error(`SecureStore setItem error for key ${key}:`, err);
    }
  },

  /**
   * Securely retrieve a stored string value
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error(`SecureStore getItem error for key ${key}:`, err);
      return null;
    }
  },

  /**
   * Securely delete a stored value
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.error(`SecureStore deleteItem error for key ${key}:`, err);
    }
  },
};
