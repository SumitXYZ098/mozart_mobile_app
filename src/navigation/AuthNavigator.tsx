import LoginScreen from "@/screens/auth/LoginScreen";
import OnboardingScreen from "@/screens/auth/OnboardingScreen";
import SignUpScreen from "@/screens/auth/SignUpScreen";
import SplashScreen from "@/screens/SplashScreen";
import VerifiedScreen from "@/screens/auth/VerifiedScreen";
import VerifyEmailScreen from "@/screens/auth/VerifyEmailScreen";
 
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPasswordScreen from "@/screens/auth/ForgotPasswordScreen";
import SetNewPasswordScreen from "@/screens/auth/SetNewPasswordScreen";
 import ResetPasswordScreen from "@/screens/auth/ResetPasswordScreen";

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ForgotPasswordSuccess: undefined;
  ResetPassword: { email: string };
  SetNewPassword: { email: string; otp: string };
  VerifyEmail: { email: string };
  Verified: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator({ initialRoute = "Onboarding" }: { initialRoute?: keyof AuthStackParamList }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="Verified" component={VerifiedScreen} />
    </Stack.Navigator>
  );
}
