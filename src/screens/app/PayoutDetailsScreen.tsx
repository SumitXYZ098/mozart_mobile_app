import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { useNavigation } from "@react-navigation/native";
import { usePaymentStore, BankDetails } from "@/stores/usePaymentStore";
import { toast } from "@/stores/useToastStore";
import { submitBankDetails, getBankDetails, updateBankDetails } from "@/api/userApi";
import { storageAPI } from "@/utils/storage";

// Comprehensive Country list with flag, currency code and localized bank details system
const COUNTRIES = [
  { name: "India", flag: "🇮🇳", system: "IFSC", currency: "₹" },
  { name: "United States", flag: "🇺🇸", system: "ABA", currency: "$" },
  { name: "Canada", flag: "🇨🇦", system: "TRANSIT", currency: "C$" },
  { name: "United Kingdom", flag: "🇬🇧", system: "SORT", currency: "£" },
  { name: "Germany", flag: "🇩🇪", system: "IBAN", currency: "€" },
  { name: "France", flag: "🇫🇷", system: "IBAN", currency: "€" },
  { name: "Italy", flag: "🇮🇹", system: "IBAN", currency: "€" },
  { name: "Spain", flag: "🇪🇸", system: "IBAN", currency: "€" },
  { name: "Netherlands", flag: "🇳🇱", system: "IBAN", currency: "€" },
  { name: "Belgium", flag: "🇧🇪", system: "IBAN", currency: "€" },
  { name: "Switzerland", flag: "🇨🇭", system: "IBAN", currency: "CHF" },
  { name: "Australia", flag: "🇦🇺", system: "SWIFT", currency: "A$" },
  { name: "Japan", flag: "🇯🇵", system: "SWIFT", currency: "¥" },
  { name: "China", flag: "🇨🇳", system: "SWIFT", currency: "¥" },
  { name: "Brazil", flag: "🇧🇷", system: "SWIFT", currency: "R$" },
  { name: "Mexico", flag: "🇲🇽", system: "SWIFT", currency: "Mex$" },
  { name: "South Africa", flag: "🇿🇦", system: "SWIFT", currency: "R" },
  { name: "Singapore", flag: "🇸🇬", system: "SWIFT", currency: "S$" },
  { name: "United Arab Emirates", flag: "🇦🇪", system: "IBAN", currency: "AED" },
  { name: "Saudi Arabia", flag: "🇸🇦", system: "IBAN", currency: "SAR" },
  { name: "New Zealand", flag: "🇳🇿", system: "SWIFT", currency: "NZ$" },
  { name: "Sweden", flag: "🇸🇪", system: "IBAN", currency: "kr" },
  { name: "Norway", flag: "🇳🇴", system: "IBAN", currency: "kr" },
  { name: "Denmark", flag: "🇩🇰", system: "IBAN", currency: "kr" },
  { name: "Finland", flag: "🇫🇮", system: "IBAN", currency: "€" },
  { name: "Ireland", flag: "🇮🇪", system: "IBAN", currency: "€" },
  { name: "Austria", flag: "🇦🇹", system: "IBAN", currency: "€" },
  { name: "Portugal", flag: "🇵🇹", system: "IBAN", currency: "€" },
  { name: "Poland", flag: "🇵🇱", system: "IBAN", currency: "zł" },
  { name: "Turkey", flag: "🇹🇷", system: "IBAN", currency: "₺" },
  { name: "Russia", flag: "🇷🇺", system: "SWIFT", currency: "₽" },
  { name: "South Korea", flag: "🇰🇷", system: "SWIFT", currency: "₩" },
  { name: "Hong Kong", flag: "🇭🇰", system: "SWIFT", currency: "HK$" },
  { name: "Malaysia", flag: "🇲🇾", system: "SWIFT", currency: "RM" },
  { name: "Thailand", flag: "🇹🇭", system: "SWIFT", currency: "฿" },
  { name: "Indonesia", flag: "🇮🇩", system: "SWIFT", currency: "Rp" },
  { name: "Philippines", flag: "🇵🇭", system: "SWIFT", currency: "₱" },
  { name: "Vietnam", flag: "🇻🇳", system: "SWIFT", currency: "₫" },
  { name: "Egypt", flag: "🇪🇬", system: "IBAN", currency: "E£" },
  { name: "Nigeria", flag: "🇳🇬", system: "SWIFT", currency: "₦" },
  { name: "Kenya", flag: "🇰🇪", system: "SWIFT", currency: "KSh" },
  { name: "Argentina", flag: "🇦🇷", system: "SWIFT", currency: "$" },
  { name: "Colombia", flag: "🇨🇴", system: "SWIFT", currency: "$" },
  { name: "Chile", flag: "🇨🇱", system: "SWIFT", currency: "$" },
  { name: "Peru", flag: "🇵🇪", system: "SWIFT", currency: "S/." },
];

