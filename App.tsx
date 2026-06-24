import "react-native-reanimated";
import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Font from "expo-font";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import "./global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RootNavigator from "@/navigation/RootNavigator";
import { PortalProvider } from "@gorhom/portal";
import { KeyboardProvider } from "react-native-keyboard-controller";
import axios from "axios";

// Global Axios logger interceptors for network debugging
axios.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} -> ${config.url}`, config.params ? `Params: ${JSON.stringify(config.params)}` : "");
    return config;
  },
  (error) => {
    console.error(`[API Request Error]`, error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} <- ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[API Response Error] ${error.response?.status || error.message} <- ${error.config?.url}`);
    return Promise.reject(error);
  }
);

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        PlusJakartaSans_400Regular,
        PlusJakartaSans_500Medium,
        PlusJakartaSans_600SemiBold,
        PlusJakartaSans_700Bold,
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_600SemiBold,
        Poppins_700Bold,
      });
    }
    loadFonts();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PortalProvider>
        <SafeAreaProvider style={{ flex: 1 }}>
          <QueryClientProvider client={queryClient}>
            <KeyboardProvider>
              <RootNavigator />
            </KeyboardProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </PortalProvider>
    </GestureHandlerRootView>
  );
}
