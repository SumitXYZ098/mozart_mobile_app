import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { usePaymentStore, Card } from "@/stores/usePaymentStore";
import { toast } from "@/stores/useToastStore";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Rect, Path } from "react-native-svg";
import { deleteBankDetails, getBankDetails } from "@/api/userApi";
import { storageAPI } from "@/utils/storage";
import { useAuthStore } from "@/stores/useAuthStore";

// Golden card chip SVG representation
const CardChip = () => (
  <Svg width={30} height={20} viewBox="0 0 30 22" fill="none">
    <Rect width={30} height={22} rx={4} fill="#FFB703" />
    <Path d="M0 6h30M0 11h30M0 16h30" stroke="#4A3B00" strokeWidth={0.5} opacity={0.3} />
    <Path d="M7 0v22M15 0v22M23 0v22" stroke="#4A3B00" strokeWidth={0.5} opacity={0.3} />
  </Svg>
);

const maskCardNumber = (num: string) => {
  const cleaned = num.replace(/\s/g, "");
  if (cleaned.length < 4) return num;
  const last4 = cleaned.slice(-4);
  return `••••  ••••  ••••  ${last4}`;
};

export default function AddNewCardScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { cards, addCard, updateCard, removeCard } = usePaymentStore();

  const cardId = route.params?.cardId;
  const isEditing = !!cardId;

  // Form States
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [enableAutopay, setEnableAutopay] = useState(true);

  // Focus States
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Load existing card details if in edit mode
  useEffect(() => {
    if (isEditing && cards.length > 0) {
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        setCardHolder(card.cardHolder);
        setCardNumber(card.cardNumber);
        setExpiryDate(card.expiryDate);
        setCvv(card.cvv);
        setIsPrimary(card.isPrimary);
        setEnableAutopay(card.enableAutopay);
      }
    } else if (!isEditing) {
      if (route.params?.payoutHolderName) {
        setCardHolder(route.params.payoutHolderName);
      }
      if (route.params?.payoutAccountNumber) {
        const cleaned = route.params.payoutAccountNumber.replace(/\D/g, "");
        let formatted = "";
        for (let i = 0; i < cleaned.length && i < 16; i++) {
          if (i > 0 && i % 4 === 0) {
            formatted += " ";
          }
          formatted += cleaned[i];
        }
        setCardNumber(formatted);
      }
    }
  }, [cardId, cards, isEditing, route.params]);

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = "";
    for (let i = 0; i < cleaned.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " ";
      }
      formatted += cleaned[i];
    }
    setCardNumber(formatted);
  };

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = "";
    if (cleaned.length > 0) {
      formatted = cleaned.slice(0, 2);
      if (cleaned.length > 2) {
        formatted += "/" + cleaned.slice(2, 4);
      }
    }
    setExpiryDate(formatted);
  };

  // Format CVV (max 3 digits)
  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 3);
    setCvv(cleaned);
  };

  const handleSave = async () => {
    // Basic validation
    if (!cardHolder.trim()) {
      Alert.alert("Validation Error", "Please enter card holder name.");
      return;
    }
    if (cardNumber.replace(/\s/g, "").length < 16) {
      Alert.alert("Validation Error", "Please enter a valid 16-digit card number.");
      return;
    }
    if (expiryDate.length < 5) {
      Alert.alert("Validation Error", "Please enter expiry date (MM/YY).");
      return;
    }
    const [month, year] = expiryDate.split("/");
    const monthNum = parseInt(month, 10);
    if (monthNum < 1 || monthNum > 12) {
      Alert.alert("Validation Error", "Please enter a valid month (01-12).");
      return;
    }
    if (cvv.length < 3) {
      Alert.alert("Validation Error", "Please enter a valid 3-digit CVV.");
      return;
    }

    try {
      if (isEditing) {
        await updateCard(cardId, {
          cardHolder: cardHolder.trim(),
          cardNumber,
          expiryDate,
          cvv,
          isPrimary,
          enableAutopay,
        });
        toast.success("Card updated successfully!");
        navigation.goBack();
      } else {
        await addCard({
          cardHolder: cardHolder.trim(),
          cardNumber,
          expiryDate,
          cvv,
          isPrimary,
          enableAutopay,
        });
        toast.success("Card added successfully!");
        // Reset form inputs for next entry
        setCardHolder("");
        setCardNumber("");
        setExpiryDate("");
        setCvv("");
        setIsPrimary(false);
        setEnableAutopay(true);
      }
    } catch (error) {
      console.error("Failed to save card:", error);
      Alert.alert("Error", "Failed to save card. Please try again.");
    }
  };

  const handleDeleteCard = (card: Card) => {
    Alert.alert(
      "Delete Card",
      `Are you sure you want to delete the card ending in ${card.cardNumber.slice(-4)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (card.isBankAccount) {
              try {
                let bankId = card.bankDetailsId;
                if (!bankId) {
                  const resp = await getBankDetails();
                  if (resp && resp.id) {
                    bankId = resp.id;
                  }
                }
                if (bankId) {
                  await deleteBankDetails(bankId);
                } else {
                  await deleteBankDetails();
                }
                const { user } = useAuthStore.getState();
                const userId = user?.id || "guest";
                usePaymentStore.setState({ bankDetails: null });
                await storageAPI.removeItem(`user_bank_details_${userId}`);
              } catch (err: any) {
                console.warn("Failed to delete bank details from server:", err);
                const errMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
                Alert.alert(
                  "Server Delete Failed",
                  `Could not delete bank details from server. Error: ${errMsg}\n\nDo you want to force delete it locally anyway?`,
                  [
                    { text: "No", style: "cancel" },
                    { 
                      text: "Yes, Delete Locally", 
                      style: "destructive",
                      onPress: async () => {
                        await removeCard(card.id);
                        toast.success("Card deleted successfully!");
                      } 
                    }
                  ]
                );
                return;
              }
            }
            await removeCard(card.id);
            toast.success("Card deleted successfully!");
          },
        },
      ]
    );
  };

  const creditCardsOnly = cards.filter((c) => !c.isBankAccount);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? "Edit Card" : "Add New Card"}</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Card Information Section */}
          <Text style={styles.sectionHeader}>Card Information</Text>

          {/* Card Holder Name */}
          <Text style={styles.inputLabel}>Card Holder Name</Text>
          <View
            style={[
              styles.inputWrapper,
              focusedField === "holder" && styles.inputWrapperFocused,
            ]}
          >
            <TextInput
              style={styles.textInput}
              placeholder="e.g. John Doe"
              placeholderTextColor="#A0AEC0"
              value={cardHolder}
              onChangeText={setCardHolder}
              onFocus={() => setFocusedField("holder")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Card Number */}
          <Text style={styles.inputLabel}>Card Number</Text>
          <View
            style={[
              styles.inputWrapper,
              focusedField === "number" && styles.inputWrapperFocused,
            ]}
          >
            <TextInput
              style={styles.textInput}
              placeholder="XXXX XXXX XXXX XXXX"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
              maxLength={19} // 16 digits + 3 spaces
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              onFocus={() => setFocusedField("number")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Expiry and CVV Side by Side */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === "expiry" && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="MM/YY"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  maxLength={5}
                  value={expiryDate}
                  onChangeText={handleExpiryChange}
                  onFocus={() => setFocusedField("expiry")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.col}>
              <Text style={styles.inputLabel}>CVV</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === "cvv" && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="XXX"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={3}
                  value={cvv}
                  onChangeText={handleCvvChange}
                  onFocus={() => setFocusedField("cvv")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          </View>

          {/* Save Card As Section */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Save Card As</Text>



          {/* Autopay Toggle Card */}
          <View style={styles.autopayCard}>
            <View style={styles.autopayTextWrapper}>
              <Text style={styles.autopayTitle}>Enable Autopay</Text>
              <Text style={styles.autopaySubtitle}>
                automatically renew your active subscription
              </Text>
            </View>
            <Switch
              value={enableAutopay}
              onValueChange={setEnableAutopay}
              trackColor={{ false: "#D1D1D6", true: Colors.primary }}
              thumbColor={Platform.OS === "ios" ? undefined : Colors.white}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          {/* Saved Cards Section */}
          {creditCardsOnly.length > 0 && (
            <View style={styles.savedCardsSection}>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionHeader}>Saved Cards</Text>
              {creditCardsOnly.map((item) => (
                <View key={item.id} style={styles.cardContainerMini}>
                  <LinearGradient
                    colors={["#4916A0", "#110825"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.creditCardMini}
                  >
                    {/* Card Top Row */}
                    <View style={styles.cardHeaderMini}>
                      <View style={styles.chipBrandMini}>
                        <CardChip />
                        <Text style={styles.brandTextMini}>AMOZART PAY</Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        {item.enableAutopay && (
                          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                        )}
                        <TouchableOpacity
                          style={styles.actionIconBtnMini}
                          onPress={() => handleDeleteCard(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash" size={18} color="rgba(255,255,255,0.85)" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Card Number */}
                    <Text style={styles.cardNumberTextMini}>{maskCardNumber(item.cardNumber)}</Text>

                    {/* Card Details Footer */}
                    <View style={styles.cardFooterMini}>
                      <View style={styles.footerColMini}>
                        <Text style={styles.footerLabelMini}>HOLDER</Text>
                        <Text style={styles.footerValueMini} numberOfLines={1}>
                          {item.cardHolder.toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.footerColMini}>
                        <Text style={styles.footerLabelMini}>EXPIRY</Text>
                        <Text style={styles.footerValueMini}>{item.expiryDate}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  backButton: {
    backgroundColor: "#F5F5F7",
    borderRadius: 10,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  placeholder: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    marginVertical: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E93",
    fontFamily: "Poppins_500Medium",
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    justifyContent: "center",
    marginBottom: 16,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  textInput: {
    fontSize: 15,
    color: "#1A202C",
    fontFamily: "Poppins_400Regular",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  col: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#C7C7CC",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#1A1A1A",
    fontFamily: "Poppins_400Regular",
  },
  autopayCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.lightPrimary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  autopayTextWrapper: {
    flex: 1,
    marginRight: 12,
  },
  autopayTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
    fontFamily: "Poppins_600SemiBold",
  },
  autopaySubtitle: {
    fontSize: 11,
    color: Colors.primary,
    opacity: 0.8,
    fontFamily: "Poppins_400Regular",
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  savedCardsSection: {
    marginTop: 32,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 24,
  },
  cardContainerMini: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  creditCardMini: {
    padding: 20,
    aspectRatio: 1.58,
    justifyContent: "space-between",
    position: "relative",
  },
  cardHeaderMini: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chipBrandMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandTextMini: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 1,
  },
  primaryBadgeMini: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeTextMini: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  cardNumberTextMini: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 2,
    textAlign: "center",
    marginVertical: 10,
  },
  cardFooterMini: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20,
  },
  footerColMini: {
    gap: 2,
  },
  footerLabelMini: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 8,
    fontFamily: "Poppins_400Regular",
    letterSpacing: 0.5,
  },
  footerValueMini: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  actionIconBtnMini: {
    padding: 4,
  },
});
