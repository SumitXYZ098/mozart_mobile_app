import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { useNavigation } from "@react-navigation/native";
import { getAllBankDetails, deleteBankDetails, updateBankDetails } from "@/api/userApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePaymentStore } from "@/stores/usePaymentStore";
import { storageAPI } from "@/utils/storage";
import { toast } from "@/stores/useToastStore";

const COUNTRY_FLAGS: Record<string, string> = {
  "India": "🇮🇳", "United States": "🇺🇸", "Canada": "🇨🇦", "United Kingdom": "🇬🇧",
  "Germany": "🇩🇪", "France": "🇫🇷", "Italy": "🇮🇹", "Spain": "🇪🇸",
  "Netherlands": "🇳🇱", "Belgium": "🇧🇪", "Switzerland": "🇨🇭", "Australia": "🇦🇺",
  "Japan": "🇯🇵", "China": "🇨🇳", "Brazil": "🇧🇷", "Mexico": "🇲🇽",
  "South Africa": "🇿🇦", "Singapore": "🇸🇬", "United Arab Emirates": "🇦🇪",
  "Saudi Arabia": "🇸🇦", "New Zealand": "🇳🇿", "Sweden": "🇸🇪", "Norway": "🇳🇴",
  "Denmark": "🇩🇰", "Finland": "🇫🇮", "Ireland": "🇮🇪", "Austria": "🇦🇹",
  "Portugal": "🇵🇹", "Poland": "🇵🇱", "Turkey": "🇹🇷", "Russia": "🇷🇺",
  "South Korea": "🇰🇷", "Hong Kong": "🇭🇰", "Malaysia": "🇲🇾", "Thailand": "🇹🇭",
  "Indonesia": "🇮🇩", "Philippines": "🇵🇭", "Vietnam": "🇻🇳", "Egypt": "🇪🇬",
  "Nigeria": "🇳🇬", "Kenya": "🇰🇪", "Argentina": "🇦🇷", "Colombia": "🇨🇴",
  "Chile": "🇨🇱", "Peru": "🇵🇪", "Bouvet Island": "🇳🇴",
};

