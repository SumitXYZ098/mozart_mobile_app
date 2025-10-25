import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NotificationScreen from "@/screens/app/NotificationScreen";
import DraftScreen from "@/screens/app/DraftScreen";
import HomeScreen from "@/screens/app/HomeScreen";
import AnalyticsScreen from "@/screens/app/AnalyticsScreen";
import WalletScreen from "@/screens/app/WalletScreen";
import ProfileScreen from "@/screens/app/ProfileScreen";
import UploadedScreen from "@/screens/app/UploadedScreen";

const Stack = createNativeStackNavigator();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>
  );
}

export function AnalyticsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AnalyticsMain" component={AnalyticsScreen} />
    </Stack.Navigator>
  );
}

export function WalletStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalletMain" component={WalletScreen} />
    </Stack.Navigator>
  );
}

export function MusicStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Draft" component={DraftScreen} />
      <Stack.Screen name="Upload" component={UploadedScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      
    </Stack.Navigator>
  );
}

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
