import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { useAuthStore } from "@/stores/useAuthStore";
import { Colors } from "@/theme/colors";

interface TabNavigationProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const tabs = [
    {
      id: "home",
      icon: require("../../../assets/images/home_one.png"),
      activeIcon: require("../../../assets/images/homeFill.png"),
    },
    {
      id: "analytics",
      icon: require("../../../assets/images/analytics.png"),
      activeIcon: require("../../../assets/images/analyticsFill.png"),
    },
    {
      id: "wallet",
      icon: require("../../../assets/images/wallet.png"),
      activeIcon: require("../../../assets/images/walletFill.png"),
    },
    {
      id: "music",
      icon: require("../../../assets/images/music.png"),
      activeIcon: require("../../../assets/images/musicFill.png"),
    },
    {
      id: "profile",
      isProfile: true,
    },
  ];

  const { user } = useAuthStore();

  const profileImg = user?.Profile_image?.formats?.small?.url;

  return (
    <View className="sticky pb-6">
      <View
        className="flex-row items-center justify-between p-4 rounded-full shadow-lg"
        style={{
          backgroundColor: "#E8D5FF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {tabs.map((tab) => {
          const imgSrc = activeTab === tab.id ? tab.activeIcon : tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabPress(tab.id)}
              className="items-center justify-center"
              style={{
                minWidth: 32,
              }}
            >
              {tab.isProfile ? (
                <View className="items-center">
                  <View
                    className="w-10 h-10 rounded-full border-2 overflow-hidden"
                    style={{
                      borderColor:
                        activeTab === tab.id ? Colors.primary : "#B3B3B3",
                      backgroundColor: "#F0F0F0",
                    }}
                  >
                    <Image
                      source={{
                        uri: `${process.env.EXPO_PUBLIC_API_URL}${profileImg}`,
                      }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                </View>
              ) : (
                <View className="items-center">
                  <Image
                    source={imgSrc}
                    style={{
                      width: 32,
                      height: 32,
                      opacity: activeTab === tab.id ? 1 : 0.5,
                    }}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default TabNavigation;
