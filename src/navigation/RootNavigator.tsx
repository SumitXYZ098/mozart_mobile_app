import React, { useEffect } from "react";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, Linking, Alert } from "react-native";
import { Colors } from "@/theme/colors";
import AuthNavigator from "./AuthNavigator";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLanguageStore } from "@/stores/useLanguageStore";
import DrawerNavigator from "./DrawerNavigator";
import ChoosePlanScreen from "@/screens/app/ChoosePlanScreen";
import UpgradePlanScreen from "@/screens/app/UpgradePlanScreen";
import { toast } from "@/stores/useToastStore";

export type RootStackParamList = {
  Dashboard: undefined;
  ChoosePlan: undefined;
  UpgradePlan: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, isAuthLoaded, loadUserFromStorage } = useAuthStore();
  const { loadLanguageFromStorage } = useLanguageStore();

  useEffect(() => {
    loadUserFromStorage();
    loadLanguageFromStorage();
  }, []);

  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log("Incoming deep link:", url);
      if (url.includes("payment-success")) {
        try {
          const { refreshUserProfile } = useAuthStore.getState();
          await refreshUserProfile();
          
          Alert.alert(
            "Success",
            "Payment successful! Your subscription is now active.",
            [
              {
                text: "OK",
                onPress: () => {
                  if (navigationRef.isReady()) {
                    navigationRef.reset({
                      index: 0,
                      routes: [{ name: "Dashboard" }],
                    });
                  }
                },
              },
            ],
            { cancelable: false }
          );
        } catch (error) {
          console.error("Failed to refresh profile after payment success:", error);
          toast.error("Failed to sync your subscription status. Please refresh manually.");
        }
      } else if (url.includes("payment-cancel")) {
        Alert.alert(
          "Payment Cancelled",
          "Your payment was cancelled. If this was a mistake, please try again."
        );
      }
    };

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
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
    <NavigationContainer ref={navigationRef}>
      {user && user.token ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isSubscribed ? (
            <>
              <Stack.Screen name="Dashboard" component={DrawerNavigator} />
              <Stack.Screen name="ChoosePlan" component={ChoosePlanScreen} />
              <Stack.Screen name="UpgradePlan" component={UpgradePlanScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="ChoosePlan" component={ChoosePlanScreen} />
              <Stack.Screen name="Dashboard" component={DrawerNavigator} />
              <Stack.Screen name="UpgradePlan" component={UpgradePlanScreen} />
            </>
          )}
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
