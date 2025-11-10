import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NotificationScreen from "@/screens/app/NotificationScreen";
import DraftScreen from "@/screens/app/DraftScreen";
import HomeScreen from "@/screens/app/HomeScreen";
import AnalyticsScreen from "@/screens/app/AnalyticsScreen";
import WalletScreen from "@/screens/app/WalletScreen";
import ProfileScreen from "@/screens/app/ProfileScreen";
import CalendarEventScreen from "@/screens/app/CalendarEventScreen";
import MyTrackScreen from "@/screens/app/MyTrackScreen";
import MyReleaseScreen from "@/screens/app/MyReleaseScreen";
import NewReleaseScreen from "@/screens/app/NewReleaseScreen";
import WelcomeNewReleaseScreen from "@/components/screenComponents/newReleaseScreen/WelcomeNewReleaseScreen";
import ArtistScreen from "@/screens/app/ArtistScreen";

const Stack = createNativeStackNavigator();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Artist" component={ArtistScreen} />
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
    <Stack.Navigator
      initialRouteName="Draft"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Draft" component={DraftScreen} />
      <Stack.Screen name="Upload" component={MyReleaseScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="CalendarEvent" component={CalendarEventScreen} />
      <Stack.Screen name="Track" component={MyTrackScreen} />
      <Stack.Screen name="NewRelease" component={NewReleaseScreen} />
    </Stack.Navigator>
  );
}

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
