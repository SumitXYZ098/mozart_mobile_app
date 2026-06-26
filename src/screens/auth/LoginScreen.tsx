import React, { useRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Image, ActivityIndicator, Alert } from "react-native";
import { Colors } from "../../theme/colors";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Checkbox from "@/components/modules/Checkbox";
import Divider from "@/components/modules/Divider";
import { Controller, useForm } from "react-hook-form";
import { useLogin, useGoogleLogin, useFacebookLogin } from "@/hooks/useAuth";
import GoogleButton from "@/components/modules/GoogleButton";
import FacebookButton from "@/components/modules/FacebookButton";
import { googleAuthService } from "@/services/googleAuth";
import { facebookAuthService } from "@/services/facebookAuth";
import { toast } from "@/stores/useToastStore";
import { AuthStackParamList } from "@/navigation/AuthNavigator";
import AuthLayout from "@/components/layout/AuthLayout";
import InputField from "@/components/modules/InputField";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

type FormValues = {
  identifier: string;
  password: string;
  rememberMe: boolean;
};

export default function LoginScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { mutate: login, isPending } = useLogin();
  const { mutate: loginWithGoogle, isPending: isGooglePending } = useGoogleLogin();
  const { mutate: loginWithFacebook, isPending: isFacebookPending } = useFacebookLogin();

  const handleGoogleLogin = async () => {
    console.log("Google Login: Button pressed.");
    try {
      console.log("Google Login: Triggering native Google Sign-In flow...");
      const idToken = await googleAuthService.signIn();
      console.log("Google Login: Obtained ID Token successfully. Sending to backend...");
      loginWithGoogle(
        { idToken },
        {
          onSuccess: () => {
            console.log("Google Login: Backend verification succeeded.");
            toast.success("Logged in with Google successfully");
          },
          onError: (err: any) => {
            console.error("Google Login: Backend verification failed:", err);
            Alert.alert("Google Backend Error", err?.message || JSON.stringify(err) || "Verification failed");
            toast.error(err?.message || "Google Login failed");
          },
        }
      );
    } catch (err: any) {
      console.error("Google Login: Service error caught:", err);
      if (err.message && !err.message.includes("cancelled")) {
        Alert.alert("Google Native Error", err?.message || err || "Native flow error");
        toast.error(err.message);
      }
    }
  };

  const handleFacebookLogin = async () => {
    console.log("Facebook Login: Button pressed.");
    try {
      console.log("Facebook Login: Triggering native Facebook login...");
      const credentials = await facebookAuthService.signIn();
      console.log("Facebook Login: Obtained Facebook credentials. Sending to backend...");
      loginWithFacebook(
        credentials,
        {
          onSuccess: () => {
            console.log("Facebook Login: Backend verification succeeded.");
            toast.success("Logged in with Facebook successfully");
          },
          onError: (err: any) => {
            console.error("Facebook Login: Backend verification failed:", err);
            toast.error(err?.message || "Facebook Login failed");
          },
        }
      );
    } catch (err: any) {
      console.error("Facebook Login: Service error caught:", err);
      if (err.message && !err.message.includes("cancelled")) {
        toast.error(err.message);
      }
    }
  };

  const isAnyLoading = isPending || isGooglePending || isFacebookPending;

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
      identifier: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });

 const onSubmit = (data: FormValues) => {
  login(
    {
      identifier: data.identifier,
      password: data.password,
      rememberMe: data.rememberMe,
    },
    {
      onSuccess: () => {
        toast.success("Logged in successfully");
        console.log(
          "Form submitted:successfull",
          data
        );
      },

      onError: (err: unknown) => {
        console.log("LOGIN ERROR:", err);

        const message =
          err instanceof Error
            ? err.message
            : "Login failed";

        toast.error(message);
      },
    }
  );
};
  return (
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
              name="identifier"
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
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}><Text style={styles.linkText}>Forgot password</Text></TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              style={[styles.button, isAnyLoading && styles.buttonDisabled]}
              disabled={isAnyLoading}
            >
              {isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            <Divider label="or" />
            <View style={{ width: "100%", gap: 12, marginBottom: 16 }}>
              <GoogleButton
                onPress={handleGoogleLogin}
                isLoading={isGooglePending}
                disabled={isAnyLoading}
              />
              <FacebookButton
                onPress={handleFacebookLogin}
                isLoading={isFacebookPending}
                disabled={isAnyLoading}
              />
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
  );
}

const styles = StyleSheet.create({
  container: {},
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
  button: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 32 },
  buttonDisabled: { backgroundColor: Colors.lightGray, opacity: 0.7 },
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
