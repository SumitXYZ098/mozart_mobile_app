import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "@/navigation/AuthNavigator";
import { Colors } from "@/theme/colors";

type Props = NativeStackScreenProps<AuthStackParamList, "TermsOfService">;

// ─── Terms data ─────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 1,
    title: "1. Our Service",
    icon: "musical-notes",
    content: `Amozart is your digital music distributor. We format, deliver, and host your music, videos, and artwork ("Your Content") to Digital Music Services (DMS) like Spotify, Apple Music, Tidal, Amazon, and others.\n\nExclusivity by Platform: You can exploit your music elsewhere, but if you distribute a specific track to a specific music store through Amozart, you cannot distribute that same track to that same store using a different distributor.`,
  },
  {
    id: 2,
    title: "2. Your Commitments",
    icon: "shield-checkmark",
    content: `To use Amozart, you promise and guarantee that:\n\n• Complete Ownership: You own or have official, written permission for all audio, lyrics, logos, covers, and photos you upload.\n\n• No Infringement: Your content does not violate third-party copyrights, trademarks, or privacy rights.\n\n• Explicit Material: You will correctly flag your music as "Explicit" if it contains sexual, violent, or sensitive themes.\n\n• App Safety: You will not attempt to reverse-engineer our app, access our source code, or share your account with unauthorized third parties.`,
  },
  {
    id: 3,
    title: "3. Earnings, Payouts & Fraud",
    icon: "wallet",
    content: `100% Royalties: You receive 100% of the net income we receive from streaming stores for your music. Amozart takes a 0% sales commission.\n\nMonthly Payouts: You can request your balance once a month via PayPal or bank transfer, provided you meet the minimum payout threshold listed in your account settings.\n\nAnti-Fraud & Withholding: We heavily police artificial, automated, or bot-generated streams. Under our strict 3-Strike Anti-Fraud Policy, if we suspect fraudulent activity, we reserve the right to freeze your funds for up to 24 months or permanently ban your account.`,
  },
  {
    id: 4,
    title: "4. Rights You Grant Us",
    icon: "document-text",
    content: `Distribution License: You retain full ownership of your music. However, you grant Amozart a worldwide license to host, distribute, and collect revenue for your music during our contract.\n\nRoyalty Collection: You authorize us to collect publishing, mechanical, public performance, and neighboring rights from Collective Management Organizations (CMOs) on your behalf for the tracks distributed through us.`,
  },
  {
    id: 5,
    title: "5. Leaving Amozart (Termination)",
    icon: "exit",
    content: `Cancel Anytime: Our contract is ongoing, but either party can terminate it at any time by giving a 30-day notice.\n\nTakedown First: Before requesting account closure, you must manually use the "Takedown" button in the app to remove your music from digital stores.\n\nOutstanding Balances: Upon termination, any money you owe us must be paid within 5 days, or we will payout your final remaining balance to you.`,
  },
  {
    id: 6,
    title: "6. Disclaimers & Limits of Liability",
    icon: "alert-circle",
    content: `"As-Is" Service: We work hard to provide an excellent app, but our service is provided "as-is" without promises of being 100% error-free or uninterrupted.\n\nLiability Cap: Our maximum financial liability to you for any legal dispute or claim is strictly limited to the amount of fees you paid us over the 12 months leading up to the claim.`,
  },
  {
    id: 7,
    title: "7. Legal Updates & Disputes",
    icon: "globe",
    content: `Changes to Terms: We can update these terms or our prices. We will notify you via the app or email at least 10 days before any term updates take effect (and 30 days before pricing updates).\n\nGoverning Law: These terms are governed by the laws of Spain. Any official legal disputes will be resolved through final, binding arbitration via the World Intellectual Property Organization (WIPO) in English.`,
  },
];

