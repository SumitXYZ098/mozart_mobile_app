import axios from "axios";
import { secureStoreAPI } from "@/utils/secureStore";
import { useAuthStore } from "@/stores/useAuthStore";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token securely
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await secureStoreAPI.getItem("userToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error reading token from SecureStore in Request Interceptor:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally (e.g. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized request detected. Logging out user...");
      try {
        const { logOut } = useAuthStore.getState();
        await logOut();
      } catch (logoutError) {
        console.error("Failed to automatically log out user on 401:", logoutError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
