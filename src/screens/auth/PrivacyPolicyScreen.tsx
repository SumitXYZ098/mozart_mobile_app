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
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/theme/colors";

// ─── Privacy Policy Data ──────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 1,
    title: "1. What We Collect & Why",
    icon: "person-add",
    content: `• Account & Payment: Name, email, phone number, country, and billing details.\n\nNote: Credit card data is securely handled directly by your chosen Payment Gateway.\n\nLegal Basis: Necessary to fulfill our service contract.\n\n• Automatic Data (Cookies & Logs): IP address, browser type, device details, and app usage (clicks/scrolls).\n\nLegal Basis: Legitimate interest to prevent fraud, fix technical bugs, and optimize the platform.\n\n• Third-Party Login: Basic profile data (name, email) if you log in via Google, Facebook, or Soundcloud.\n\nLegal Basis: Your explicit consent.`,
  },
  {
    id: 2,
    title: "2. Data Sharing & Processors",
    icon: "share-social",
    content: `• Internal Team: Access is strictly restricted to employees and contractors who need it to support you.\n\n• Service Providers: Shared with trusted partners (like our host, Amozart) under strict GDPR-compliant privacy agreements.\n\n• Legal Obligations: Disclosed only if required by law, court orders, or to prevent fraud and illegal activities.`,
  },
  {
    id: 3,
    title: "3. Your Rights",
    icon: "options",
    content: `You have full control over your data. You can request to:\n\n• Access & Correct: View or update your personal information.\n\n• Erase: Delete your data entirely ("Right to be Forgotten").\n\n• Restrict & Object: Stop us from using your data for direct marketing (via the "Unsubscribe" link).`,
  },
  {
    id: 4,
    title: "4. Data Retention & Deletion",
    icon: "trash",
    content: `• Active Period: Your data remains active as long as your account is open.\n\n• After Account Deletion: Data is removed from the active database during our next semi-annual cleanup (within 6 months) and permanently wiped from backups 3 months after that.`,
  },
  {
    id: 5,
    title: "5. Crucial Details",
    icon: "information-circle",
    content: `• Minors: Our services are not meant for anyone under 16 years of age.\n\n• Security: We use strict administrative, physical, and technical safeguards to keep your data safe.\n\n• Policy Updates: If we change this policy, we will notify you via email or a service announcement.`,
  },
];

// ─── Accordion Item Component ─────────────────────────────────────────────────
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
export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
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
          <Text style={styles.heroTitle}>AMOZART MUSIC INC.</Text>
          <Text style={styles.heroSubtitle}>
            We only collect the minimum amount of information necessary to provide our services and maintain our business relationship with you.
          </Text>
        </View>

        {/* Accordion Sections */}
        <View style={styles.sectionsContainer}>
          {SECTIONS.map((s) => (
            <AccordionItem key={s.id} section={s} />
          ))}
        </View>

        {/* Contact/Support Info */}
        <View style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <Ionicons name="mail" size={20} color={Colors.primary} />
            <Text style={styles.contactTitle}>Need to cancel or ask a question?</Text>
          </View>
          <View style={styles.contactDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>support@amozart.com</Text>
            </View>
            {/* <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailValue}>
                Carrer de Trafalgar, 10, 08010 Barcelona, Spain
              </Text>
            </View> */}
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
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
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // Hero
  heroBanner: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
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
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },

  // Sections
  sectionsContainer: { gap: 12, marginBottom: 16 },

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
    paddingBottom: 16,
  },
  accordionContent: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
  },

  // Contact
  contactCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 8,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 10,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  contactDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "column",
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    fontFamily: "Poppins_600SemiBold",
  },
  detailValue: {
    fontSize: 13,
    color: "#4B5563",
    fontFamily: "Poppins_400Regular",
    lineHeight: 18,
  },
});
