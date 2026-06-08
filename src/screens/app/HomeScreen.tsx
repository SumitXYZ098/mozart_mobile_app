import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
import { ENDPOINTS } from "@/api/endpoints";
import CounterCardSection from "@/components/screenComponents/homeScreen/CounterCardSection";
import DraftListSection from "@/components/screenComponents/homeScreen/DraftListSection";
import UploadedListSection from "@/components/screenComponents/homeScreen/UploadedListSection";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "@/utils/translations";

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [notificationCount, setNotificationCount] = React.useState<number>(0);

  const fetchNotifications = React.useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await axios.get(ENDPOINTS.NOTIFICATIONS, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const responseData = response.data;
      const list = Array.isArray(responseData)
        ? responseData
        : (responseData && Array.isArray(responseData.data) ? responseData.data : []);

      const unreadList = list.filter((item: any) => {
        const attrs = item.attributes || {};
        const isRead = !!(
          attrs.read || item.read ||
          attrs.is_read || item.is_read ||
          attrs.isRead || item.isRead ||
          attrs.status === 'read' || item.status === 'read'
        );
        return !isRead;
      });
      setNotificationCount(unreadList.length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      setNotificationCount(0);
    }
  }, [user?.token]);

  React.useEffect(() => {
    if (isFocused) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isFocused, fetchNotifications]);


  return (
    <LinearGradient
      colors={["#EDE5F7", "#FFFFFF"]}
      locations={[0.4044, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                navigation.openDrawer();
              }}
              style={styles.topButton}
            >
              <Image
                source={require("../../../assets/images/hamburger.png")}
                resizeMode="contain"
                style={styles.menuIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => navigation.navigate("Notification")}
                style={styles.topButton}
              >
                <View style={styles.notificationWrapper}>
                  <Image
                    source={require("../../../assets/images/notification.png")}
                    resizeMode="contain"
                    style={styles.menuIcon}
                  />
                  {notificationCount > 0 && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{notificationCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{`${t("good_morning")}, ${user?.name}`}</Text>
            <Text style={styles.subtitle}>{t("welcome_to_mozart")}</Text>
          </View>

          <View style={styles.newRelease}>
            <View className="w-[64px] h-[64px] rounded-full bg-white opacity-[0.1] absolute -left-6 -bottom-[42px] z-10" />
            <View className="w-[64px] h-[64px] rounded-full bg-white opacity-[0.1] absolute -left-9 -bottom-[35px] z-10" />
            <View className="flex flex-row justify-between items-center">
              <View className="flex flex-col">
                <Text style={styles.releaseTitle}>{t("new_release")}</Text>
                <Text style={styles.releaseSubTitle}>
                  {t("new_release_desc")}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.topButton}
                onPress={() =>
                  navigation.navigate("MusicTab", {
                    screen: "NewRelease",
                    params: { step: 0 },
                  })
                }
              >
                <MaterialIcons name="add" color={Colors.primary} size={24} />
              </TouchableOpacity>
            </View>
            <View className="w-[64px] h-[64px] rounded-full bg-white opacity-[0.1] absolute -right-[35px] -top-[35px] z-10" />
            <View className="w-[64px] h-[64px] rounded-full bg-white opacity-[0.1] absolute -right-6 -top-[42px] z-10" />
          </View>
          <CounterCardSection />
          <DraftListSection />
          <UploadedListSection />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  topButton: {
    backgroundColor: Colors.white,
    borderRadius: 6,
    padding: 6,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 6,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: "Poppins_400Regular",
    opacity: 0.9,
  },
  notificationWrapper: {
    position: "relative",
  },
  badgeContainer: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "#f03939ff",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  newRelease: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    position: "relative",
  },
  releaseTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.white,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  releaseSubTitle: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: "Poppins_400Regular",
    opacity: 0.7,
  },
});
