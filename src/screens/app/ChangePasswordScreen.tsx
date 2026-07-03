import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { Alert } from "react-native";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { ENDPOINTS } from "@/api/endpoints";

export default function ChangePasswordScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  // Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  // Visibility States
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Focus States
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setErrorMsg("");


    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        ENDPOINTS.CHANGE_PASSWORD,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (response.data?.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        Alert.alert(
          "Success",
          response.data?.message || "Password changed successfully.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        setErrorMsg(response.data?.message || "Failed to change password.");
      }
    } catch (error: any) {
      console.error("Change password error", error);
      const errMsg = error?.response?.data?.message || error?.response?.data?.error?.message || "An error occurred. Please try again.";
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="shield-checkmark" size={28} color={Colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Secure Your Account</Text>
              <Text style={styles.infoSubtitle}>
                Ensure your new password is secure and not used elsewhere.
              </Text>
            </View>
          </View>

          {/* Error Alert */}
          {errorMsg ? (
            <View style={styles.alertContainerError}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.alertTextError}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.formContainer}>
            {/* Current Password */}
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={[
              styles.inputWrapper,
              focusedField === 'current' && styles.inputWrapperFocused
            ]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={focusedField === 'current' ? Colors.primary : Colors.gray}
                style={styles.inputLeftIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter current password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                // onFocus={() => setFocusedField('current')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeButton}>
                <Ionicons
                  name={showCurrent ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.gray}
                />
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={[
              styles.inputWrapper,
              focusedField === 'new' && styles.inputWrapperFocused
            ]}>
              <Ionicons
                name="key-outline"
                size={20}
                color={focusedField === 'new' ? Colors.primary : Colors.gray}
                style={styles.inputLeftIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter new password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                // onFocus={() => setFocusedField('new')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeButton}>
                <Ionicons
                  name={showNew ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.gray}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm New Password */}
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={[
              styles.inputWrapper,
              focusedField === 'confirm' && styles.inputWrapperFocused
            ]}>
              <Ionicons
                name="checkmark-outline"
                size={20}
                color={focusedField === 'confirm' ? Colors.primary : Colors.gray}
                style={styles.inputLeftIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm new password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                // onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                <Ionicons
                  name={showConfirm ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.gray}
                />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleChangePassword}
              style={styles.submitButton}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
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
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: Colors.lightPrimary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
    gap: 16,
  },
  infoIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.black,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: "Poppins_400Regular",
    lineHeight: 18,
  },
  alertContainerError: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  alertTextError: {
    color: "#B91C1C",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    flex: 1,
  },
  alertContainerSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderColor: "#D1FAE5",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  alertTextSuccess: {
    color: "#065F46",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    flex: 1,
  },
  formContainer: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray,
    fontFamily: "PlusJakartaSans_600SemiBold",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 54,
    backgroundColor: "#F9FAFB",
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: "#FFFFFF",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputLeftIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
    fontFamily: "Poppins_400Regular",
  },
  eyeButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.white,
    fontWeight: "600",
  },
});