const countryFlag = (nameOrCode: string): string => {
  if (!nameOrCode) return "🏳️";
  const normalized = nameOrCode.trim();
  if (COUNTRY_FLAGS[normalized]) {
    return COUNTRY_FLAGS[normalized];
  }
  const matchedKey = Object.keys(COUNTRY_FLAGS).find(
    (k) => k.toLowerCase() === normalized.toLowerCase()
  );
  if (matchedKey) {
    return COUNTRY_FLAGS[matchedKey];
  }
  if (normalized.length === 2) {
    try {
      const codePoints = normalized
        .toUpperCase()
        .split("")
        .map((c) => 127397 + c.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return "🏳️";
    }
  }
  return "🏳️";
};

const COUNTRY_NAMES: Record<string, string> = {
  IN: "India", US: "United States", GB: "United Kingdom", DE: "Germany",
  FR: "France", CA: "Canada", AU: "Australia", JP: "Japan", CN: "China",
  BR: "Brazil", MX: "Mexico", SG: "Singapore", AE: "United Arab Emirates",
  SA: "Saudi Arabia", NZ: "New Zealand", SE: "Sweden", NO: "Norway",
  DK: "Denmark", FI: "Finland", NL: "Netherlands", BE: "Belgium",
  CH: "Switzerland", IT: "Italy", ES: "Spain", IE: "Ireland",
  AT: "Austria", PT: "Portugal", PL: "Poland", TR: "Turkey",
  RU: "Russia", KR: "South Korea", HK: "Hong Kong", MY: "Malaysia",
  TH: "Thailand", ID: "Indonesia", PH: "Philippines", VN: "Vietnam",
  EG: "Egypt", NG: "Nigeria", KE: "Kenya", AR: "Argentina",
  CO: "Colombia", CL: "Chile", PE: "Peru", ZA: "South Africa", BV: "Bouvet Island",
};

interface BankAccount {
  id: number;
  country: string;
  currency: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  iban: string | null;
  swift_code: string | null;
  additional_details: Record<string, any>;
  setDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MenuState {
  visible: boolean;
  accountId: number | null;
  isDefault: boolean;
}

export default function PayoutBankAccountsScreen() {
  const navigation = useNavigation<any>();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [menu, setMenu] = useState<MenuState>({ visible: false, accountId: null, isDefault: false });

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllBankDetails();
      if (list && list.length > 0) {
        const sorted = [...list].sort(
          (a: BankAccount, b: BankAccount) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const hasDefault = sorted.some((acc: BankAccount) => acc.setDefault === true);
        if (!hasDefault && sorted.length > 0) {
          try {
            await updateBankDetails(sorted[0].id, { setDefault: true });
            sorted[0].setDefault = true;
          } catch (_) {}
        }
        setAccounts(sorted);
      } else {
        setAccounts([]);
      }
    } catch (e) {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const openMenu = (accountId: number, isDefault: boolean) => {
    setMenu({ visible: true, accountId, isDefault });
  };

  const closeMenu = (cb?: () => void) => {
    setMenu({ visible: false, accountId: null, isDefault: false });
    cb && cb();
  };

  const handleSetDefault = (accountId: number) => {
    closeMenu(async () => {
      setActionLoading(accountId);
      try {
        for (const acc of accounts) {
          if (acc.id === accountId && !acc.setDefault) {
            await updateBankDetails(acc.id, { setDefault: true });
          } else if (acc.id !== accountId && acc.setDefault) {
            await updateBankDetails(acc.id, { setDefault: false });
          }
        }
        setAccounts((prev) => prev.map((acc) => ({ ...acc, setDefault: acc.id === accountId })));
        await syncBankCardsToStore();
        toast.success("Default bank account updated!");
      } catch (e: any) {
        Alert.alert("Error", "Failed to update default account. Please try again.");
      } finally {
        setActionLoading(null);
      }
    });
  };

  const handleDelete = (accountId: number, isDefault: boolean) => {
    closeMenu(() => {
      if (isDefault) {
        Alert.alert(
          "Cannot Delete Default Account",
          "This is your default payout account. Please set another account as default before deleting this one.",
          [{ text: "OK", style: "default" }]
        );
        return;
      }
      Alert.alert(
        "Delete Bank Account",
        "Are you sure you want to remove this bank account? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setActionLoading(accountId);
              try {
                await deleteBankDetails(accountId);
                setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
                await syncBankCardsToStore();
                toast.success("Bank account removed.");
              } catch (e: any) {
                const errMsg = e.response?.data?.error?.message || e.response?.data?.message || e.message;
                Alert.alert("Delete Failed", errMsg || "Could not delete bank account.");
              } finally {
                setActionLoading(null);
              }
            },
          },
        ]
      );
    });
  };

  const syncBankCardsToStore = async () => {
    try {
      const fresh = await getAllBankDetails();
      const currentCards = usePaymentStore.getState().cards;
      let updatedCards = currentCards.filter((c) => !c.isBankAccount);
      if (fresh && fresh.length > 0) {
        for (const resp of fresh) {
          const bankCard = {
            id: `card-bank-${resp.id}`,
            cardHolder: resp.account_holder_name || "Bank Account",
            cardNumber: (resp.account_number || resp.iban || "0000000000000000").replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim(),
            expiryDate: "12/29",
            cvv: "123",
            isPrimary: resp.setDefault === true,
            enableAutopay: true,
            isBankAccount: true,
            bankDetailsId: resp.id,
            bankName: resp.bank_name || "Bank",
          };
          updatedCards = [bankCard, ...updatedCards];
        }
      }
      const { user } = useAuthStore.getState();
      const userId = user?.id || "guest";
      usePaymentStore.setState({ cards: updatedCards });
      await storageAPI.setItem(`user_saved_cards_${userId}`, JSON.stringify(updatedCards));
    } catch (_) {}
  };

  const maskAccountNumber = (num: string | null) => {
    if (!num) return "••••";
    const cleaned = num.replace(/\s/g, "");
    return `••••  ${cleaned.slice(-4)}`;
  };

  const getExtraDetail = (acc: BankAccount) => {
    if (acc.additional_details?.ifsc_code) return { label: "IFSC", value: acc.additional_details.ifsc_code };
    if (acc.swift_code) return { label: "SWIFT", value: acc.swift_code };
    if (acc.iban) return { label: "IBAN", value: `••••${acc.iban.slice(-6)}` };
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Bank Accounts</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {accounts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="business-outline" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Bank Accounts</Text>
              <Text style={styles.emptySubtitle}>Add a payout bank account to get started.</Text>
              <TouchableOpacity style={styles.addFirstBtn} onPress={() => navigation.navigate("PayoutDetails")} activeOpacity={0.8}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addFirstBtnText}>Add Bank Account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>{accounts.length} bank account{accounts.length !== 1 ? "s" : ""} saved</Text>

              {accounts.map((acc) => {
                const flag = countryFlag(acc.country);
                const countryName = COUNTRY_NAMES[acc.country] || acc.country;
                const extra = getExtraDetail(acc);
                const isLoading = actionLoading === acc.id;

                return (
                  <View key={acc.id} style={[styles.accountCard, acc.setDefault && styles.accountCardDefault]}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <View style={styles.flagWrapper}>
                          <Text style={styles.flagText}>{flag}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.bankNameRow}>
                            <Text style={styles.bankName} numberOfLines={1}>
                              {acc.bank_name ? acc.bank_name.charAt(0).toUpperCase() + acc.bank_name.slice(1) : "Bank Account"}
                            </Text>
                            {acc.setDefault && (
                              <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>Default</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.currencyText}>({acc.currency})</Text>
                        </View>
                      </View>
                      {isLoading ? (
                        <ActivityIndicator color={Colors.primary} size="small" style={{ paddingRight: 4 }} />
                      ) : (
                        <TouchableOpacity
                          style={styles.menuBtn}
                          onPress={() => openMenu(acc.id, acc.setDefault)}
                          activeOpacity={0.7}
                          hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                        >
                          <MaterialIcons name="more-vert" size={22} color="#6B7280" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.cardDetails}>
                      <View style={styles.detailCol}>
                        <Text style={styles.detailLabel}>ACCOUNT HOLDER</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>
                          {acc.account_holder_name ? acc.account_holder_name.charAt(0).toUpperCase() + acc.account_holder_name.slice(1) : "—"}
                        </Text>
                      </View>
                      <View style={styles.detailCol}>
                        <Text style={styles.detailLabel}>ACCOUNT NUMBER</Text>
                        <Text style={styles.detailValue}>{maskAccountNumber(acc.account_number)}</Text>
                      </View>
                    </View>

                    {extra && (
                      <View style={[styles.cardDetails, { marginTop: 8 }]}>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>{extra.label}</Text>
                          <Text style={styles.detailValue}>{extra.value}</Text>
                        </View>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>COUNTRY</Text>
                          <Text style={styles.detailValue} numberOfLines={1}>{countryName}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}

              <TouchableOpacity style={styles.addMoreBtn} activeOpacity={0.8} onPress={() => navigation.navigate("PayoutDetails")}>
                <View style={styles.addMoreLeft}>
                  <View style={styles.addMoreIconWrapper}>
                    <Ionicons name="add" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.addMoreText}>Add Another Bank Account</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      <Modal
        visible={menu.visible}
        transparent
        animationType="slide"
        onRequestClose={() => closeMenu()}
      >
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => closeMenu()}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>Account Options</Text>
            <Text style={styles.sheetSubtitle}>Manage your saved bank account details</Text>

            <TouchableOpacity
              style={[styles.sheetItem, menu.isDefault && styles.sheetItemDisabled]}
              activeOpacity={menu.isDefault ? 1 : 0.7}
              onPress={() => {
                if (!menu.isDefault && menu.accountId !== null) {
                  handleSetDefault(menu.accountId);
                }
              }}
            >
              <View style={[styles.sheetIconWrapper, { backgroundColor: menu.isDefault ? "#D1FAE5" : "#FFF7E6" }]}>
                <Ionicons
                  name={menu.isDefault ? "checkmark-circle" : "star"}
                  size={20}
                  color={menu.isDefault ? "#065F46" : "#F59E0B"}
                />
              </View>
              <View style={styles.sheetTextWrapper}>
                <Text style={[styles.sheetItemText, menu.isDefault && styles.sheetItemTextDisabled]}>
                  {menu.isDefault ? "Default Payout Account" : "Set As Default"}
                </Text>
                <Text style={styles.sheetItemDesc}>
                  {menu.isDefault ? "All payouts are currently sent to this account" : "Make this bank account your primary payout target"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetItem}
              activeOpacity={0.7}
              onPress={() => {
                if (menu.accountId !== null) {
                  handleDelete(menu.accountId, menu.isDefault);
                }
              }}
            >
              <View style={[styles.sheetIconWrapper, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </View>
              <View style={styles.sheetTextWrapper}>
                <Text style={[styles.sheetItemText, { color: "#EF4444" }]}>Delete Account</Text>
                <Text style={styles.sheetItemDesc}>Permanently remove this bank account</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetCancelBtn} activeOpacity={0.8} onPress={() => closeMenu()}>
              <Text style={styles.sheetCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8FA" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backButton: { backgroundColor: "#F5F5F7", borderRadius: 10, padding: 8 },
  title: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", fontFamily: "PlusJakartaSans_700Bold" },
  placeholder: { width: 38 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: { padding: 20, paddingBottom: 60, gap: 14 },
  subtitle: { fontSize: 13, color: "#6B7280", fontFamily: "Poppins_400Regular", marginBottom: 4 },

  accountCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 2, borderWidth: 1.5, borderColor: "#F0F0F5",
  },
  accountCardDefault: { borderColor: `${Colors.primary}40`, shadowColor: Colors.primary, shadowOpacity: 0.10 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  flagWrapper: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  flagText: { fontSize: 22 },
  bankNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  bankName: { fontSize: 15, fontWeight: "700", color: "#1A1A1A", fontFamily: "PlusJakartaSans_700Bold" },
  defaultBadge: { backgroundColor: "#D1FAE5", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  defaultBadgeText: { fontSize: 10, fontWeight: "700", color: "#065F46", fontFamily: "PlusJakartaSans_700Bold" },
  currencyText: { fontSize: 12, color: Colors.primary, fontFamily: "Poppins_400Regular", marginTop: 2 },
  menuBtn: { padding: 4 },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },
  cardDetails: { flexDirection: "row", gap: 12 },
  detailCol: { flex: 1, gap: 3 },
  detailLabel: { fontSize: 9, color: "#9CA3AF", fontFamily: "Poppins_400Regular", letterSpacing: 0.5, textTransform: "uppercase" },
  detailValue: { fontSize: 13, fontWeight: "600", color: "#374151", fontFamily: "PlusJakartaSans_700Bold" },

  addMoreBtn: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: Colors.lightPrimary, padding: 16, borderRadius: 16, marginTop: 4,
  },
  addMoreLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  addMoreIconWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  addMoreText: { fontSize: 14, fontWeight: "600", color: Colors.primary, fontFamily: "Poppins_500Medium" },

  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.lightPrimary, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", fontFamily: "PlusJakartaSans_700Bold" },
  emptySubtitle: { fontSize: 13, color: "#6B7280", fontFamily: "Poppins_400Regular", textAlign: "center" },
  addFirstBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  addFirstBtnText: { fontSize: 14, fontWeight: "700", color: "#fff", fontFamily: "PlusJakartaSans_700Bold" },

  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheetContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
    width: "100%",
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 24,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 16,
  },
  sheetItemDisabled: {
    opacity: 0.8,
  },
  sheetIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTextWrapper: {
    flex: 1,
  },
  sheetItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  sheetItemTextDisabled: {
    color: "#065F46",
  },
  sheetItemDesc: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    marginTop: 2,
  },
  sheetCancelBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  sheetCancelBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});

