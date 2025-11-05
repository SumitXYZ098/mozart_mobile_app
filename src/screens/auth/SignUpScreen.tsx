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
    mode: "onChange",
  });

  const password = watch("password");

  const capitalize = (value: string) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

  const onSubmit = async (data: FormValues) => {
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
        navigation.navigate("VerifyEmail");
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
                  value={field.value.toLocaleLowerCase()}
                  onChangeText={field.onChange}
                  keyboardType="email-address"
                  error={fieldState.error?.message}
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
                />
              )}
            />
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {loading ? "Please wait..." : "Sign Up"}
              </Text>
            </TouchableOpacity>
            <Divider label="or" />
            <View className=" flex-1 flex-row items-center gap-x-4 mb-[10px]">
              <TouchableOpacity className="py-3 bg-[#F3F3F3] flex-grow flex flex-row rounded-3xl justify-center items-center">
                <Text style={styles.loginText}>Sign Up with</Text>
                <Image
                  source={require("../../../assets/images/google.png")}
                  className="w-6 h-6"
                />
              </TouchableOpacity>
              <TouchableOpacity className="py-3 bg-[#F3F3F3] flex-grow flex-row rounded-3xl justify-center items-center ">
                <Text style={styles.loginText}>Sign Up with</Text>
                <Image
                  source={require("../../../assets/images/apple.png")}
                  className="w-6 h-6"
                />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.signupText}> Login</Text>
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
    paddingVertical: 24,
    paddingHorizontal: 48,
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
