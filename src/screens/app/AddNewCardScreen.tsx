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
import { usePaymentStore } from "@/stores/usePaymentStore";
import { toast } from "@/stores/useToastStore";
import { useEffect } from "react";

export default function AddNewCardScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { cards, addCard, updateCard } = usePaymentStore();

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
    }
  }, [cardId, cards, isEditing]);

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
      }
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save card:", error);
      Alert.alert("Error", "Failed to save card. Please try again.");
    }
  };

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

          {/* Set as Primary Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsPrimary(!isPrimary)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, isPrimary && styles.checkboxChecked]}>
              {isPrimary && <Ionicons name="checkmark" size={14} color={Colors.white} />}
            </View>
            <Text style={styles.checkboxLabel}>Set as primary card</Text>
          </TouchableOpacity>

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
});
