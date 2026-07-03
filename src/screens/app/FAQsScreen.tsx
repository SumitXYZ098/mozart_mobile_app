import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/theme/colors";

// ─── FAQ Categories ──────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Distribution", "Royalties", "Account"];

// ─── Dummy FAQ Data ──────────────────────────────────────────────────────────
const FAQS_DATA = [
  {
    id: 1,
    category: "Distribution",
    question: "How long does it take for my release to go live?",
    answer: "Typically, releases go live on major platforms like Spotify and Apple Music within 24 to 72 hours. However, to guarantee your release is live on a specific day or to pitch for playlists, we recommend uploading your music at least 10–14 days in advance.",
  },
  {
    id: 2,
    category: "Royalties",
    question: "How much commission does Amozart take from my earnings?",
    answer: "Amozart takes 0% commission! You retain 100% of your earnings, sales, and streaming royalties received from stores.",
  },
  {
    id: 3,
    category: "Royalties",
    question: "When and how do I get paid?",
    answer: "Streaming stores report earnings with a 2-month delay. Once reported, you can view and request a payout of your balance via PayPal or bank transfer directly from the Wallet tab. The minimum payout threshold is $10.",
  },
  {
    id: 4,
    category: "Distribution",
    question: "Can I distribute cover songs through Amozart?",
    answer: "Yes, you can distribute cover songs. However, you must secure a mechanical license for the composition. Sampling or copying sound recordings owned by others is strictly prohibited without explicit clearance.",
  },
  {
    id: 5,
    category: "Account",
    question: "Can I release music under multiple artist names?",
    answer: "Yes, depending on your subscription plan limit, you can create and distribute music under different primary artist names. You can manage your artist list directly from the Artists screen in the side drawer.",
  },
  {
    id: 6,
    category: "Distribution",
    question: "How do I take down my music from streaming stores?",
    answer: "If you need to remove your music, go to the Catalogue tab, tap on the specific release, and click the 'Request Takedown' button. It usually takes 2 to 5 business days for stores to remove the content.",
  },
];

// ─── Accordion Item Component ─────────────────────────────────────────────────
function FAQAccordionItem({ item }: { item: typeof FAQS_DATA[0] }) {
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
    outputRange: [0, 400],
  });

  return (
    <View style={styles.accordionCard}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <Text style={styles.accordionQuestion}>{item.question}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.accordionBody, { maxHeight, overflow: "hidden" }]}>
        <Text style={styles.accordionAnswer}>{item.answer}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Main Screen Component ────────────────────────────────────────────────────
export default function FAQsScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFaqs = FAQS_DATA.filter((faq) => {
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          <Text style={styles.headerTitle}>FAQs & Help Center</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search FAQs, topics, keywords..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#94A3B8"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Selection Tabs */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryTab,
                  isSelected && styles.categoryTabActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* FAQ Accordions List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredFaqs.length > 0 ? (
          <View style={styles.faqList}>
            {filteredFaqs.map((item) => (
              <FAQAccordionItem key={item.id} item={item} />
            ))}
          </View>
        ) : (
          <View style={styles.noResults}>
            <Ionicons name="help-circle-outline" size={48} color="#CBD5E1" />
            <Text style={styles.noResultsText}>No FAQs found for your search.</Text>
          </View>
        )}

        {/* Contact/Support Footer */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Still need help?</Text>
          <Text style={styles.supportSubtitle}>
            If you can't find an answer to your question, you can submit a support ticket directly from the side menu.
          </Text>
        </View>

        <View style={{ height: 40 }} />
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

  // Search Section
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    fontFamily: "Poppins_400Regular",
    padding: 0,
  },

  // Categories Selection
  categoriesSection: {
    paddingVertical: 8,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // FAQ list & Accordions
  faqList: {
    gap: 12,
  },
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  accordionQuestion: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans_700Bold",
    flex: 1,
    lineHeight: 20,
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  accordionAnswer: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
  },

  // No results
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  noResultsText: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "Poppins_400Regular",
  },

  // Support CTA Card
  supportCard: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#EDE9FE",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 24,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 8,
  },
  supportSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
