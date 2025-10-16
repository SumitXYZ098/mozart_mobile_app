import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { useAuthStore } from '@/stores/useAuthStore';

export default function RootNavigator() {
  const user = useAuthStore((s) => s.user);
  const isAuthLoaded = useAuthStore((s) => s.isAuthLoaded);
  const loadUserFromStorage = useAuthStore((s) => s.loadUserFromStorage);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  if (!isAuthLoaded) return null; // could render a splash

  return (
    <NavigationContainer>
      {user?.token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