const TRANSFER_METHODS_BY_SYSTEM: Record<string, { name: string }[]> = {
  IFSC: [{ name: "International Wire Transfer" }],
  ABA: [{ name: "International Wire Transfer" }],
  TRANSIT: [{ name: "International Wire Transfer" }],
  SORT: [{ name: "International Wire Transfer" }],
  IBAN: [{ name: "International Wire Transfer" }],
  SWIFT: [{ name: "International Wire Transfer" }],
};

const CURRENCIES = [
  { symbol: "₹", name: "INR" },
  { symbol: "$", name: "USD" },
  { symbol: "C$", name: "CAD" },
  { symbol: "£", name: "GBP" },
  { symbol: "€", name: "EUR" },
  { symbol: "AED", name: "AED" },
  { symbol: "SAR", name: "SAR" },
  { symbol: "CHF", name: "CHF" },
  { symbol: "A$", name: "AUD" },
  { symbol: "¥", name: "JPY" },
  { symbol: "R$", name: "BRL" },
  { symbol: "Mex$", name: "MXN" },
  { symbol: "NZ$", name: "NZD" },
  { symbol: "kr", name: "SEK/NOK/DKK" },
  { symbol: "zł", name: "PLN" },
  { symbol: "₺", name: "TRY" },
];

const getCurrencyCode = (countryName: string, defaultSymbol: string) => {
  if (countryName === "India") return "INR";
  if (countryName === "United States") return "USD";
  if (countryName === "Canada") return "CAD";
  if (countryName === "United Kingdom") return "GBP";
  if (countryName === "Sweden") return "SEK";
  if (countryName === "Norway") return "NOK";
  if (countryName === "Denmark") return "DKK";
  if (countryName === "Japan") return "JPY";
  if (countryName === "China") return "CNY";
  
  const symbolMap: Record<string, string> = {
    "₹": "INR",
    "$": "USD",
    "C$": "CAD",
    "£": "GBP",
    "€": "EUR",
    "CHF": "CHF",
    "A$": "AUD",
    "¥": "CNY",
    "R$": "BRL",
    "Mex$": "MXN",
    "NZ$": "NZD",
    "AED": "AED",
    "SAR": "SAR",
    "zł": "PLN",
    "₺": "TRY",
  };
  return symbolMap[defaultSymbol] || "USD";
};

