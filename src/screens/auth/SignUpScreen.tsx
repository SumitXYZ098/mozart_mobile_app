import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Divider from "@/components/modules/Divider";
import { Controller, useForm } from "react-hook-form";
import { checkEmailExists } from "@/api/userApi";
import { storageAPI } from "@/utils/storage";
import { toast } from "@/stores/useToastStore";
import { useSendEmailVerification } from "@/hooks/useUser";
import { AuthStackParamList } from "@/navigation/AuthNavigator";
import AuthLayout from "@/components/layout/AuthLayout";
import InputField from "@/components/modules/InputField";
import { useGoogleLogin, useFacebookLogin } from "@/hooks/useAuth";
import GoogleButton from "@/components/modules/GoogleButton";
import FacebookButton from "@/components/modules/FacebookButton";
import { googleAuthService } from "@/services/googleAuth";
import { facebookAuthService } from "@/services/facebookAuth";
import { Colors } from "@/theme/colors";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: string;
};

export default function SignUpScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { mutateAsync: sendEmailVerification, isPending } =
    useSendEmailVerification();
  const [loading, setLoading] = useState(isPending);
  const { mutate: loginWithGoogle, isPending: isGooglePending } = useGoogleLogin();
  const { mutate: loginWithFacebook, isPending: isFacebookPending } = useFacebookLogin();

  const handleGoogleSignup = async () => {
    console.log("Google Sign-Up: Button pressed.");
    try {
      console.log("Google Sign-Up: Triggering native Google Sign-In flow...");
      const idToken = await googleAuthService.signIn();
      console.log("Google Sign-Up: Obtained ID Token successfully. Sending to backend...");
      loginWithGoogle(
        { idToken },
        {
          onSuccess: () => {
            console.log("Google Sign-Up: Backend verification succeeded.");
            toast.success("Signed up with Google successfully");
          },
          onError: (err: any) => {
            console.error("Google Sign-Up: Backend verification failed:", err);
            toast.error(err?.message || "Google Sign Up failed");
          },
        }
      );
    } catch (err: any) {
      console.error("Google Sign-Up: Service error caught:", err);
      if (err.message && !err.message.includes("cancelled")) {
        toast.error(err.message);
      }
    }
  };

  const handleFacebookSignup = async () => {
    console.log("Facebook Sign-Up: Button pressed.");
    try {
      console.log("Facebook Sign-Up: Triggering native Facebook login...");
      const credentials = await facebookAuthService.signIn();
      console.log("Facebook Sign-Up: Obtained Facebook credentials. Sending to backend...");
      loginWithFacebook(
        credentials,
        {
          onSuccess: () => {
            console.log("Facebook Sign-Up: Backend verification succeeded.");
            toast.success("Signed up with Facebook successfully");
          },
          onError: (err: any) => {
            console.error("Facebook Sign-Up: Backend verification failed:", err);
            toast.error(err?.message || "Facebook Sign Up failed");
          },
        }
      );
    } catch (err: any) {
      console.error("Facebook Sign-Up: Service error caught:", err);
      if (err.message && !err.message.includes("cancelled")) {
        toast.error(err.message);
      }
    }
  };

  const isAnyLoading = loading || isGooglePending || isFacebookPending;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      duration: 600,
      useNativeDriver: true,
      toValue: 1,
    }).start();
  }, []);

  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      role: "Client",
    },
    mode: "onBlur",
  });

  const password = watch("password");

  const capitalize = (value: string) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

  const onSubmit = async (data: FormValues) => {
console.log(data, "Form Data");
    try {
      setLoading(true);

      const firstName = capitalize(data.firstName);
      const lastName = capitalize(data.lastName);

      await storageAPI.setItem(
        "signupData",
        JSON.stringify({ ...data, firstName, lastName })
      );
      console.log(data.email, "Email");

      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!baseUrl) {
        console.log(data.email, "Email 2");
        toast.error(
          "API URL not configured. Set EXPO_PUBLIC_API_URL and restart the app."
        );
        return;
      }

      try {
        console.log(data.email, "Email 1");
        const resp = await sendEmailVerification(data.email);
        const message = resp?.message || "Verification email sent";
        toast.success(message);
        navigation.navigate("VerifyEmail", { email: data.email });
      } catch (err: any) {
        const message =
          err?.response?.data?.message || "Failed to send verification email";
        toast.error(message);
      }
    } catch (error: any) {
      toast.error(error && "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
      <AuthLayout withBackground>
        <Animated.View
          style={[styles.container, { opacity: fadeAnim }]}
          className="h-auto"
        >
          <ScrollView contentContainerStyle={styles.inner}>
            <Text style={styles.title}>Create Your Account With Us Below</Text>
            <View className="flex flex-row flex-shrink justify-between items-start gap-x-3">
              {/* First Name Field */}
              <Controller
                control={control}
                name="firstName"
                rules={{
                  required: "First name is required",
                  pattern: {
                    value: /^[a-zA-Z.\s]+$/,
                    message: "Invalid first name",
                  },
                  validate: (value: any) =>
                    /^[A-Z]/.test(value) || "First letter must be capital",
                }}
                render={({ field, fieldState }) => (
                <InputField
                  placeholder="Enter first name"
                  label="First Name"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  keyboardType="default"
                  error={fieldState.error?.message}
                  style={{}}
                  autoComplete="name"
                  textContentType="givenName"
                />
              )}
            />

            {/* Last Name Field */}
            <Controller
              control={control}
              name="lastName"
              rules={{
                required: "Last name is required",
                pattern: {
                  value: /^[a-zA-Z.\s]+$/,
                  message: "Invalid last name",
                },
              }}
              render={({ field, fieldState }) => (
                <InputField
                  placeholder="Enter last name"
                  label="Last Name"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  keyboardType="default"
                  error={fieldState.error?.message}
                  style={{}}
                  autoComplete="name"
                  textContentType="familyName"
                />
              )}
            />
          </View>

          {/* Email Field */}
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
              validate: async (value: string) => {
                try {
                  const exists = await checkEmailExists(
                    value.toLocaleLowerCase()
                  );
                  return exists?.exists ? "Email already exists" : true;
                } catch (e) {
                  return true;
                }
              },
            }}
            render={({ field, fieldState }) => (
              <InputField
                placeholder="Enter your email"
                label="Email"
                type="email"
                value={field.value}
                onChangeText={(text) => field.onChange(text.toLowerCase())}
                onBlur={field.onBlur}
                keyboardType="email-address"
                error={fieldState.error?.message}
                autoComplete="email"
                textContentType="emailAddress"
              />
            )}
          />

          {/*Phone Number Field */}
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field, fieldState }) => (
              <InputField
                placeholder="Enter your phone number"
                label="Phone number"
                type="number"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="number-pad"
                error={fieldState.error?.message}
                autoComplete="tel"
                textContentType="telephoneNumber"
              />
            )}
          />

          {/* Password Field */}
          <Controller
            control={control}
            name="password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            render={({ field, fieldState }) => (
              <InputField
                placeholder="Enter your password"
                label="Password"
                type="password"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                autoComplete="password"
                textContentType="password"
              />
            )}
          />

          {/* Confirm Password Field */}
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            }}
            render={({ field, fieldState }) => (
              <InputField
                placeholder="Enter your confirm password"
                label="Confirm Password"
                type="password"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                autoComplete="password"
                textContentType="password"
              />
              )}
            />
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              style={[styles.button, isAnyLoading && styles.buttonDisabled]}
              disabled={isAnyLoading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Please wait..." : "Sign Up"}
              </Text>
            </TouchableOpacity>
            <Divider label="or" />
            <View style={{ width: "100%", gap: 12, marginBottom: 16 }}>
              <GoogleButton
                onPress={handleGoogleSignup}
                isLoading={isGooglePending}
                disabled={isAnyLoading}
              />
              <FacebookButton
                onPress={handleFacebookSignup}
                isLoading={isFacebookPending}
                disabled={isAnyLoading}
              />
            </View>

            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.signupText}> Login</Text>
              </TouchableOpacity>
            </View>

            {/* Terms link */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
              <TouchableOpacity onPress={() => navigation.navigate("TermsOfService", { fromSignUp: true })}>
                <Text style={[styles.linkText, { textDecorationLine: "underline" }]}>
                  View Terms of Service & Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {},
  inner: {
    display: "flex",
    justifyContent: "flex-end",
    paddingVertical: 20,
    paddingHorizontal: 28,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 12,
    color: Colors.black,
    textAlign: "center",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.black,
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "Poppins_400Regular",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 32,
  },
  buttonDisabled: {
    backgroundColor: Colors.lightGray,
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  linkText: {
    color: Colors.primary,
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  signupText: { color: Colors.primary, fontWeight: "600" },
  loginText: {
    color: Colors.black,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
});
