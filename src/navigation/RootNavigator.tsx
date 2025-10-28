import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import { useAuthStore } from "@/stores/useAuthStore";
import TabNavigator from "./TabNavigator";

export default function RootNavigator() {
  const { user, loadUserFromStorage } = useAuthStore();

  useEffect(() => {
    loadUserFromStorage();
  }, []);


  return (
    <NavigationContainer>
      {user && user.token ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
