import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../theme/colors";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import { verifyEmailWithOtp } from "../../api/userApi";
import { useCreateUser, useSendEmailVerification } from "../../hooks/useUser";
import { storageAPI } from "../../utils/storage";
import { toast } from "../../stores/useToastStore";
import AuthLayout from "@/components/layout/AuthLayout";

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyEmail">;

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      Animated.timing(fadeAnim, {
        duration: 600,
        useNativeDriver: true,
        toValue: 1,
      }).start();
    }, []);

  const { mutateAsync: createUser, isPending: isRegistering } = useCreateUser();
  const { mutateAsync: sendEmailVerification, isPending: isResending } =
    useSendEmailVerification();

  const handleChangeText = (value: string, index: number) => {
    const updated = [...code];
    updated[index] = value;
    setCode(updated);

    // If typing a digit, auto focus next field
    if (value && index < 4) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // If backspace pressed on an empty digit, clear previous and focus it
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      const updated = [...code];
      updated[index - 1] = "";
      setCode(updated);
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = code.join("");
    if (otpString.length < 5) {
      toast.error("Please enter a valid 5-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      // 1. Verify the email with OTP
      const verifyResp = await verifyEmailWithOtp(email, otpString);

      // Check response status
      if (verifyResp && verifyResp.status === false) {
        toast.error(
          verifyResp.message || "Verification failed. Please check the code.",
        );
        setLoading(false);
        return;
      }

      // 2. Retrieve local signupData
      const signupDataRaw = await storageAPI.getItem("signupData");
      if (!signupDataRaw) {
        toast.error("Signup data not found. Please try signing up again.");
        setLoading(false);
        return;
      }

      const signupData = JSON.parse(signupDataRaw);

      // 3. Create the user on Strapi backend
      const userPayload = {
        username: signupData.email,
        email: signupData.email,
        password: signupData.password,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        phoneNumber: signupData.phoneNumber,
        role: signupData.role || "Client",
      };

      await createUser(userPayload);

      // 4. Cleanup local cache & navigate to Verified screen
      await storageAPI.removeItem("signupData");
      toast.success("Email verified and account registered successfully!");
      navigation.navigate("Verified");
    } catch (err: any) {
      console.error("Email verification error:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Verification failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    try {
      const resp = await sendEmailVerification(email);
      const message =
        resp?.message || "Verification email resent successfully!";
      toast.success(message);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend verification email.";
      toast.error(message);
    }
  };

  const isButtonsDisabled = loading || isRegistering;

  return (
    <AuthLayout withBackground>
      <Animated.View
        style={[styles.container, { opacity: fadeAnim }]}
        className="h-auto"
      >
        <ScrollView contentContainerStyle={styles.inner}>
          <Text style={styles.title}>Verify You Account</Text>
          <Text style={styles.subtitle}>
            Enter the 5-digit code sent to {email}
          </Text>

          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <TextInput
                ref={(ref) => {
                  inputs.current[index] = ref;
                }}
                key={index}
                style={styles.otpInput}
                maxLength={1}
                keyboardType="number-pad"
                onChangeText={(value) => handleChangeText(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                value={digit}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, isButtonsDisabled && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isButtonsDisabled}
          >
            {isButtonsDisabled ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Verify Email</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.resend}>
            Didn't receive the code?{" "}
            <Text
              style={[styles.link, isResending && styles.linkDisabled]}
              onPress={handleResend}
            >
              {isResending ? "Resending..." : "Resend"}
            </Text>
          </Text>
        </ScrollView>
      </Animated.View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: { },
  inner: {
    display: "flex",
    justifyContent: "flex-end",
    paddingVertical: 24,
    paddingHorizontal: 22,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
  },
  subtitle: { color: Colors.gray, textAlign: "center", marginVertical: 10 },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 30,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    width: 45,
    height: 50,
    textAlign: "center",
    fontSize: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.white,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  buttonDisabled: { backgroundColor: Colors.lightGray, opacity: 0.7 },
  resend: { textAlign: "center", marginTop: 15, color: Colors.gray },
  link: { color: Colors.primary, fontWeight: "600" },
  linkDisabled: { color: Colors.gray },
});
