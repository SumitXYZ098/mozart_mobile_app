import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, Pressable, View } from "react-native";
import { horizontalScale } from "@/utils/metrics";
import { Colors } from "@/theme/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import {
  AnalyticsStackNavigator,
  HomeStackNavigator,
  MusicStackNavigator,
  ProfileStackNavigator,
  WalletStackNavigator,
} from "./StackNavigator";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { display: "none" },
        tabBarStyle: {
          position: "absolute",
          bottom: 24,
          borderRadius: 40,
          marginHorizontal: horizontalScale(24),
          backgroundColor: "#E8D5FF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
          height: 64,
          paddingTop: 16,
          paddingBottom: 16,
          paddingHorizontal: 16,
        },

        tabBarItemStyle: {
          flexBasis: "auto",
          width: "auto",
        },
        tabBarButton: (props) => {
          const {
            children,
            onPress,
            accessibilityState,
            accessibilityLabel,
            testID,
          } = props;
          return (
            <Pressable
              onPress={onPress}
              accessibilityState={accessibilityState}
              accessibilityLabel={accessibilityLabel}
              testID={testID}
              style={{ padding: 0, alignSelf: "center" }}
            >
              {children}
            </Pressable>
          );
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "HomeMain";
          const hideOnScreens = ["Notification"];

          return {
            tabBarStyle: hideOnScreens.includes(routeName)
              ? { display: "none" }
              : {
                  position: "absolute",
                  bottom: 24,
                  borderRadius: 40,
                  marginHorizontal: horizontalScale(24),
                  backgroundColor: "#E8D5FF",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 8,
                  height: 64,
                  paddingTop: 16,
                  paddingBottom: 16,
                  paddingHorizontal: 16,
                },
            tabBarLabelStyle: { display: "none" },
            tabBarItemStyle: { flexBasis: "auto", width: "auto" },
            tabBarButton: (props) => {
              const {
                children,
                onPress,
                accessibilityState,
                accessibilityLabel,
                testID,
              } = props;
              return (
                <Pressable
                  onPress={onPress}
                  accessibilityState={accessibilityState}
                  accessibilityLabel={accessibilityLabel}
                  testID={testID}
                  style={{ padding: 0, alignSelf: "center" }}
                >
                  {children}
                </Pressable>
              );
            },
            tabBarIcon: ({ focused }) => {
              const imgSrc = focused
                ? require("../../assets/images/homeFill.png")
                : require("../../assets/images/home_one.png");
              return (
                <Image
                  source={imgSrc}
                  style={{
                    width: 32,
                    height: 32,
                    opacity: focused ? 1 : 0.5,
                  }}
                />
              );
            },
          };
        }}
      />

      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => {
            const imgSrc = focused
              ? require("../../assets/images/analyticsFill.png")
              : require("../../assets/images/analytics.png");
            return (
              <Image
                source={imgSrc}
                style={{
                  width: 32,
                  height: 32,
                  opacity: focused ? 1 : 0.5,
                }}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => {
            const imgSrc = focused
              ? require("../../assets/images/walletFill.png")
              : require("../../assets/images/wallet.png");
            return (
              <Image
                source={imgSrc}
                style={{
                  width: 32,
                  height: 32,
                  opacity: focused ? 1 : 0.5,
                }}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="MusicTab"
        component={MusicStackNavigator}
         options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "HomeMain";
          const hideOnScreens = ["Notification"];

          return {
            tabBarStyle: hideOnScreens.includes(routeName)
              ? { display: "none" }
              : {
                  position: "absolute",
                  bottom: 24,
                  borderRadius: 40,
                  marginHorizontal: horizontalScale(24),
                  backgroundColor: "#E8D5FF",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 8,
                  height: 64,
                  paddingTop: 16,
                  paddingBottom: 16,
                  paddingHorizontal: 16,
                },
            tabBarLabelStyle: { display: "none" },
            tabBarItemStyle: { flexBasis: "auto", width: "auto" },
            tabBarButton: (props) => {
              const {
                children,
                onPress,
                accessibilityState,
                accessibilityLabel,
                testID,
              } = props;
              return (
                <Pressable
                  onPress={onPress}
                  accessibilityState={accessibilityState}
                  accessibilityLabel={accessibilityLabel}
                  testID={testID}
                  style={{ padding: 0, alignSelf: "center" }}
                >
                  {children}
                </Pressable>
              );
            },
             tabBarIcon: ({ focused }) => {
            const imgSrc = focused
              ? require("../../assets/images/musicFill.png")
              : require("../../assets/images/music.png");
            return (
              <Image
                source={imgSrc}
                style={{
                  width: 32,
                  height: 32,
                  opacity: focused ? 1 : 0.5,
                }}
              />
            );
          },
          };
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => {
            const { user } = useAuthStore();
            const profileImg = user?.Profile_image?.formats?.small?.url;
            return profileImg ? (
              <View
                className="w-10 h-10 rounded-full border-2 overflow-hidden"
                style={{
                  borderColor: focused ? Colors.primary : "#E8D5FF",
                  backgroundColor: "#F0F0F0",
                }}
              >
                <Image
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_API_URL}${profileImg}`,
                  }}
                  className="w-full h-full rounded-full"
                />
              </View>
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={34}
                color={Colors.primary}
                style={{
                  opacity: focused ? 1 : 0.5,
                }}
              />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
