import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NotificationScreen from "@/screens/app/NotificationScreen";
import DraftScreen from "@/screens/app/DraftScreen";
import HomeScreen from "@/screens/app/HomeScreen";
import AnalyticsScreen from "@/screens/app/AnalyticsScreen";
import WalletScreen from "@/screens/app/WalletScreen";
import ProfileScreen from "@/screens/app/ProfileScreen";
import CalendarEventScreen from "@/screens/app/CalendarEventScreen";
import MyTrackScreen from "@/screens/app/MyTrackScreen";
import MyReleaseScreen from "@/screens/app/MyReleaseScreen";
import NewReleaseScreen from "@/screens/app/NewReleaseScreen";
import ArtistScreen from "@/screens/app/ArtistScreen";
import ChangePasswordScreen from "@/screens/app/ChangePasswordScreen";
import OrderHistoryScreen from "@/screens/app/OrderHistoryScreen";
import SavedCardsScreen from "@/screens/app/SavedCardsScreen";
import AddNewCardScreen from "@/screens/app/AddNewCardScreen";
import PayoutDetailsScreen from "@/screens/app/PayoutDetailsScreen";
import PayoutBankAccountsScreen from "@/screens/app/PayoutBankAccountsScreen";
import PayoutHistoryScreen from "@/screens/app/PayoutHistoryScreen";
import TermsOfServiceScreen from "@/screens/auth/TermsOfServiceScreen";
import PrivacyPolicyScreen from "@/screens/auth/PrivacyPolicyScreen";
import FAQsScreen from "@/screens/app/FAQsScreen";
import LiveChatScreen from "@/screens/app/LiveChatScreen";
import SupportScreen from "@/screens/app/SupportScreen";
import TicketDetailsScreen from "@/screens/app/TicketDetailsScreen";
import RaiseTicketScreen from "@/screens/app/RaiseTicketScreen";
 

const Stack = createNativeStackNavigator();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Artist" component={ArtistScreen} />
      <Stack.Screen name="FAQs" component={FAQsScreen} />
      <Stack.Screen name="LiveChat" component={LiveChatScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
      <Stack.Screen name="RaiseTicket" component={RaiseTicketScreen} />
    </Stack.Navigator>
  );
}

export function AnalyticsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AnalyticsMain" component={AnalyticsScreen} />
    </Stack.Navigator>
  );
}

export function WalletStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalletMain" component={WalletScreen} />
      <Stack.Screen name="PayoutHistory" component={PayoutHistoryScreen} />
    </Stack.Navigator>
  );
}

export function MusicStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Draft"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Draft" component={DraftScreen} />
      <Stack.Screen name="Upload" component={MyReleaseScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="CalendarEvent" component={CalendarEventScreen} />
      <Stack.Screen name="Track" component={MyTrackScreen} />
      <Stack.Screen name="NewRelease" component={NewReleaseScreen} />
    </Stack.Navigator>
  );
}

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="SavedCards" component={SavedCardsScreen} />
      <Stack.Screen name="AddNewCard" component={AddNewCardScreen} />
      <Stack.Screen name="PayoutDetails" component={PayoutDetailsScreen} />
      <Stack.Screen name="PayoutBankAccounts" component={PayoutBankAccountsScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}
