import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { useTranslation } from "@/utils/translations";
import { LazyImage } from "./LazyImage";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

function getActiveRouteName(state: any): string {
  if (!state) return "";
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRouteName(route.state);
  }
  return route.name;
}

const DrawerItem = ({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const activeBg = "rgba(103, 57, 183, 0.06)";
  const inactiveBg = "transparent";

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ marginVertical: 6 }}
    >
      <Animated.View
        style={[
          styles.itemContainer,
          { backgroundColor: active ? activeBg : inactiveBg },
          animatedStyle,
        ]}
      >
        <View style={styles.itemLeftContainer}>
          <Ionicons
            name={icon as any}
            size={20}
            color={active ? "#6739B7" : "#8E8E93"}
          />
          <Text
            style={[
              styles.itemLabel,
              {
                color: active ? "#6739B7" : "#55555B",
                fontWeight: active ? "600" : "500",
              },
            ]}
          >
            {label}
          </Text>
        </View>
        {active && <View style={styles.activeDot} />}
      </Animated.View>
    </Pressable>
  );
};

export default function CustomDrawer(props: any) {
  const { user, logOut } = useAuthStore();
  const { loadThemeFromStorage } = useThemeStore();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  const activeRouteName = getActiveRouteName(props.state);

  const handleLogout = () => {
    Alert.alert(t("logout") || "Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          props.navigation.closeDrawer();
          await logOut();
        },
      },
    ]);
  };

  const getSubscriptionPlan = () => {
    const isSubscribed = user?.latest_subscription && user.latest_subscription.status === "active";
    return isSubscribed ? user?.latest_subscription?.plan?.name || "Premium Member" : "Free Plan";
  };

  const renderSubscriptionBadge = () => {
    const plan = getSubscriptionPlan();
    const isFree = plan === "Free Plan";

    return (
      <View
        style={[
          styles.badgeWrapper,
          isFree ? styles.badgeFree : styles.badgePremium,
        ]}
      >
        <Ionicons
          name={isFree ? "gift" : "sparkles"}
          size={11}
          color={isFree ? "#6B7280" : "#FFFFFF"}
        />
        <Text style={[styles.badgeText, { color: isFree ? "#4B5563" : "#FFFFFF" }]}>
          {plan}
        </Text>
      </View>
    );
  };

  const renderAvatar = () => {
    const avatarUri = user?.Profile_image?.formats?.thumbnail?.url || user?.Profile_image?.url;
    if (avatarUri) {
      return <LazyImage uri={avatarUri} style={styles.avatar} />;
    }
    const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "GF";
    return (
      <LinearGradient colors={["#A78BFA", "#7C3AED"]} style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{initials}</Text>
      </LinearGradient>
    );
  };

  return (
    <LinearGradient colors={["#E7E2F6", "#FFFFFF"]} style={styles.drawerWrapper}>
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => props.navigation.closeDrawer()}
            style={styles.closeButton}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={18} color="#6739B7" />
          </TouchableOpacity>

          <View style={styles.profileSection}>
            {renderAvatar()}
            <Text style={styles.name}>{user?.name || "Artist Name"}</Text>
            <Text style={styles.agencySubtitle} numberOfLines={1}>
              {user?.email || "artist@mozart.com"}
            </Text>
            {renderSubscriptionBadge()}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DrawerItem
            icon="home"
            label="Home"
            active={activeRouteName === "HomeMain"}
            onPress={() =>
              props.navigation.navigate("MainTabs", {
                screen: "HomeTab",
                params: { screen: "HomeMain" },
              })
            }
          />

          <DrawerItem
            icon="people"
            label={t("artists") || "Artists"}
            active={activeRouteName === "Artist"}
            onPress={() =>
              props.navigation.navigate("MainTabs", {
                screen: "HomeTab",
                params: { screen: "Artist" },
              })
            }
          />

          <DrawerItem
            icon="musical-notes"
            label={t("catalogue") || "Catalogue"}
            active={["Draft", "Upload", "NewRelease", "Track", "CalendarEvent"].includes(
              activeRouteName
            )}
            onPress={() =>
              props.navigation.navigate("MainTabs", {
                screen: "MusicTab",
                params: { screen: "NewRelease" },
              })
            }
          />

          <DrawerItem
            icon="wallet"
            label={t("royalties") || "Royalties"}
            active={activeRouteName === "WalletMain"}
            onPress={() =>
              props.navigation.navigate("MainTabs", {
                screen: "WalletTab",
                params: { screen: "WalletMain" },
              })
            }
          />

          <DrawerItem
            icon="help-circle"
            label={t("faqs") || "FAQs"}
            active={activeRouteName === "FAQs"}
            onPress={() =>
              props.navigation.navigate("MainTabs", {
                screen: "HomeTab",
                params: { screen: "FAQs" },
              })
            }
          />

          <DrawerItem
            icon="chatbubble-ellipses"
            label={t("live_chat") || "Live Chat"}
            active={activeRouteName === "LiveChat"}
            onPress={() =>
              props.navigation.navigate("MainTabs", {
                screen: "HomeTab",
                params: { screen: "LiveChat" },
              })
            }
          />

          <DrawerItem
            icon="document-text"
            label="Help & Support"
            active={["Support", "RaiseTicket", "TicketDetails"].includes(activeRouteName)}
            onPress={() =>
              props.navigation.navigate("MainTabs", {
                screen: "HomeTab",
                params: { screen: "Support" },
              })
            }
          />

          <DrawerItem
            icon="person"
            label={t("profile") || "Profile"}
            active={[
              "ProfileMain",
              "ChangePassword",
              "OrderHistory",
              "SavedCards",
              "AddNewCard",
              "PayoutDetails",
              "TermsOfService",
              "PrivacyPolicy",
            ].includes(activeRouteName)}
            onPress={() =>
              props.navigation.navigate("MainTabs", {
                screen: "ProfileTab",
                params: { screen: "ProfileMain" },
              })
            }
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out" size={18} color="#ef4444" />
            <Text style={styles.logoutText}>{t("logout") || "Log Out"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  drawerWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 24,
  },
  profileSection: {
    alignItems: "flex-start",
    width: "100%",
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    fontFamily: "PlusJakartaSans_700Bold",
    marginTop: 14,
  },
  agencySubtitle: {
    fontSize: 12,
    color: "#7E7E86",
    fontFamily: "Poppins_500Medium",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  itemLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemLabel: {
    marginLeft: 14,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#6739B7",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 12,
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  badgeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    gap: 4,
    alignSelf: "flex-start",
  },
  badgePremium: {
    backgroundColor: "#6739B7",
  },
  badgeFree: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
