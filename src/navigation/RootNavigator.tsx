import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";
import { useAuthStore } from "@/stores/useAuthStore";

export default function RootNavigator() {
  const {user, loadUserFromStorage} = useAuthStore();

  useEffect(() => {
    loadUserFromStorage();
  }, []);
 
  return (
    <NavigationContainer>
      {user && user.token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
