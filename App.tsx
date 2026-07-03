import "react-native-reanimated";
import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while loading the initial auth state and resources
SplashScreen.preventAutoHideAsync().catch(() => {});
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
 
 

const queryClient = new QueryClient();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
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
        setFontsLoaded(true);
      } catch (e) {
        console.warn("Failed to load fonts:", e);
        setFontsLoaded(true); // Proceed anyway to avoid getting stuck
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

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

