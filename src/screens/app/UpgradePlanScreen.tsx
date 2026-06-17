import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Linking,
  AppState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/theme/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAddOnArtist, useVerifyPayment } from "@/hooks/useSubscription";
import { useCurrencyPricing } from "@/hooks/useCurrencyPricing";
import { toast } from "@/stores/useToastStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { ContactSalesModal } from "@/components/common/ContactSalesModal";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";

export default function UpgradePlanScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  const [artistLimit, setArtistLimit] = useState(5);
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const [pendingSessionId, setPendingSessionId] = useState("");
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);

  const { mutateAsync: addOnArtistMutation, isPending: isPurchasing } = useAddOnArtist();
  const { mutateAsync: verifyPaymentMutation, isPending: isVerifying } = useVerifyPayment();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setIsLoadingOverlay(false);
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // Fetch currency pricing for the base price (1000 INR, 12 CAD, 9 USD per 5 artists)
  const { symbol, convertedPrice, currency } = useCurrencyPricing({
    indiaPrice: 1000,
    canadaPrice: 12,
    usaPrice: 9,
  });

  // Calculate pricing based on chosen limit (5, 10, 15, 20, 25) with 10% discount for >= 10 artists
  const getAddOnPrice = (limit: number) => {
    let price = (limit / 5) * convertedPrice;
    if (limit >= 10) {
      price = price - price * 0.1;
    }
    return Math.round(price);
  };

  const addOnPrice = getAddOnPrice(artistLimit);

  const handleIncreaseArtist = () => {
    setArtistLimit((prev) => Math.min(prev + 5, 25));
  };

  const handleDecreaseArtist = () => {
    setArtistLimit((prev) => Math.max(prev - 5, 5));
  };

  const handleArtistAddOn = async () => {
    setIsLoadingOverlay(true);
    try {
      const session = await addOnArtistMutation({
        artists: artistLimit,
        amount: addOnPrice,
        currency,
      });

      if (session?.url) {
        const rawSession = session as any;
        let extractedSessionId =
          rawSession.sessionId ||
          rawSession.id ||
          rawSession.session_id ||
          rawSession.stripeSessionId ||
          rawSession.session?.id;

        // Fallback: Extract the Stripe Session ID from the URL if not provided directly in response fields
        if (!extractedSessionId && rawSession.url) {
          const match = rawSession.url.match(/(cs_(?:test|live)_[a-zA-Z0-9_]+)/);
          if (match) {
            extractedSessionId = match[1];
            console.log("Extracted Session ID from URL:", extractedSessionId);
          }
        }

        extractedSessionId = extractedSessionId || "mock_addon_session";
        setPendingSessionId(extractedSessionId);

        // Save pending checkout session details to AsyncStorage
        await AsyncStorage.setItem(
          "pending_checkout_session",
          JSON.stringify({
            sessionId: extractedSessionId,
            type: "upgrade",
            artists: artistLimit,
          })
        );

        setIsLoadingOverlay(false);
        await Linking.openURL(session.url);
      } else {
        throw new Error("Invalid checkout response");
      }
    } catch (err: any) {
      console.warn("Artist add-on checkout failed:", err);
      toast.error(err?.message || "Failed to initiate add-on checkout.");
    } finally {
      setIsLoadingOverlay(false);
    }
  };



  const isPending = isPurchasing || isVerifying || isLoadingOverlay;

  return (
    <LinearGradient
      colors={["#EDE5F7", "#FFFFFF"]}
      locations={[0.2, 1]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upgrade</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Page Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Upgrade Your Plan</Text>
          </View>

          {/* Card 1: Add-on Artist */}
          <View style={styles.card}>
            <Text style={styles.cardPlanName}>Add-on Artist</Text>
            <Text style={styles.cardPlanDescription}>
              Increase your primary artist limit.
            </Text>

            {/* Stepper & Price block */}
            <View style={styles.addonDetailsContainer}>
              <View style={styles.stepperSection}>
                <Text style={styles.stepperLabel}>Artist Limit</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    onPress={handleDecreaseArtist}
                    disabled={artistLimit <= 5}
                    style={[styles.stepperBtn, artistLimit <= 5 && styles.stepperBtnDisabled]}
                  >
                    <Text style={styles.stepperBtnText}>-5</Text>
                  </TouchableOpacity>

                  <Text style={styles.stepperValue}>{artistLimit}</Text>

                  <TouchableOpacity
                    onPress={handleIncreaseArtist}
                    disabled={artistLimit >= 25}
                    style={[styles.stepperBtn, artistLimit >= 25 && styles.stepperBtnDisabled]}
                  >
                    <Text style={styles.stepperBtnText}>+5</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.priceSection}>
                <Text style={styles.priceText}>
                  {symbol}
                  {addOnPrice}
                </Text>
                {artistLimit >= 10 && (
                  <Text style={styles.discountBadge}>10% discount applied</Text>
                )}
              </View>
            </View>

            {/* Features List */}
            <View style={styles.featuresList}>
              {[
                `Add ${artistLimit} Primary Artists`,
                "Manage More Music Catalogs",
                "Instant Activation",
              ].map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <View style={styles.checkContainer}>
                    <Ionicons name="checkmark" size={12} color="#6739B7" />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Add Artist Button */}
            <TouchableOpacity
              style={styles.filledButton}
              onPress={handleArtistAddOn}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.filledButtonText}>Add Artist</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Card 2: Custom Distribution Plan */}
          <View style={styles.card}>
            <Text style={styles.cardPlanName}>Custom Distribution Plan</Text>
            <Text style={styles.cardPlanDescription}>
              Great Fit For Big Organizations
            </Text>

            {/* Features List */}
            <View style={styles.featuresList}>
              {[
                "Upload unlimited tracks",
                "Choose your own platforms",
                "Analytics dashboard access",
              ].map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <View style={styles.checkContainer}>
                    <Ionicons name="checkmark" size={12} color="#6739B7" />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Contact Us Button */}
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => setContactModalVisible(true)}
              disabled={isPending}
            >
              <Text style={styles.outlineButtonText}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Sales Contact Modal */}
        <ContactSalesModal
          visible={contactModalVisible}
          onClose={() => setContactModalVisible(false)}
        />



        {/* Processing Loading Overlay */}
        <LoadingOverlay
          visible={isPending}
          message={isVerifying ? "Verifying Payment..." : "Processing activation..."}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C2C2C",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleContainer: {
    marginTop: 12,
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderColor: "#EBE6F5",
    borderWidth: 1,
    shadowColor: "#6739B7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardPlanName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 4,
  },
  cardPlanDescription: {
    fontSize: 14,
    color: "#777777",
    fontFamily: "Poppins_400Regular",
    marginBottom: 20,
  },
  addonDetailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F6FC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0EBF7",
  },
  stepperSection: {
    flex: 1,
  },
  stepperLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 8,
  },
  stepperControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    minWidth: 24,
    textAlign: "center",
  },
  priceSection: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111111",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  discountBadge: {
    fontSize: 11,
    color: Colors.green,
    fontWeight: "600",
    fontFamily: "Poppins_400Regular",
    marginTop: 2,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F4EBFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureText: {
    fontSize: 13,
    color: "#4F4F4F",
    fontFamily: "Poppins_400Regular",
    flex: 1,
  },
  filledButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  filledButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  outlineButton: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  outlineButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 5, 20, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "#F4EBFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 13,
    color: "#666666",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  verifyBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  closeBtn: {
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "#777777",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
