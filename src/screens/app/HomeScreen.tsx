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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const { logOut, user } = useAuthStore();

  const bottomSheetActions = [
    {
      id: "settings",
      title: "Settings",
      subtitle: "Manage your preferences",
      icon: "settings-outline",
      color: Colors.primary,
      onPress: () => console.log("Settings"),
    },
    {
      id: "profile",
      title: "Profile",
      subtitle: "View and edit your profile",
      icon: "person-outline",
      color: "#10B981",
      onPress: () => console.log("Profile"),
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Manage your notifications",
      icon: "notifications-outline",
      color: "#F59E0B",
      onPress: () => console.log("Notifications"),
    },
  ];

  const cardData = [
    {
      id: "withdraw",
      title: "₹100K",
      subTitle: "Available to withdraw",
      imgSrc: require("../../../assets/images/wallet-with-dollar.png"),
    },
    {
      id: "artists",
      title: "12",
      subTitle: "Total Artists",
      imgSrc: require("../../../assets/images/3d-multimedia-record.png"),
    },
  ];

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
              onPress={() => console.log("Menu")}
              style={styles.topButton}
            >
              <Image
                source={require("../../../assets/images/hamburger.png")}
                resizeMode="contain"
                style={styles.menuIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => console.log("Menu")}
              style={styles.topButton}
            >
              <Image
                source={require("../../../assets/images/notification.png")}
                resizeMode="contain"
                style={styles.menuIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{`Good Morning, ${user?.name}`}</Text>
            <Text style={styles.subtitle}>Welcome to Mozart! 🎶</Text>
          </View>

          <View style={styles.newRelease}>
            <View className="w-[64px] h-[64px] rounded-full bg-white opacity-[0.1] absolute -left-6 -bottom-[42px] z-10" />
            <View className="w-[64px] h-[64px] rounded-full bg-white opacity-[0.1] absolute -left-9 -bottom-[35px] z-10" />
            <View className="flex flex-row justify-between items-center">
              <View className="flex flex-col">
                <Text style={styles.releaseTitle}>New Release</Text>
                <Text style={styles.releaseSubTitle}>
                  Start a new single, EP, or album
                </Text>
              </View>
              <TouchableOpacity style={styles.topButton}>
                <MaterialIcons name="add" color={Colors.primary} size={24} />
              </TouchableOpacity>
            </View>
            <View className="w-[64px] h-[64px] rounded-full bg-white opacity-[0.1] absolute -right-[35px] -top-[35px] z-10" />
            <View className="w-[64px] h-[64px] rounded-full bg-white opacity-[0.1] absolute -right-6 -top-[42px] z-10" />
          </View>

          <View style={styles.section}>
            {cardData.map((card) => (
              <View key={card.id} style={styles.card}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubTitle}>{card.subTitle}</Text>
                <Image
                  source={card.imgSrc}
                  style={styles.cardImg}
                  resizeMode="contain"
                />
                <View className="absolute z-10 w-[96px] h-[96px] bg-primary opacity-20 rounded-full -bottom-[30px] -right-[30px]" />
              </View>
            ))}
          </View>

          <View style={styles.draftSection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <Ionicons name="musical-notes" size={24} color={Colors.primary} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>No recent activity</Text>
                <Text style={styles.activitySubtitle}>
                  Start exploring music to see your activity here
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => logOut()}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
    flex: 1,
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
  section: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 15,
    marginBottom: 32,
  },
  card: {
    marginBottom: 20,
    position: "relative",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    width: "48%",
    height: 121,
    boxShadow: "0 0 16px 0 rgba(17, 17, 17, 0.08)",
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_800Bold",
  },
  cardSubTitle: {
    fontSize: 10,
    color: Colors.gray,
    fontFamily: "Poppins_400Regular",
    width: "60%",
  },
  cardImg: {
    width: 68,
    height: 68,
    zIndex: 20,
    position: "absolute",
    right: 10,
    bottom: 10,
  },
  draftSection:{

  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: "Poppins_400Regular",
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightGray + "30",
    borderRadius: 12,
    padding: 16,
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  activitySubtitle: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: "Poppins_400Regular",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.error + "10",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.error + "30",
  },
  logoutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
