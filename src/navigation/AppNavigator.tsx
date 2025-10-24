import React, { useState } from "react";
import { View } from "react-native";
import HomeScreen from "@/screens/app/HomeScreen";
import ProfileScreen from "@/screens/app/ProfileScreen";
import AnalyticsScreen from "@/screens/app/AnalyticsScreen";
import WalletScreen from "@/screens/app/WalletScreen";
import DraftScreen from "@/screens/app/DraftScreen";
import UploadedListScreen from "@/screens/app/UploadedListScreen";
import TabNavigation from "@/components/modules/TabNavigation";
import NotificationScreen from "@/screens/app/NotificationScreen";

export default function AppNavigator() {
  const [activeTab, setActiveTab] = useState("home");
  const [currentScreen, setCurrentScreen] = useState("home");

  // Handle tab switching
  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "drafts" && tab !== "uploads" && tab !== "notification") {
      setCurrentScreen("home");
    }
  };

  // Handle navigation between screens
  const handleScreenNavigation = (screen: string) => {
    // When navigating to Draft or Upload, automatically activate Music tab
    if (screen === "drafts" || screen === "uploads") {
      setActiveTab("music");
    }
    setCurrentScreen(screen);
  };

  // Handle "go back" to Home screen
  const goBackToHome = () => {
    setCurrentScreen("home");
    setActiveTab("home");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "drafts":
        return <DraftScreen navigation={{ goBack: goBackToHome }} />;

      case "uploads":
        return <UploadedListScreen navigation={{ goBack: goBackToHome }} />;

      case "notification":
        return <NotificationScreen navigation={{ goBack: goBackToHome }} />;

      default:
        switch (activeTab) {
          case "home":
            return (
              <HomeScreen navigation={{ navigate: handleScreenNavigation }} />
            );
          case "analytics":
            return <AnalyticsScreen />;
          case "wallet":
            return <WalletScreen />;
          case "music":
            return <DraftScreen navigation={{ goBack: goBackToHome }} />;
          case "profile":
            return <ProfileScreen />;
          default:
            return (
              <HomeScreen navigation={{ navigate: handleScreenNavigation }} />
            );
        }
    }
  };

  // Hide tab bar on Notification screen
  const shouldShowTabBar = currentScreen !== "notification";

  return (
    <View className="flex-1">
      {renderScreen()}
      {shouldShowTabBar && (
        <TabNavigation activeTab={activeTab} onTabPress={handleTabPress} />
      )}
    </View>
  );
}
