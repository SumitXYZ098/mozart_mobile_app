import LoginScreen from '@/screens/LoginScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import SignUpScreen from '@/screens/SignUpScreen';
import SplashScreen from '@/screens/SplashScreen';
import VerifiedScreen from '@/screens/VerifiedScreen';
import VerifyEmailScreen from '@/screens/VerifyEmailScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  VerifyEmail: undefined;
  Verified: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="Verified" component={VerifiedScreen} />
    </Stack.Navigator>
  );
}
