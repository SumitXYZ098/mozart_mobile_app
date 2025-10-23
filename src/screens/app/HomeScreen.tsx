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
import CounterCardSection from "@/components/screenComponents/homeScreen/CounterCardSection";
import DraftListSection from "@/components/screenComponents/homeScreen/DraftListSection";
import UploadedListSection from "@/components/screenComponents/homeScreen/UploadedListSection";

export default function HomeScreen({ navigation }: any) {
  const { logOut, user } = useAuthStore();

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
              onPress={() => navigation?.navigate("notification")}
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

          <CounterCardSection />

          <DraftListSection navigation={navigation} />

          <UploadedListSection navigation={navigation} />

          {/* <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => logOut()}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity> */}
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
  draftSection: {},
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