// ─── Accordion Item ──────────────────────────────────────────────────────────
function AccordionItem({ section }: { section: typeof SECTIONS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.parallel([
      Animated.spring(rotateAnim, { toValue, useNativeDriver: true }),
      Animated.timing(heightAnim, {
        toValue,
        duration: 280,
        useNativeDriver: false,
      }),
    ]).start();
    setExpanded(!expanded);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const maxHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 600],
  });

  return (
    <View style={styles.accordionCard}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <View style={styles.accordionLeft}>
          <View style={styles.sectionIconWrapper}>
            <Ionicons name={section.icon as any} size={19} color={Colors.primary} />
          </View>
          <Text style={styles.accordionTitle}>{section.title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.accordionBody, { maxHeight, overflow: "hidden" }]}>
        <Text style={styles.accordionContent}>{section.content}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function TermsOfServiceScreen({ navigation, route }: Props) {
  const [agreed, setAgreed] = useState(false);
  const checkAnim = useRef(new Animated.Value(0)).current;
  const fromSignUp = (route.params as any)?.fromSignUp ?? false;

  const toggleCheckbox = () => {
    const toValue = agreed ? 0 : 1;
    Animated.spring(checkAnim, { toValue, useNativeDriver: true }).start();
    setAgreed(!agreed);
  };

  const checkScale = checkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.25, 1],
  });

  const handleProceed = () => {
    if (!agreed) return;
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Terms of Service</Text>
      
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <Image
            source={require("../../../assets/icon.png")}
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>AMOZART MUSIC</Text>
          <Text style={styles.heroSubtitle}>
            Welcome to Amozart Music Inc. By creating an account and using our
            mobile app or platform, you agree to these Terms of Use.{" "}
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }}>
              Please read them carefully.
            </Text>
          </Text>
        </View>

        {/* Accordion Sections */}
        <View style={styles.sectionsContainer}>
          {SECTIONS.map((s) => (
            <AccordionItem key={s.id} section={s} />
          ))}
        </View>

        {/* Contact */}
        <View style={styles.contactCard}>
          <Ionicons name="mail-outline" size={18} color={Colors.primary} />
          <Text style={styles.contactText}>
            Questions? Contact us at{" "}
            <Text style={styles.contactEmail}>support@amozart.com</Text>
            {" "}or via the in-app support tab.
          </Text>
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Sticky Footer — Checkbox & Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={toggleCheckbox}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.checkbox,
              agreed && styles.checkboxChecked,
              { transform: [{ scale: checkScale }] },
            ]}
          >
            {agreed && (
              <Ionicons name="checkmark" size={13} color="#fff" />
            )}
          </Animated.View>
          <Text style={styles.checkboxLabel}>
            I have read and agree to the{" "}
            <Text style={styles.checkboxHighlight}>Terms of Use</Text>
            {" "}and{" "}
            <Text style={styles.checkboxHighlight}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.proceedBtn, !agreed && styles.proceedBtnDisabled]}
          onPress={handleProceed}
          activeOpacity={agreed ? 0.7 : 1}
        >
          <Text style={styles.proceedBtnText}>
            {fromSignUp ? "Proceed to Sign Up" : "I Agree & Continue"}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={agreed ? "#fff" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    marginTop: 1,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // Hero
  heroBanner: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  heroLogo: {
    width: 92,
    height: 92,
    borderRadius: 18,
    tintColor: Colors.primary,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },

  // Sections
  sectionsContainer: { gap: 10, marginBottom: 16 },

  // Accordion
  accordionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  accordionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  sectionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans_700Bold",
    flex: 1,
  },
  accordionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  accordionContent: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    lineHeight: 21,
  },

  // Contact
  contactCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  contactText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
  },
  contactEmail: {
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_700Bold",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
    gap: 14,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: "#4B5563",
    fontFamily: "Poppins_400Regular",
    lineHeight: 19,
  },
  checkboxHighlight: {
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  proceedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
  },
  proceedBtnDisabled: {
    backgroundColor: "#cececeff",
  },
  proceedBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
