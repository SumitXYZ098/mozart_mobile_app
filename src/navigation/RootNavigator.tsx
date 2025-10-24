import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import { useAuthStore } from "@/stores/useAuthStore";
import AppNavigator from "./AppNavigator";

export default function RootNavigator() {
  const { user, loadUserFromStorage } = useAuthStore();

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  if (!user) return null; // optionally show SplashScreen here

  return (
    <NavigationContainer>
      {user && user.token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
