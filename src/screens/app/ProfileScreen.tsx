import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCountryStore } from "@/stores/useCountryStore";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { useTranslation } from "@/utils/translations";
import { useNavigation } from "@react-navigation/native";
import { LazyImage } from "@/components/modules/LazyImage";
import Creator from "../../../assets/images/creator.png";
import CustomButton from "@/components/common/CustomButton";
import { ScrollView } from "react-native-gesture-handler";

const LANGUAGES_BY_COUNTRY = {
  IN: [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা" },
    { code: "mr", name: "Marathi", nativeName: "मराठी" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
    { code: "ml", name: "Malayalam", nativeName: "മലയാളம்" },
  ],
  CA: [
    { code: "en", name: "English", nativeName: "English" },
    { code: "fr", name: "French", nativeName: "Français" },
  ],
  US: [
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español" },
  ],
};

export default function ProfileScreen() {
  const { logOut, user } = useAuthStore();
  const country = useCountryStore((state) => state.country);
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const countryKey = (country === "IN" || country === "CA" || country === "US") ? country : "US";
  const availableLanguages = LANGUAGES_BY_COUNTRY[countryKey];

  const menuList = [
    {
      title: t("my_profile"),
      icon: require("../../../assets/images/profile-fill.png"),
      onPress: () => { },
    },
    {
      title: t("language"),
      icon: require("../../../assets/images/language.png"),
      value: language,
      onPress: () => setLangModalVisible(true),
    },
    {
      title: t("change_password"),
      icon: require("../../../assets/images/reset-password.png"),
      onPress: () => {
        navigation.navigate("ChangePassword");
      },
    },
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
        <Text style={styles.title}>{t("settings_title")}</Text>
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
            {user?.latest_subscription?.plan?.name || t("no_active_plan")}
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
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {menuItem.value && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Poppins_400Regular",
                        color: Colors.gray,
                      }}
                    >
                      {menuItem.value}
                    </Text>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <CustomButton
          buttonType="disable"
          label={t("logout")}
          icon={<MaterialIcons name="logout" size={20} color={Colors.gray} />}
          onPress={logOut}
        />
      </View>

      {/* 🌐 Language Selection Modal/Bottom Sheet */}
      <Modal visible={langModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bsHeader}>
              <View>
                <Text style={styles.bsTitle}>{t("language")}</Text>
                <Text style={styles.bsSubtitle}>Available languages for your region ({countryKey})</Text>
              </View>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
              {availableLanguages.map((item) => {
                const isSelected = language === item.name;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={styles.langItemRow}
                    onPress={async () => {
                      await setLanguage(item.name);
                      setLangModalVisible(false);
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={styles.langPrefixContainer}>
                        <Text style={styles.langPrefixText}>
                          {item.code.toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.langNameText}>{item.name}</Text>
                        <Text style={styles.langNativeText}>{item.nativeName}</Text>
                      </View>
                    </View>
                    <MaterialIcons
                      name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
                      size={22}
                      color={isSelected ? Colors.primary : "#D1D1D6"}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomSheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: "60%",
  },
  bsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  bsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  bsSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },
  langItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  langPrefixContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.lightPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  langPrefixText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.primary,
  },
  langNameText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
    fontFamily: "Poppins_500Medium",
  },
  langNativeText: {
    fontSize: 11,
    color: "#AEAEB2",
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
  },
});
