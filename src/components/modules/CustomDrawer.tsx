import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useAuthStore } from "@/stores/useAuthStore";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import Artist from "../../../assets/images/artists.png";
import Catalogue from "../../../assets/images/catalogue.png";
import Chat from "../../../assets/images/chat.png";
import Contacts from "../../../assets/images/contacts.png";
import FAQs from "../../../assets/images/faqs.png";
import Royalties from "../../../assets/images/royalties.png";
import { LinearGradient } from "expo-linear-gradient";
import { Controller, useForm } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "@/utils/translations";
import BaseBottomSheet, { BaseBottomSheetRef } from "./baseBottomSheet/BaseBottomSheet";
import {
  deleteUploadFileById,
  getUploadFileById,
  uploadFile,
} from "@/api/uploadApi";
import { createIssue } from "@/api/issuesRaised";
import { LazyImage } from "./LazyImage";

export default function CustomDrawer(props: any) {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => props.navigation.closeDrawer()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.profileContainor}>
          <LazyImage
            uri={user?.Profile_image?.formats?.thumbnail?.url || user?.Profile_image?.url || ""}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name || "Artist"}</Text>
        </View>
      </View>
      <LinearGradient
        colors={["rgba(17,17,17,0)", "rgba(180,186,197,1)", "rgba(17,17,17,0)"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          width: "100%",
          height: 1,
          marginVertical: 8,
        }}
      />
      {/* Drawer Items */}
      {/* Artists */}
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          props.navigation.navigate("MainTabs", {
            screen: "HomeTab",

            params: { screen: "Artist" },
          })
        }
      >
        <Image
          source={Artist}
          style={{
            width: 20,

            height: 20,
          }}
        />
        <Text style={styles.itemText}>{t("artists")}</Text>
      </TouchableOpacity>
      {/* Catalogue */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          props.navigation.closeDrawer();
          props.navigation.navigate("MainTabs", {
            screen: "MusicTab",
            params: { screen: "NewRelease" },
          });
        }}
      >
        <Image
          source={Catalogue}
          style={{
            width: 20,

            height: 20,
          }}
        />
        <Text style={styles.itemText}>{t("catalogue")}</Text>
      </TouchableOpacity>
      {/* Royalties */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          props.navigation.closeDrawer();
          props.navigation.navigate("MainTabs", {
            screen: "WalletTab",
          });
        }}
      >
        <Image
          source={Royalties}
          style={{
            width: 20,

            height: 20,
          }}
        />
        <Text style={styles.itemText}>{t("royalties")}</Text>
      </TouchableOpacity>
      {/* FAQs */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          props.navigation.closeDrawer();
          props.navigation.navigate("MainTabs", {
            screen: "HomeTab",
            params: { screen: "FAQs" },
          });
        }}
      >
        <Image
          source={FAQs}
          style={{
            width: 20,

            height: 20,
          }}
        />
        <Text style={styles.itemText}>{t("faqs")}</Text>
      </TouchableOpacity>
      {/* Live Chat */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          props.navigation.closeDrawer();
          props.navigation.navigate("MainTabs", {
            screen: "HomeTab",
            params: { screen: "LiveChat" },
          });
        }}
      >
        <Image
          source={Chat}
          style={{
            width: 20,

            height: 20,
          }}
        />
        <Text style={styles.itemText}>{t("live_chat")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          props.navigation.closeDrawer();
          props.navigation.navigate("MainTabs", {
            screen: "HomeTab",
            params: { screen: "Support" },
          });
        }}
      >
        <Image
          source={Contacts}
          style={{
            width: 20,
            height: 20,
          }}
        />
        <Text style={styles.itemText}>{t("contact_form")}</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    backgroundColor: "#ecdefdff", // Soft lavender/light purple background
  },
  header: {
    alignItems: "flex-start",
    paddingTop: 4,
    paddingLeft: 12,
    gap: 20,
  },
  backButton: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 8,
  },
  profileContainor: {
    gap: 10,
    justifyContent: "flex-start",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 26,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 8,
  },
  itemText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.lightBlack,
    fontFamily: "Poppins_400Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  label: {
    color: Colors.gray,
    marginBottom: 6,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
  },
  clearButton: {
    borderWidth: 1,
    borderColor: Colors.error,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  clearText: {
    color: Colors.error,
    fontWeight: "600",
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    marginHorizontal: 5,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBorder: {
    borderColor: "#7C3AED",
    backgroundColor: "#F5F3FF",
  },
  inactiveBorder: {
    borderColor: "#B3B3B3",
  },
  inner: {
    alignItems: "center",
  },
  text: {
    color: "#0F0F0F",
    fontSize: 14,
    textAlign: "center",
  },
  highlight: {
    color: "#7C3AED",
    fontWeight: "600",
  },
  subText: {
    marginTop: 4,
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  fileName: {
    marginTop: 6,
    color: "#22C55E",
    fontSize: 12,
  },
  preview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginTop: 8,
  },
  uploading: { alignItems: "center", justifyContent: "center" },
  progressText: { fontSize: 13, color: Colors.primary, marginTop: 8 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  pickerSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "Poppins_400Regular",
  },
});
