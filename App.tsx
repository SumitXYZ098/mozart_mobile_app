import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import './global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from '@/navigation/RootNavigator';
import ToastHost from '@/components/modules/ToastHost';

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
      {/* Wrap with view to enforce SafeAreaProvider taking flex:1 */}
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider style={{ flex: 1 }}>
          <RootNavigator />
          <ToastHost />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
