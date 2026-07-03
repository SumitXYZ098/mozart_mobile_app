import React, { useEffect, useState } from "react";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {   View, Linking, Modal, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Colors } from "@/theme/colors";
import AuthNavigator from "./AuthNavigator";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLanguageStore } from "@/stores/useLanguageStore";
import DrawerNavigator from "./DrawerNavigator";
import ChoosePlanScreen from "@/screens/app/ChoosePlanScreen";
import UpgradePlanScreen from "@/screens/app/UpgradePlanScreen";
import { toast } from "@/stores/useToastStore";
import { Ionicons } from "@expo/vector-icons";
import { verifyPayment } from "@/api/subscriptionApi";
import { getArtistsLimit } from "@/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from 'expo-splash-screen';

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
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "cancel">("success");
  const [alertDescription, setAlertDescription] = useState("");
  const [successTargetRoute, setSuccessTargetRoute] = useState<"Dashboard" | "UpgradePlan" | "Profile" | "Upload">("Dashboard");

  useEffect(() => {
    loadUserFromStorage();
    loadLanguageFromStorage();
  }, []);

  useEffect(() => {
    if (isAuthLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isAuthLoaded]);

  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log("Incoming deep link:", url);

      // Check for success or cancel keywords in deep link URL
      const isSuccess = url.includes("payment-success") || url.includes("session_id=");
      const isCancel = url.includes("payment-cancel");

      // Check if we have a pending checkout session stored locally in AsyncStorage
      const pendingSessionStr = await AsyncStorage.getItem("pending_checkout_session");
      const pendingSession = pendingSessionStr ? JSON.parse(pendingSessionStr) : null;

      if (isSuccess || (pendingSession && (url.includes("/profile") || url.includes("/upgrade")))) {
        try {
          const oldUser = useAuthStore.getState().user;
          const oldLimit = getArtistsLimit(oldUser);

          // Get session ID from URL or AsyncStorage fallback
          const match = url.match(/[?&]session_id=([^&]+)/);
          const sessionId = match ? match[1] : (pendingSession ? pendingSession.sessionId : null);

          if (sessionId && user?.token) {
            console.log("RootNavigator: Verifying Stripe payment session:", sessionId);
            await verifyPayment(sessionId, user.token);
          }

          const { refreshUserProfile } = useAuthStore.getState();
          await refreshUserProfile();

          const newUser = useAuthStore.getState().user;
          const newLimit = getArtistsLimit(newUser);

          let desc = "Your payment was processed successfully. Your subscription is now active!";
          let targetRoute: "Dashboard" | "UpgradePlan" | "Profile" | "Upload" = "Dashboard";

          if (url.includes("/profile")) {
            targetRoute = "Profile";
          } else if (url.includes("/upgrade")) {
            targetRoute = "UpgradePlan";
          } else if (url.includes("/catalogue/my-release")) {
            targetRoute = "Upload";
          }

          if (newLimit > oldLimit) {
            if (oldLimit > 0) {
              const diff = newLimit - oldLimit;
              desc = `Your plan has been successfully upgraded with ${diff} primary artist${diff > 1 ? "s" : ""}!`;
            } else {
              desc = `Your subscription to the ${newUser?.latest_subscription?.plan?.name || "premium"} plan is now active!`;
            }
          }

          // Clear the pending checkout state since payment verification is handled
          await AsyncStorage.removeItem("pending_checkout_session");

          setAlertDescription(desc);
          setSuccessTargetRoute(targetRoute);
          setAlertType("success");
          setAlertVisible(true);
        } catch (error) {
          console.error("Failed to refresh profile after payment success:", error);
          toast.error("Failed to sync your subscription status. Please refresh manually.");
        }
      } else if (isCancel || (pendingSession && url.includes("/profile") && !url.includes("session_id="))) {
        // Fallback for cancel redirection if flat path was hit
        setAlertDescription("Your payment was cancelled. If this was a mistake, please try again.");
        let targetRoute: "Dashboard" | "UpgradePlan" | "Profile" | "Upload" = "Dashboard";

        if (url.includes("/profile")) {
          targetRoute = "Profile";
        } else if (url.includes("/upgrade")) {
          targetRoute = "UpgradePlan";
        } else if (url.includes("/catalogue/my-release")) {
          targetRoute = "Upload";
        }

        // Clear the pending checkout state
        await AsyncStorage.removeItem("pending_checkout_session");

        setSuccessTargetRoute(targetRoute);
        setAlertType("cancel");
        setAlertVisible(true);
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
          backgroundColor: Colors.primary,
        }}
      >
        <Image
          source={require("../../assets/icon.png")}
          style={{ width: 200, height: 120 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  const isSubscribed =
    user?.latest_subscription && user.latest_subscription.status === "active";

  return (
    <>
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

      {/* Beautiful Custom Alert Modal */}
      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAlertVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[
              styles.modalIconContainer,
              { backgroundColor: alertType === "success" ? "#F4EBFF" : "#FCE8E6" }
            ]}>
              <Ionicons
                name={alertType === "success" ? "checkmark-circle" : "close-circle"}
                size={40}
                color={alertType === "success" ? Colors.primary : "#C5221F"}
              />
            </View>
            <Text style={styles.modalTitle}>
              {alertType === "success" ? "Payment Successful!" : "Payment Cancelled"}
            </Text>
            <Text style={styles.modalDescription}>
              {alertDescription}
            </Text>

            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: alertType === "success" ? Colors.primary : "#C5221F" }
              ]}
              activeOpacity={0.8}
              onPress={() => {
                setAlertVisible(false);
                if (navigationRef.isReady()) {
                  if (successTargetRoute === "Profile") {
                    navigationRef.navigate("Dashboard", {
                      screen: "MainTabs",
                      params: {
                        screen: "ProfileTab",
                      }
                    } as any);
                  } else if (successTargetRoute === "UpgradePlan") {
                    navigationRef.reset({
                      index: 1,
                      routes: [{ name: "Dashboard" }, { name: "UpgradePlan" }],
                    });
                  } else if (successTargetRoute === "Upload") {
                    navigationRef.navigate("Dashboard", {
                      screen: "MainTabs",
                      params: {
                        screen: "MusicTab",
                        params: {
                          screen: "Upload",
                        }
                      }
                    } as any);
                  } else {
                    navigationRef.reset({
                      index: 0,
                      routes: [{ name: "Dashboard" }],
                    });
                  }
                }
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 5, 20, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  modalDescription: {
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: "Poppins_400Regular",
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