export default function PayoutDetailsScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { cards, loadPaymentState, saveBankDetails } = usePaymentStore();
  // editCard is passed when tapping edit on an existing bank account card
  const editCard = route?.params?.editCard || null;

  // Form Fields
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [selectedMethod, setSelectedMethod] = useState(TRANSFER_METHODS_BY_SYSTEM.IFSC[0]);
  
  const [holderName, setHolderName] = useState("");
  const [bankName, setBankName] = useState("");

  // Country-Specific Banking fields
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  
  const [ifscCode, setIfscCode] = useState("");              // India
  const [routingNumber, setRoutingNumber] = useState("");      // US
  const [transitNumber, setTransitNumber] = useState("");      // Canada Transit
  const [institutionNumber, setInstitutionNumber] = useState(""); // Canada Institution
  const [sortCode, setSortCode] = useState("");              // UK
  const [iban, setIban] = useState("");                      // Europe & Others
  const [confirmIban, setConfirmIban] = useState("");        // Europe & Others
  const [swiftCode, setSwiftCode] = useState("");            // SWIFT & IBAN (BIC)

  // Modal Visibility States
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [methodModalVisible, setMethodModalVisible] = useState(false);

  // Focus States
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Search filter for Country Picker
  const [countrySearch, setCountrySearch] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [bankDetailsId, setBankDetailsId] = useState<number | null>(null);

  const [accountNumberError, setAccountNumberError] = useState<string | null>(null);
  const [confirmAccountNumberError, setConfirmAccountNumberError] = useState<string | null>(null);

  const handleAccountNumberChange = (text: string) => {
    setAccountNumber(text);
    if (!text) {
      setAccountNumberError(null);
    } else if (selectedCountry.name === "India" && !/^[0-9]{9,18}$/.test(text)) {
      setAccountNumberError("Enter a valid account number (9-18 digits)");
    } else if (selectedCountry.name === "Canada" && !/^[0-9]{9,12}$/.test(text)) {
      setAccountNumberError("Enter a valid account number (9-12 digits)");
    } else if (!/^[0-9]+$/.test(text)) {
      setAccountNumberError("Only numbers are allowed");
    } else {
      setAccountNumberError(null);
    }

    if (confirmAccountNumber && text !== confirmAccountNumber) {
      setConfirmAccountNumberError("Account numbers do not match");
    } else {
      setConfirmAccountNumberError(null);
    }
  };

  const handleAccountNumberBlur = () => {
    if (!accountNumber.trim()) {
      setAccountNumberError("Account number is required");
    }
  };

  const handleConfirmAccountNumberChange = (text: string) => {
    setConfirmAccountNumber(text);
    if (!text) {
      setConfirmAccountNumberError(null);
    } else if (text !== accountNumber) {
      setConfirmAccountNumberError("Account numbers do not match");
    } else {
      setConfirmAccountNumberError(null);
    }
  };

  const handleConfirmAccountNumberBlur = () => {
    if (!confirmAccountNumber.trim()) {
      setConfirmAccountNumberError("Confirm account number is required");
    } else if (confirmAccountNumber !== accountNumber) {
      setConfirmAccountNumberError("Account numbers do not match");
    }
  };

  // Prefill form from editCard param (editing existing) OR start blank (creating new)
  useEffect(() => {
    loadPaymentState();
    if (editCard) {
      // Editing an existing bank account card - prefill from card data
      setBankDetailsId(editCard.bankDetailsId || null);
      const matchCountry = COUNTRIES.find((c) => c.system === editCard.system) || COUNTRIES[0];
      setSelectedCountry(matchCountry);
      const methods = TRANSFER_METHODS_BY_SYSTEM[matchCountry.system] || TRANSFER_METHODS_BY_SYSTEM.SWIFT;
      setSelectedMethod(methods[0]);
      setHolderName(editCard.cardHolder || "");
      setBankName(editCard.bankName || "");
      setAccountNumber(editCard.cardNumber?.replace(/\s/g, "") || "");
      setConfirmAccountNumber(editCard.cardNumber?.replace(/\s/g, "") || "");
      setIfscCode(editCard.ifscCode || "");
      setRoutingNumber(editCard.routingNumber || "");
      setTransitNumber(editCard.transitNumber || "");
      setInstitutionNumber(editCard.institutionNumber || "");
      setSortCode(editCard.sortCode || "");
      setIban(editCard.iban || "");
      setConfirmIban(editCard.iban || "");
      setSwiftCode(editCard.swiftCode || "");
    } else {
      // Creating a new payout account - always start with blank form
      setBankDetailsId(null);
      setHolderName("");
      setBankName("");
      setAccountNumber("");
      setConfirmAccountNumber("");
      setIfscCode("");
      setRoutingNumber("");
      setTransitNumber("");
      setInstitutionNumber("");
      setSortCode("");
      setIban("");
      setConfirmIban("");
      setSwiftCode("");
    }
  }, []);

  // No store-sync effect needed — form is driven entirely by route params or blank state

  // Automatically update currency and transfer methods when country changes
  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    
    // Set default transfer method for the new country
    const methods = TRANSFER_METHODS_BY_SYSTEM[country.system] || TRANSFER_METHODS_BY_SYSTEM.SWIFT;
    setSelectedMethod(methods[0]);
    
    setCountryModalVisible(false);
    setCountrySearch("");

    // Clear validation errors
    setAccountNumberError(null);
    setConfirmAccountNumberError(null);
  };

  const handleSave = async () => {
    if (!holderName.trim()) {
      Alert.alert("Validation Error", "Please enter account holder name.");
      return;
    }
    if (!bankName.trim()) {
      Alert.alert("Validation Error", "Please enter bank name.");
      return;
    }

    if (accountNumberError) {
      Alert.alert("Validation Error", accountNumberError);
      return;
    }
    if (confirmAccountNumberError) {
      Alert.alert("Validation Error", confirmAccountNumberError);
      return;
    }

    const system = selectedCountry.system;

    // Validate based on the country banking system
    if (system === "IBAN") {
      if (!iban.trim()) {
        Alert.alert("Validation Error", "Please enter IBAN.");
        return;
      }
      if (iban.trim() !== confirmIban.trim()) {
        Alert.alert("Validation Error", "IBAN accounts do not match.");
        return;
      }
      if (!swiftCode.trim()) {
        Alert.alert("Validation Error", "Please enter BIC / SWIFT code.");
        return;
      }
    } else {
      if (!accountNumber.trim()) {
        Alert.alert("Validation Error", "Please enter account number.");
        return;
      }
      if (accountNumber !== confirmAccountNumber) {
        Alert.alert("Validation Error", "Account numbers do not match.");
        return;
      }

      // Exact validations matching the admin panel rules
      if (selectedCountry.name === "India") {
        if (!/^[0-9]{9,18}$/.test(accountNumber)) {
          Alert.alert("Validation Error", "Please enter a valid account number (9-18 digits).");
          return;
        }
        if (!ifscCode.trim()) {
          Alert.alert("Validation Error", "Please enter IFSC code.");
          return;
        }
        if (!/^[A-Z]{4}0[0-9A-Z]{6}$/.test(ifscCode.toUpperCase())) {
          Alert.alert("Validation Error", "Please enter a valid IFSC code (e.g., SBIN0001234).");
          return;
        }
      }

      if (selectedCountry.name === "Canada") {
        if (!/^[0-9]{9,12}$/.test(accountNumber)) {
          Alert.alert("Validation Error", "Please enter a valid account number (9-12 digits).");
          return;
        }
        if (!transitNumber.trim()) {
          Alert.alert("Validation Error", "Please enter Transit number.");
          return;
        }
        if (!/^[0-9]{5}$/.test(transitNumber)) {
          Alert.alert("Validation Error", "Transit number must be 5 digits.");
          return;
        }
        if (!institutionNumber.trim()) {
          Alert.alert("Validation Error", "Please enter Institution number.");
          return;
        }
        if (!/^[0-9]{3}$/.test(institutionNumber)) {
          Alert.alert("Validation Error", "Institution number must be 3 digits.");
          return;
        }
      }

      if (selectedCountry.name === "United States") {
        if (!routingNumber.trim()) {
          Alert.alert("Validation Error", "Please enter ABA Routing number.");
          return;
        }
        if (!/^[0-9]{9}$/.test(routingNumber)) {
          Alert.alert("Validation Error", "Routing number must be 9 digits.");
          return;
        }
      }

      if (system === "IFSC" && selectedCountry.name !== "India" && !ifscCode.trim()) {
        Alert.alert("Validation Error", "Please enter IFSC code.");
        return;
      }
      if (system === "ABA" && selectedCountry.name !== "United States" && !routingNumber.trim()) {
        Alert.alert("Validation Error", "Please enter ABA Routing number.");
        return;
      }
      if (system === "TRANSIT" && selectedCountry.name !== "Canada") {
        if (!transitNumber.trim()) {
          Alert.alert("Validation Error", "Please enter Transit number.");
          return;
        }
        if (!institutionNumber.trim()) {
          Alert.alert("Validation Error", "Please enter Institution number.");
          return;
        }
      }
      if (system === "SORT" && !sortCode.trim()) {
        Alert.alert("Validation Error", "Please enter Sort code.");
        return;
      }
      if (system === "SWIFT" && !swiftCode.trim()) {
        Alert.alert("Validation Error", "Please enter BIC / SWIFT code.");
        return;
      }
    }

    try {
      setIsSaving(true);
      const currencyCode = getCurrencyCode(selectedCountry.name, selectedCountry.currency);
      const detailsPayload: BankDetails = {
        country: selectedCountry.name,
        transferMethod: selectedMethod.name,
        currency: currencyCode,
        accountHolderName: holderName.trim(),
        bankName: bankName.trim(),
        accountNumber: system === "IBAN" ? iban.trim().toUpperCase() : accountNumber.trim(),
        ifscCode: system === "IFSC" ? ifscCode.trim().toUpperCase() : undefined,
        routingNumber: system === "ABA" ? routingNumber.trim() : undefined,
        transitNumber: system === "TRANSIT" ? transitNumber.trim() : undefined,
        institutionNumber: system === "TRANSIT" ? institutionNumber.trim() : undefined,
        sortCode: system === "SORT" ? sortCode.trim() : undefined,
        iban: system === "IBAN" ? iban.trim().toUpperCase() : undefined,
        swiftCode: (system === "SWIFT" || system === "IBAN") ? swiftCode.trim().toUpperCase() : undefined,
      };

      // Map to snake_case format for the backend API
      const apiPayload = {
        country: detailsPayload.country,
        currency: detailsPayload.currency,
        transfer_type: detailsPayload.transferMethod,
        account_holder_name: detailsPayload.accountHolderName,
        bank_name: detailsPayload.bankName,
        account_number: detailsPayload.accountNumber,
        ifsc_code: detailsPayload.ifscCode,
        routing_number: detailsPayload.routingNumber,
        transit_number: detailsPayload.transitNumber,
        institution_number: detailsPayload.institutionNumber,
        sort_code: detailsPayload.sortCode,
        iban: detailsPayload.iban,
        swift_code: detailsPayload.swiftCode,
      };

      let resolvedBankDetailsId = bankDetailsId;
      if (bankDetailsId) {
        await updateBankDetails(bankDetailsId, apiPayload);
      } else {
        const response = await submitBankDetails(apiPayload);
        if (response && response.data && response.data.id) {
          resolvedBankDetailsId = response.data.id;
          setBankDetailsId(response.data.id);
        }
      }
      
      const payloadWithId = {
        ...detailsPayload,
        id: resolvedBankDetailsId || undefined,
      };
      await saveBankDetails(payloadWithId);

      // Auto-save this payout account as a new card entry
      const rawCardNum = system === "IBAN" ? iban.trim() : accountNumber.trim();
      const formattedCardNum = rawCardNum.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();

      // If editing an existing card, replace it; otherwise add as new
      const editingCardId = editCard ? editCard.id : null;
      const existingCards = cards.filter(c => c.id !== editingCardId);

      const cardIdToUse = editingCardId || `card-${Date.now()}`;
      const newCardObj = {
        id: cardIdToUse,
        cardHolder: holderName.trim(),
        cardNumber: formattedCardNum || "0000 0000 0000 0000",
        expiryDate: "12/29", // default expiry
        cvv: "123", // default CVV
        isPrimary: false,
        enableAutopay: true,
        isBankAccount: true,
        bankDetailsId: resolvedBankDetailsId || undefined,
        bankName: bankName.trim(),
        system: system,
        ifscCode: system === "IFSC" ? ifscCode.trim().toUpperCase() : undefined,
        routingNumber: system === "ABA" ? routingNumber.trim() : undefined,
        transitNumber: system === "TRANSIT" ? transitNumber.trim() : undefined,
        institutionNumber: system === "TRANSIT" ? institutionNumber.trim() : undefined,
        sortCode: system === "SORT" ? sortCode.trim() : undefined,
        iban: system === "IBAN" ? iban.trim().toUpperCase() : undefined,
        swiftCode: (system === "SWIFT" || system === "IBAN") ? swiftCode.trim().toUpperCase() : undefined,
      };

      const updatedCards = [newCardObj, ...existingCards];
      
      usePaymentStore.setState({ cards: updatedCards });
      await storageAPI.setItem("user_saved_cards", JSON.stringify(updatedCards));

      toast.success("Payout details saved successfully!");
      navigation.navigate("SavedCards", {
        payoutHolderName: holderName.trim(),
        payoutAccountNumber: system === "IBAN" ? iban.trim() : accountNumber.trim(),
      });
    } catch (error: any) {
      console.error("Failed to save bank details:", error);
      const statusCode = error.response?.status;
      const apiErrorMsg = error.response?.data?.error?.message || error.response?.data?.message;
      const fallbackMsg = error.message;
      const detailedMessage = `Status: ${statusCode || "unknown"}\nError: ${apiErrorMsg || fallbackMsg || "Unknown Error"}\nMethod: ${error.config?.method?.toUpperCase() || "unknown"}\nURL: ${error.config?.url || "unknown"}`;
      
      Alert.alert("Save Bank Details Failed", detailedMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Render the dynamic inputs based on selected country banking system
  const renderDynamicBankFields = () => {
    const system = selectedCountry.system;

    if (system === "IBAN") {
      return (
        <>
          {/* IBAN */}
          <Text style={styles.inputLabel}>IBAN</Text>
          <View style={[styles.inputWrapper, focusedField === "iban" && styles.inputWrapperFocused]}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter IBAN"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="characters"
              value={iban}
              onChangeText={setIban}
              onFocus={() => setFocusedField("iban")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Confirm IBAN */}
          <Text style={styles.inputLabel}>Confirm IBAN</Text>
          <View style={[styles.inputWrapper, focusedField === "confirmIban" && styles.inputWrapperFocused]}>
            <TextInput
              style={styles.textInput}
              placeholder="Confirm IBAN"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="characters"
              value={confirmIban}
              onChangeText={setConfirmIban}
              onFocus={() => setFocusedField("confirmIban")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* SWIFT / BIC Code */}
          <Text style={styles.inputLabel}>BIC / SWIFT code</Text>
          <View style={[styles.inputWrapper, focusedField === "swift" && styles.inputWrapperFocused]}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. DEUTDEDDFXX"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="characters"
              value={swiftCode}
              onChangeText={setSwiftCode}
              onFocus={() => setFocusedField("swift")}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </>
      );
    }

    // Standard systems that require Account Number & Confirm Account Number
    return (
      <>
        {/* Account Number */}
        <Text style={styles.inputLabel}>Account Number</Text>
        <View style={[
          styles.inputWrapper, 
          focusedField === "account" && styles.inputWrapperFocused,
          accountNumberError ? styles.inputWrapperError : null
        ]}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter account number"
            placeholderTextColor="#A0AEC0"
            keyboardType="numeric"
            value={accountNumber}
            onChangeText={handleAccountNumberChange}
            onFocus={() => setFocusedField("account")}
            onBlur={() => {
              setFocusedField(null);
              handleAccountNumberBlur();
            }}
          />
        </View>
        {accountNumberError && (
          <Text style={styles.errorText}>{accountNumberError}</Text>
        )}

        {/* Confirm Account Number */}
        <Text style={styles.inputLabel}>Account Number (Confirm)</Text>
        <View style={[
          styles.inputWrapper, 
          focusedField === "confirmAccount" && styles.inputWrapperFocused,
          confirmAccountNumberError ? styles.inputWrapperError : null
        ]}>
          <TextInput
            style={styles.textInput}
            placeholder="Confirm account number"
            placeholderTextColor="#A0AEC0"
            keyboardType="numeric"
            value={confirmAccountNumber}
            onChangeText={handleConfirmAccountNumberChange}
            onFocus={() => setFocusedField("confirmAccount")}
            onBlur={() => {
              setFocusedField(null);
              handleConfirmAccountNumberBlur();
            }}
          />
        </View>
        {confirmAccountNumberError && (
          <Text style={styles.errorText}>{confirmAccountNumberError}</Text>
        )}

        {/* System-Specific Extra Codes */}
        {system === "IFSC" && (
          <>
            <Text style={styles.inputLabel}>IFSC code</Text>
            <View style={[styles.inputWrapper, focusedField === "ifsc" && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. SBIN0001234"
                placeholderTextColor="#A0AEC0"
                autoCapitalize="characters"
                value={ifscCode}
                onChangeText={setIfscCode}
                onFocus={() => setFocusedField("ifsc")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </>
        )}

        {system === "ABA" && (
          <>
            <Text style={styles.inputLabel}>ABA Routing Transit Number</Text>
            <View style={[styles.inputWrapper, focusedField === "routing" && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 123456789 (9 digits)"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={9}
                value={routingNumber}
                onChangeText={setRoutingNumber}
                onFocus={() => setFocusedField("routing")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </>
        )}

        {system === "TRANSIT" && (
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Transit Number</Text>
              <View style={[styles.inputWrapper, focusedField === "transit" && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 12345 (5 digits)"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  maxLength={5}
                  value={transitNumber}
                  onChangeText={setTransitNumber}
                  onFocus={() => setFocusedField("transit")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.col}>
              <Text style={styles.inputLabel}>Institution Number</Text>
              <View style={[styles.inputWrapper, focusedField === "institution" && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 123 (3 digits)"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  maxLength={3}
                  value={institutionNumber}
                  onChangeText={setInstitutionNumber}
                  onFocus={() => setFocusedField("institution")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          </View>
        )}

        {system === "SORT" && (
          <>
            <Text style={styles.inputLabel}>Sort Code</Text>
            <View style={[styles.inputWrapper, focusedField === "sort" && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 12-34-56"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={8}
                value={sortCode}
                onChangeText={setSortCode}
                onFocus={() => setFocusedField("sort")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </>
        )}

        {system === "SWIFT" && (
          <>
            <Text style={styles.inputLabel}>BIC / SWIFT code</Text>
            <View style={[styles.inputWrapper, focusedField === "swift" && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. BOFAUS3NXXX"
                placeholderTextColor="#A0AEC0"
                autoCapitalize="characters"
                value={swiftCode}
                onChangeText={setSwiftCode}
                onFocus={() => setFocusedField("swift")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </>
        )}
      </>
    );
  };

  // Filter countries list by search text
  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

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
        <Text style={styles.title}>{editCard ? "Edit Payout Account" : "Add Payout Account"}</Text>
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
          <Text style={styles.subtitle}>{editCard ? "Update your payout bank account details" : "Payouts are sent to your bank account"}</Text>

          {/* Country Selector */}
          <Text style={styles.inputLabel}>Country</Text>
          <TouchableOpacity
            style={styles.dropdownSelector}
            activeOpacity={0.8}
            onPress={() => setCountryModalVisible(true)}
          >
            <View style={styles.dropdownLeft}>
              <Text style={styles.flagIcon}>{selectedCountry.flag}</Text>
              <Text style={styles.dropdownValueText}>{selectedCountry.name}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#AEAEB2" />
          </TouchableOpacity>

          {/* Transfer Method Selector */}
          <Text style={styles.inputLabel}>Transfer Method</Text>
          <View
            style={[
              styles.dropdownSelector,
              {
                borderColor: "#E9D5FF",
                backgroundColor: "#FAF5FF",
              },
            ]}
          >
            <Text style={[styles.dropdownValueText, { color: Colors.primary }]}>
              {selectedMethod.name}
            </Text>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyBadgeText}>
                {getCurrencyCode(selectedCountry.name, selectedCountry.currency)}
              </Text>
            </View>
          </View>

          {/* Bank Details Section */}
          <Text style={styles.sectionHeader}>Bank Details</Text>

          {/* Account Holder Name */}
          <Text style={styles.inputLabel}>Account Holder Name</Text>
          <View
            style={[
              styles.inputWrapper,
              focusedField === "holder" && styles.inputWrapperFocused,
            ]}
          >
            <TextInput
              style={styles.textInput}
              placeholder="Enter account holder name"
              placeholderTextColor="#A0AEC0"
              value={holderName}
              onChangeText={setHolderName}
              onFocus={() => setFocusedField("holder")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Bank Name */}
          <Text style={styles.inputLabel}>Bank Name</Text>
          <View
            style={[
              styles.inputWrapper,
              focusedField === "bankName" && styles.inputWrapperFocused,
            ]}
          >
            <TextInput
              style={styles.textInput}
              placeholder="Enter bank name"
              placeholderTextColor="#A0AEC0"
              value={bankName}
              onChangeText={setBankName}
              onFocus={() => setFocusedField("bankName")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Country-Specific Custom Bank Fields */}
          {renderDynamicBankFields()}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Save Payout Details"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Your bank details are secure and encrypted
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 1. Country Selection Bottom Sheet Modal (Lists all countries with Search) */}
      <Modal visible={countryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.bottomSheetContainer, { maxHeight: "75%" }]}>
            <View style={styles.bsHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bsTitle}>Select Country</Text>
                <Text style={styles.bsSubtitle}>Choose payout bank country destination</Text>
              </View>
              <TouchableOpacity onPress={() => { setCountryModalVisible(false); setCountrySearch(""); }}>
                <MaterialIcons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>

            {/* Search Country Input */}
            <View style={styles.searchBarWrapper}>
              <Ionicons name="search" size={18} color="#8E8E93" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInputField}
                placeholder="Search country..."
                placeholderTextColor="#AEAEB2"
                value={countrySearch}
                onChangeText={setCountrySearch}
                clearButtonMode="while-editing"
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {filteredCountries.map((item) => {
                const isSelected = selectedCountry.name === item.name;
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={styles.pickerItemRow}
                    onPress={() => handleCountrySelect(item)}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={styles.flagIconLarge}>{item.flag}</Text>
                      <Text style={styles.pickerItemNameText}>{item.name}</Text>
                    </View>
                    <MaterialIcons
                      name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
                      size={22}
                      color={isSelected ? Colors.primary : "#D1D1D6"}
                    />
                  </TouchableOpacity>
                );
              })}
              {filteredCountries.length === 0 && (
                <Text style={styles.noCountryText}>No countries match search.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Transfer Method Selection Bottom Sheet */}
      <Modal visible={methodModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bsHeader}>
              <View>
                <Text style={styles.bsTitle}>Transfer Method</Text>
                <Text style={styles.bsSubtitle}>Select preferred payout channel</Text>
              </View>
              <TouchableOpacity onPress={() => setMethodModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
              {(TRANSFER_METHODS_BY_SYSTEM[selectedCountry.system] || TRANSFER_METHODS_BY_SYSTEM.SWIFT).map((item) => {
                const isSelected = selectedMethod.name === item.name;
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={styles.pickerItemRow}
                    onPress={() => {
                      setSelectedMethod(item);
                      setMethodModalVisible(false);
                    }}
                  >
                    <Text style={styles.pickerItemNameText}>{item.name}</Text>
                    <MaterialIcons
                      name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
                      size={22}
                      color={isSelected ? Colors.primary : "#D1D1D6"}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  subtitle: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
    marginVertical: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E93",
    fontFamily: "Poppins_500Medium",
    marginTop: 12,
    marginBottom: 8,
  },
  dropdownSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flagIcon: {
    fontSize: 20,
  },
  dropdownValueText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
    fontFamily: "Poppins_500Medium",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    marginTop: 24,
    marginBottom: 16,
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
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
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
  footerText: {
    fontSize: 12,
    color: "#AEAEB2",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 16,
  },
  // Bottom Sheet Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomSheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: "55%",
  },
  bsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  bsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  bsSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    marginBottom: 16,
  },
  searchInputField: {
    flex: 1,
    fontSize: 14,
    color: "#1C1C1E",
    fontFamily: "Poppins_400Regular",
  },
  pickerItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  flagIconLarge: {
    fontSize: 24,
  },
  pickerItemNameText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
    fontFamily: "Poppins_500Medium",
    marginLeft: 12,
  },
  noCountryText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Poppins_400Regular",
  },
  currencySymbolBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.lightPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  currencySymbolBadgeText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: "#A0AEC0",
    shadowOpacity: 0,
    elevation: 0,
  },
  inputWrapperError: {
    borderColor: "#E53E3E",
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: -8,
    marginBottom: 12,
  },
  currencyBadge: {
    backgroundColor: Colors.white,
    borderColor: "#E9D5FF",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  currencyBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
    fontFamily: "Poppins_500Medium",
  },
});
