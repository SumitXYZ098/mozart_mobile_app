import React from "react";
import { createDrawerNavigator, useDrawerProgress } from "@react-navigation/drawer";
import TabNavigator from "./TabNavigator";
import CustomDrawer from "@/components/modules/CustomDrawer";
import Animated, { useAnimatedStyle, interpolate } from "react-native-reanimated";
import { StyleSheet, Platform } from "react-native";

const Drawer = createDrawerNavigator();

function DrawerScreenWrapper() {
  const progress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => {
    // Scale down from 1 to 0.82
    const scale = interpolate(progress.value, [0, 1], [1, 0.82]);
    // Slide to the right
    const translateX = interpolate(progress.value, [0, 1], [0, 75]);
    // 3D isometric rotation (skew)
    const rotateY = `${interpolate(progress.value, [0, 1], [0, -14])}deg`;
    // Corner rounding when open
    const borderRadius = interpolate(progress.value, [0, 1], [0, 24]);

    return {
      transform: [
        { perspective: 1200 },
        { scale },
        { translateX },
        { rotateY }
      ],
      borderRadius,
    };
  });

  return (
    <Animated.View style={[styles.mainScreenContainer, animatedStyle]}>
      <TabNavigator />
    </Animated.View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: "back",
        overlayColor: "transparent",
        drawerStyle: {
          width: 280,
          backgroundColor: "transparent",
        },
      }}

      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="MainTabs" component={DrawerScreenWrapper} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  mainScreenContainer: {
    flex: 1,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 12,
    backgroundColor: "#FFFFFF",
  },
});
