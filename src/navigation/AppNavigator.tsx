import React, { useState } from "react";
import { View } from "react-native";
import HomeScreen from "@/screens/app/HomeScreen";
import ProfileScreen from "@/screens/app/ProfileScreen";
import AnalyticsScreen from "@/screens/app/AnalyticsScreen";
import WalletScreen from "@/screens/app/WalletScreen";
import MusicScreen from "@/screens/app/MusicScreen";
import DraftScreen from "@/screens/app/DraftScreen";
import UploadedListScreen from "@/screens/app/UploadedListScreen";
import TabNavigation from "@/components/modules/TabNavigation";
import NotificationScreen from "@/screens/app/NotificationScreen";

export default function AppNavigator() {
  const [activeTab, setActiveTab] = useState("home");
  const [currentScreen, setCurrentScreen] = useState("home");

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    // Reset to home screen when switching tabs, unless it's a modal screen
    if (tab !== "drafts") {
      setCurrentScreen("home");
    }
  };

  const handleScreenNavigation = (screen: string) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    // If we're on a modal screen (like drafts or uploads), show that
    if (currentScreen === "drafts") {
      return (
        <DraftScreen navigation={{ goBack: () => setCurrentScreen("home") }} />
      );
    }

    if (currentScreen === "uploads") {
      return (
        <UploadedListScreen
          navigation={{ goBack: () => setCurrentScreen("home") }}
        />
      );
    }
    if (currentScreen === "notification") {
      return (
        <NotificationScreen
          navigation={{ goBack: () => setCurrentScreen("home") }}
        />
      );
    }

    // Otherwise, show the tab-based screen
    switch (activeTab) {
      case "home":
        return <HomeScreen navigation={{ navigate: handleScreenNavigation }} />;
      case "analytics":
        return <AnalyticsScreen />;
      case "wallet":
        return <WalletScreen />;
      case "music":
        return <MusicScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen navigation={{ navigate: handleScreenNavigation }} />;
    }
  };

  return (
    <View className="flex-1">
      {renderScreen()}
      <View className="px-6 bg-transparent">
        <TabNavigation activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    </View>
  );
}
