import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigation } from "@react-navigation/native";
import { LazyImage } from "@/components/modules/LazyImage";
import Creator from "../../../assets/images/creator.png";
import CustomButton from "@/components/common/CustomButton";
import { ScrollView } from "react-native-gesture-handler";

export default function ProfileScreen() {
  const { logOut, user } = useAuthStore();
  const navigation = useNavigation<any>();

  const menuList = [
    {
      title: "My Profile",
      icon: require("../../../assets/images/profile-fill.png"),
      onPress: () => { },
    },
    // {
    //   title: "Manage Plan",
    //   icon: require("../../../assets/images/royalties.png"),
    //   onPress: () => {
    //     navigation.navigate("ChoosePlan");
    //   },
    // },
    // {
    //   title: "Refer a friend",
    //   icon: require("../../../assets/images/follow-us.png"),
    //   onPress: () => { },
    // },
    // {
    //   title: "Preks",
    //   icon: require("../../../assets/images/prek.png"),
    //   onPress: () => { },
    // },
    {
      title: "Language",
      icon: require("../../../assets/images/language.png"),
      onPress: () => { },
    },
    {
      title: "Change Password",
      icon: require("../../../assets/images/reset-password.png"),
      onPress: () => {
        navigation.navigate("ChangePassword");
      },
    },
    // {
    //   title: "Theme",
    //   icon: require("../../../assets/images/theme.png"),
    //   onPress: () => { },
    // },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("HomeTab")}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder}></View>
      </View>
      {user && (
        <View style={styles.profileSection}>
          <LazyImage
            uri={`${user?.Profile_image?.formats?.small?.url}`}
            style={{ width: 125, height: 125, borderRadius: 125 }}
          />
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontWeight: "700",
                fontFamily: "PlusJakartaSans_700Bold",
                fontSize: 18,
              }}
            >
              {user?.name}
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: 14,
                color: Colors.gray,
              }}
            >
              {user?.email}
            </Text>
          </View>
        </View>
      )}
      <View
        style={{
          paddingHorizontal: 24,
        }}
      >
        <ImageBackground
          source={Creator}
          style={{
            width: "auto",
            height: "auto",
            padding: 16,
            gap: 6,
          }}
          imageStyle={{
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              fontFamily: "PlusJakartaSans_700Bold",
              fontSize: 20,
              color: Colors.white,
            }}
          >
            {user?.latest_subscription?.plan?.name || "No Active Plan"}
          </Text>
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: 12,
              color: Colors.white,
              opacity: 0.9,
              lineHeight: 18,
            }}
          >
            {user?.latest_subscription?.plan?.name === "Artist"
              ? "You're building momentum with 15 track uploads/year, basic royalty tracking, and distribution."
              : user?.latest_subscription?.plan?.name === "Artist Plus"
                ? "You're getting unlimited uploads, advanced analytics, and collaborator royalty splits."
                : user?.latest_subscription?.plan?.name === "Pro Label"
                  ? "You're getting priority distribution, custom label branding, and team management."
                  : "Please pick a subscription plan to start releasing your music to the world."}
          </Text>
        </ImageBackground>
      </View>
      <View style={styles.menuSection}>
        <ScrollView style={{ gap: 20 }}>
          <View style={{ gap: 16 }}>
            {menuList.map((menuItem, index) => (
              <TouchableOpacity
                key={index}
                onPress={menuItem.onPress}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      backgroundColor: Colors.lightPrimary,
                      borderRadius: 8,
                      padding: 9,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={menuItem.icon}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Poppins_400Regular",
                      color: Colors.black,
                    }}
                  >
                    {menuItem.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <CustomButton
          buttonType="disable"
          label="Logout"
          icon={<MaterialIcons name="logout" size={20} color={Colors.gray} />}
          onPress={logOut}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.gray,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  placeholder: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
    width: "10%",
  },
  profileSection: {
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  menuSection: {
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 18,
    flex: 1,
    gap: 20,
  },
});
