import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Rect, Path } from "react-native-svg";
import { usePaymentStore, Card } from "@/stores/usePaymentStore";
import { deleteBankDetails, getBankDetails } from "@/api/userApi";
import { storageAPI } from "@/utils/storage";

// Golden card chip SVG representation
const CardChip = () => (
  <Svg width={34} height={24} viewBox="0 0 30 22" fill="none">
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

export default function SavedCardsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { cards, loadPaymentState, removeCard } = usePaymentStore();

  const payoutHolderName = route.params?.payoutHolderName;
  const payoutAccountNumber = route.params?.payoutAccountNumber;

  useEffect(() => {
    loadPaymentState();
  }, []);

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
                usePaymentStore.setState({ bankDetails: null });
                await storageAPI.removeItem("user_bank_details");
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
                      }
                    }
                  ]
                );
                return;
              }
            }
            await removeCard(card.id);
          },
        },
      ]
    );
  };

  const renderCardItem = ({ item }: { item: Card }) => {
    if (item.isBankAccount) {
      let codeLabel = "IFSC";
      let codeValue = item.ifscCode;

      if (item.system === "ABA") {
        codeLabel = "ROUTING";
        codeValue = item.routingNumber;
      } else if (item.system === "TRANSIT") {
        codeLabel = "TRANSIT/INST";
        codeValue = `${item.transitNumber}-${item.institutionNumber}`;
      } else if (item.system === "SORT") {
        codeLabel = "SORT CODE";
        codeValue = item.sortCode;
      } else if (item.system === "IBAN") {
        codeLabel = "IBAN";
        codeValue = item.iban;
      } else if (item.system === "SWIFT") {
        codeLabel = "SWIFT";
        codeValue = item.swiftCode;
      }

      return (
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={["#0F172A", "#2563EB"]} // premium dark blue gradient for bank accounts
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.creditCard}
          >
            {/* Card Top Row */}
            <View style={styles.cardHeader}>
              <View style={styles.chipBrand}>
                <CardChip />
                <Text style={styles.brandText} numberOfLines={1}>
                  {item.bankName ? item.bankName.toUpperCase() : "BANK ACCOUNT"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => navigation.navigate("PayoutDetails", { editCard: item })}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={18} color="rgba(255,255,255,0.85)" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleDeleteCard(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.85)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Card Number (Account Number) */}
            <Text
              style={[styles.cardNumberText, { fontSize: 22 }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {maskCardNumber(item.cardNumber)}
            </Text>

            {/* Card Details Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.footerCol}>
                <Text style={styles.footerLabel}>ACCOUNT HOLDER</Text>
                <Text style={styles.footerValue} numberOfLines={1}>
                  {item.cardHolder.toUpperCase()}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      );
    }

    return (
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={["#4916A0", "#110825"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.creditCard}
        >
          {/* Card Top Row */}
          <View style={styles.cardHeader}>
            <View style={styles.chipBrand}>
              <CardChip />
              <Text style={styles.brandText}>AMOZART PAY</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              {item.enableAutopay && (
                <Ionicons name="checkmark-circle" size={22} color="#10B981" />
              )}
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => navigation.navigate("AddNewCard", { cardId: item.id })}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={18} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => handleDeleteCard(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={18} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Card Number */}
          <Text
            style={styles.cardNumberText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {maskCardNumber(item.cardNumber)}
          </Text>

          {/* Card Details Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>HOLDER</Text>
              <Text style={styles.footerValue} numberOfLines={1}>
                {item.cardHolder.toUpperCase()}
              </Text>
            </View>

            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>CVV</Text>
              <Text style={styles.footerValue}>•••</Text>
            </View>

            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>EXPIRY</Text>
              <Text style={styles.footerValue}>{item.expiryDate}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const payoutBankCards = cards.filter((c) => c.isBankAccount);
  const creditCards = cards.filter((c) => !c.isBankAccount);

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
        <Text style={styles.title}>Saved Cards</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>Your cards are secure and encrypted</Text>

        {/* 1. Payout Bank Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.cardListSectionHeader}>Payout Bank Account</Text>
          {payoutBankCards.length > 0 ? (
            <FlatList
              data={payoutBankCards}
              keyExtractor={(item) => item.id}
              renderItem={renderCardItem}
              scrollEnabled={false}
              contentContainerStyle={styles.cardsList}
            />
          ) : (
            <View style={[styles.emptyContainer, { marginBottom: 10 }]}>
              <Ionicons name="business-outline" size={48} color={Colors.gray} />
              <Text style={styles.emptyText}>No payout bank account saved yet.</Text>
            </View>
          )}

          {/* Add / Edit Payout Details Button directly under Payout section */}
          <TouchableOpacity
            style={[styles.addNewCardButton, { marginTop: 10 }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("PayoutDetails")}
          >
            <View style={styles.addButtonLeft}>
              <View style={styles.plusIconWrapper}>
                <Ionicons
                  name={payoutBankCards.length > 0 ? "create-outline" : "add"}
                  size={18}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.addNewCardText}>
                {payoutBankCards.length > 0 ? "Payout Bank Details" : "Add Payout Bank Details"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 2. Credit Cards Section */}
        <View style={[styles.sectionContainer, { marginTop: 24 }]}>
          <Text style={styles.cardListSectionHeader}>Credit Cards</Text>
          <FlatList
            data={creditCards}
            keyExtractor={(item) => item.id}
            renderItem={renderCardItem}
            scrollEnabled={false}
            contentContainerStyle={styles.cardsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="card-outline" size={48} color={Colors.gray} />
                <Text style={styles.emptyText}>No credit cards saved yet.</Text>
              </View>
            }
          />

          {/* Add New Card Button directly under Credit Cards section */}
          <TouchableOpacity
            style={[styles.addNewCardButton, { marginTop: 14 }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("AddNewCard", {
              payoutHolderName,
              payoutAccountNumber,
            })}
          >
            <View style={styles.addButtonLeft}>
              <View style={styles.plusIconWrapper}>
                <Ionicons name="add" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.addNewCardText}>Add New Card</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  cardListSectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 8,
  },
  sectionContainer: {
    marginVertical: 8,
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
    color: "#8E8E93",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginVertical: 12,
  },
  cardsList: {
    gap: 16,
    marginVertical: 16,
  },
  cardContainer: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  creditCard: {
    padding: 24,
    aspectRatio: 1.58, // Standard credit card ratio
    justifyContent: "space-between",
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chipBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 1.2,
  },
  cardTypeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
    opacity: 0.9,
    letterSpacing: 1,
  },
  primaryBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  primaryBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  cardNumberText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 3,
    textAlign: "center",
    marginVertical: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20,
  },
  footerCol: {
    gap: 4,
  },
  footerLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 9,
    fontFamily: "Poppins_400Regular",
    letterSpacing: 0.5,
  },
  footerValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  actionButtonsContainer: {
    position: "absolute",
    top: 24,
    right: 24,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  actionIconBtn: {
    padding: 4,
  },
  addNewCardButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.lightPrimary,
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  addButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  plusIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  addNewCardText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
    fontFamily: "Poppins_500Medium",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#8E8E93",
    fontFamily: "Poppins_400Regular",
  },
});
