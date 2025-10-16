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
import InputField from "../components/InputField";
import { Colors } from "../theme/colors";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../navigation/AuthNavigator";
import AuthLayout from "@/components/AuthLayout";
import KeyboardWrapper from "@/components/KeyboardWrapper";
import Checkbox from "@/components/Checkbox";
import Divider from "@/components/Divider";
import { Controller, useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useAuth";
import { toast } from "@/stores/useToastStore";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

type FormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function LoginScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { mutate: login, isPending } = useLogin();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      duration: 600,
      useNativeDriver: true,
      toValue: 1,
    }).start();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormValues) => {
    login(
      {
        identifier: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      },
      {
        onSuccess: () => {
          toast.success("Logged in successfully");
          console.log("Form submitted:successfull", data);
          
        },
        onError: (err: unknown) => {
          console.log("Form submitted:err", data);
          const message = err instanceof Error ? "Invalid username and password !" : "Login failed";
          toast.error(message);
        },
      }
    );
  };
  return (
    <KeyboardWrapper scrollable>
      <AuthLayout withBackground>
        <Animated.View
          style={[styles.container, { opacity: fadeAnim }]}
          className="h-auto"
        >
          <ScrollView contentContainerStyle={styles.inner}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Sign up to enjoy the feature of Revolutie
            </Text>

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
              }}
              render={({ field, fieldState }) => (
                <InputField
                  placeholder="Enter your email"
                  label="Email"
                  type="email"
                  value={field.value.toLowerCase()}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  keyboardType="email-address"
                  error={fieldState.error?.message}
                />
              )}
            />

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
            <View className="flex flex-row justify-between items-center mb-5">
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Keep me logged in"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Text style={styles.linkText}>Forgot password</Text>
            </View>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <Divider label="or" />
            <View className=" flex-1 flex-row items-center gap-x-4 mb-[10px]">
              <TouchableOpacity className="py-3 bg-[#F3F3F3] flex-grow flex flex-row rounded-3xl justify-center items-center">
                <Text style={styles.loginText}>Login with</Text>
                <Image
                  source={require("../../assets/google.png")}
                  className="w-6 h-6"
                />
              </TouchableOpacity>
              <TouchableOpacity className="py-3 bg-[#F3F3F3] flex-grow flex-row rounded-3xl justify-center items-center ">
                <Text style={styles.loginText}>Login with</Text>
                <Image
                  source={require("../../assets/apple.png")}
                  className="w-6 h-6"
                />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text>Need an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                <Text style={styles.signupText}> Create one</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </AuthLayout>
    </KeyboardWrapper>
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
