import React, { useRef } from "react";
import { View, PanResponder, StyleSheet, Animated, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

export type TabName =
  | "HomeTab"
  | "AnalyticsTab"
  | "WalletTab"
  | "MusicTab"
  | "ProfileTab";

// Tab order from left to right
const TAB_CONFIG: { tab: TabName; initialScreen: string }[] = [
  { tab: "HomeTab", initialScreen: "HomeMain" },
  { tab: "AnalyticsTab", initialScreen: "AnalyticsMain" },
  { tab: "WalletTab", initialScreen: "WalletMain" },
  { tab: "MusicTab", initialScreen: "Draft" },
  { tab: "ProfileTab", initialScreen: "ProfileMain" },
];

interface SwipeBackToHomeProps {
  children: React.ReactNode;
  currentTab?: TabName;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const EDGE_THRESHOLD = 70; // 70px margin from screen edges

export default function SwipeBackToHome({
  children,
  currentTab = "HomeTab",
}: SwipeBackToHomeProps) {
  const navigation = useNavigation<any>();
  const translateX = useRef(new Animated.Value(0)).current;

  const currentIndex = TAB_CONFIG.findIndex((item) => item.tab === currentTab);
  const hasLeftTab = currentIndex > 0;
  const hasRightTab = currentIndex !== -1 && currentIndex < TAB_CONFIG.length - 1;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,

      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const startX = evt.nativeEvent.pageX;
        const dx = gestureState.dx;
        const isHorizontal = Math.abs(dx) > Math.abs(gestureState.dy) * 1.5;

        // 1. Swipe Right: Touch from left edge & moving right & previous tab exists
        const isSwipingRight =
          hasLeftTab && startX < EDGE_THRESHOLD && dx > 15 && isHorizontal;

        // 2. Swipe Left: Touch from right edge & moving left & next tab exists
        const isSwipingLeft =
          hasRightTab &&
          startX > SCREEN_WIDTH - EDGE_THRESHOLD &&
          dx < -15 &&
          isHorizontal;

        return isSwipingRight || isSwipingLeft;
      },

      onPanResponderMove: (_, gestureState) => {
        const dx = gestureState.dx;
        // Follow finger right if there's a tab to the left
        if (dx > 0 && hasLeftTab) {
          translateX.setValue(dx);
        }
        // Follow finger left if there's a tab to the right
        else if (dx < 0 && hasRightTab) {
          translateX.setValue(dx);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        const dx = gestureState.dx;
        const vx = gestureState.vx;

        // Swiped far enough right -> Go to tab on the left
        if (hasLeftTab && (dx > 80 || vx > 0.4)) {
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            const prev = TAB_CONFIG[currentIndex - 1];
            navigation.navigate(prev.tab, { screen: prev.initialScreen });
            translateX.setValue(0);
          });
          return;
        }

        // Swiped far enough left -> Go to tab on the right
        if (hasRightTab && (dx < -80 || vx < -0.4)) {
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            const next = TAB_CONFIG[currentIndex + 1];
            navigation.navigate(next.tab, { screen: next.initialScreen });
            translateX.setValue(0);
          });
          return;
        }

        // Incomplete swipe -> snap back
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      },

      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View style={[styles.container, { transform: [{ translateX }] }]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
