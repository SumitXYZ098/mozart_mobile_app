import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "@/theme/colors";
import AuthNavigator from "./AuthNavigator";
import { useAuthStore } from "@/stores/useAuthStore";
import DrawerNavigator from "./DrawerNavigator";
import ChoosePlanScreen from "@/screens/app/ChoosePlanScreen";


export type RootStackParamList = {
  Dashboard: undefined;
  ChoosePlan: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, isAuthLoaded, loadUserFromStorage } = useAuthStore();

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  if (!isAuthLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.white,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isSubscribed =
    user?.latest_subscription && user.latest_subscription.status === "active";

  return (
    <NavigationContainer>
      {user && user.token ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isSubscribed ? (
            <>
              <Stack.Screen name="Dashboard" component={DrawerNavigator} />
              <Stack.Screen name="ChoosePlan" component={ChoosePlanScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="ChoosePlan" component={ChoosePlanScreen} />
              <Stack.Screen name="Dashboard" component={DrawerNavigator} />
            </>
          )}
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
