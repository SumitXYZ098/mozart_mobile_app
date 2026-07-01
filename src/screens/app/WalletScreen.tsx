import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { LineChart } from "react-native-gifted-charts";
import { Colors } from "@/theme/colors";
import { apiClient } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoints";
import { usePaymentStore } from "@/stores/usePaymentStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type EarningsRange = "1M" | "3M" | "6M";

interface EarningsPoint {
  month: string;
  total: number;
}

interface PayoutRequest {
  id: number;
  amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  createdAt: string;
  reviewedBy?: string;
  reviewedOn?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColor = (status: string) => {
  switch (status) {
    case "approved":
    case "paid":
      return "#10B981";
    case "rejected":
      return "#EF4444";
    default:
      return "#F59E0B";
  }
};

const statusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WalletScreen() {
  const navigation = useNavigation<any>();
  const { cards } = usePaymentStore();

  const [range, setRange] = useState<EarningsRange>("1M");
  const [earningsData, setEarningsData] = useState<EarningsPoint[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([]);

  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [selectedBankCardId, setSelectedBankCardId] = useState<string | null>(null);
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bank accounts from payment store
  const bankCards = cards.filter((c) => c.isBankAccount);

  // ── Data Fetchers ──────────────────────────────────────────────────────────

  const fetchEarnings = useCallback(async (r: EarningsRange) => {
    setLoadingChart(true);
    try {
      const res = await apiClient.get(ENDPOINTS.TOTAL_EARNINGS(r));
      const data: EarningsPoint[] = res.data?.data || res.data || [];
      setEarningsData(data);
      const total = data.reduce((sum: number, p: EarningsPoint) => sum + (p.total || 0), 0);
      setTotalEarnings(total);
    } catch (e) {
      setEarningsData([]);
      setTotalEarnings(0);
    } finally {
      setLoadingChart(false);
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const res = await apiClient.get(ENDPOINTS.AVAILABLE_WITHDRAW_BALANCE);
      setAvailableBalance(res.data?.balance ?? res.data?.data?.balance ?? 0);
    } catch {
      setAvailableBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await apiClient.get(ENDPOINTS.PAYOUT_REQUESTS);
      setPayoutHistory(res.data?.data || res.data || []);
    } catch {
      setPayoutHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchEarnings(range), fetchBalance(), fetchHistory()]);
    setRefreshing(false);
  }, [range]);

  useEffect(() => {
    fetchEarnings(range);
  }, [range]);

  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, []);

  // ── Payout Request Submit ──────────────────────────────────────────────────

  const handleSubmitPayout = async () => {
    if (!selectedBankCardId) {
      Alert.alert("Select Bank Account", "Please select a bank account to proceed.");
      return;
    }
    if (availableBalance < 50) {
      Alert.alert(
        "Insufficient Balance",
        `Minimum payout is $50.00. Your available balance is ${formatCurrency(availableBalance)}.`
      );
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post(ENDPOINTS.PAYOUT_REQUESTS, {
        amount: availableBalance,
        bank_card_id: selectedBankCardId,
      });
      setPayoutModalVisible(false);
      Alert.alert("Success", "Your payout request has been submitted!");
      await Promise.all([fetchBalance(), fetchHistory()]);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || "Unknown error";
      Alert.alert("Request Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Chart data formatting ──────────────────────────────────────────────────

  const chartLineData = earningsData.map((p) => ({
    value: p.total,
    label: p.month ? p.month.slice(0, 3) : "",
    dataPointText: "",
  }));

  const rangeLabel =
    range === "1M" ? "1 Month" : range === "3M" ? "3 Months" : "6 Months";

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Royalties Overview</Text>
        {/* Range Selector */}
        <View style={styles.rangeRow}>
          {(["1M", "3M", "6M"] as EarningsRange[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
              onPress={() => setRange(r)}
              activeOpacity={0.8}
            >
              <Text style={[styles.rangeBtnText, range === r && styles.rangeBtnTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />
        }
      >
        {/* ── Earnings Chart Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Total Earnings</Text>

          {loadingChart ? (
            <View style={styles.chartLoader}>
              <ActivityIndicator color={Colors.primary} size="large" />
            </View>
          ) : chartLineData.length > 0 ? (
            <LineChart
              data={chartLineData}
              height={180}
              width={320}
              curved
              isAnimated
              animationDuration={800}
              color={Colors.primary}
              thickness={2}
              startFillColor={`${Colors.primary}33`}
              endFillColor="transparent"
              areaChart
              hideDataPoints={false}
              dataPointsColor={Colors.primary}
              dataPointsRadius={4}
              xAxisLabelTextStyle={styles.chartAxisLabel}
              yAxisTextStyle={styles.chartAxisLabel}
              yAxisColor="transparent"
              xAxisColor="#E5E7EB"
              rulesColor="#F3F4F6"
              noOfSections={4}
              rulesType="solid"
              initialSpacing={20}
              endSpacing={20}
            />
          ) : (
            <View style={styles.chartEmpty}>
              <Ionicons name="bar-chart-outline" size={40} color="#D1D5DB" />
              <Text style={styles.chartEmptyText}>No earnings data available</Text>
            </View>
          )}

          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterLabel}>Monthly Report ({rangeLabel})</Text>
            <Text style={styles.chartFooterValue}>
              Total Earnings = {formatCurrency(totalEarnings)}
            </Text>
          </View>
        </View>

        {/* ── Available Balance Banner ── */}
        <LinearGradient
          colors={[Colors.primary, "#5B21B6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceBanner}
        >
          <View style={styles.balanceLeft}>
            <View style={styles.balanceIconWrapper}>
              <Ionicons name="business" size={24} color="#fff" />
            </View>
            <View>
              {loadingBalance ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.balanceAmount}>{formatCurrency(availableBalance)}</Text>
              )}
              <Text style={styles.balanceLabel}>Available To Withdraw</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.requestPayoutBtn}
            activeOpacity={0.85}
            onPress={() => {
              setSelectedBankCardId(bankCards[0]?.id || null);
              setPayoutModalVisible(true);
            }}
          >
            <Text style={styles.requestPayoutBtnText}>Request Payout</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Payout History ── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Payout History</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 1.4 }]}>Date</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Amount</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Reviewed By</Text>
          </View>

          {loadingHistory ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 24 }} />
          ) : payoutHistory.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Ionicons name="receipt-outline" size={36} color="#D1D5DB" />
              <Text style={styles.historyEmptyText}>No Payout Requests Yet</Text>
            </View>
          ) : (
            payoutHistory.map((item, idx) => (
              <View
                key={item.id}
                style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}
              >
                <Text style={[styles.tableCell, { flex: 1.4 }]}>
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {formatCurrency(item.amount)}
                </Text>
                <View style={{ flex: 1 }}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${statusColor(item.status)}18` },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusColor(item.status) }]}
                    >
                      {statusLabel(item.status)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.tableCell, { flex: 1.2 }]} numberOfLines={1}>
                  {item.reviewedBy || "—"}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Payout Request Modal ── */}
      <Modal
        visible={payoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPayoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <Text style={styles.modalTitle}>Withdraw Request</Text>

            {/* Available Balance display */}
            <View style={styles.modalBalanceBox}>
              <Text style={styles.modalBalanceLabel}>Available Balance</Text>
              <Text style={styles.modalBalanceAmount}>
                {formatCurrency(availableBalance)}
              </Text>
              <Text style={styles.modalMinimum}>Minimum Payout: $50.00</Text>
            </View>

            {/* Bank Account selector */}
            <Text style={styles.modalFieldLabel}>Bank Account</Text>

            {bankCards.length === 0 ? (
              <TouchableOpacity
                style={styles.noBankBtn}
                onPress={() => {
                  setPayoutModalVisible(false);
                  navigation.navigate("PayoutDetails");
                }}
              >
                <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                <Text style={styles.noBankBtnText}>Add a Payout Bank Account first</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => setBankDropdownOpen((v) => !v)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownTriggerText}>
                    {selectedBankCardId
                      ? (() => {
                          const c = bankCards.find((b) => b.id === selectedBankCardId);
                          return c
                            ? `${c.cardHolder} (****${c.cardNumber.slice(-4)})`
                            : "Select account";
                        })()
                      : "Select account"}
                  </Text>
                  <Ionicons
                    name={bankDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>

                {bankDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {bankCards.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.dropdownItem,
                          selectedBankCardId === c.id && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setSelectedBankCardId(c.id);
                          setBankDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selectedBankCardId === c.id && styles.dropdownItemTextActive,
                          ]}
                        >
                          {c.cardHolder} (****{c.cardNumber.slice(-4)})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setPayoutModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (submitting || bankCards.length === 0 || availableBalance < 50) &&
                    styles.submitBtnDisabled,
                ]}
                onPress={handleSubmitPayout}
                activeOpacity={0.85}
                disabled={submitting || bankCards.length === 0 || availableBalance < 50}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
  },
  headerBtn: {
    backgroundColor: "#F5F5F7",
    borderRadius: 10,
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    flex: 1,
    marginLeft: 10,
  },
  rangeRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  rangeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rangeBtnActive: {
    backgroundColor: Colors.primary,
  },
  rangeBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  rangeBtnTextActive: {
    color: "#fff",
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 14,
  },
  chartLoader: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  chartEmpty: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  chartEmptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  chartAxisLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  chartFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  chartFooterLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  chartFooterValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  // Balance Banner
  balanceBanner: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  balanceIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  balanceLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Poppins_400Regular",
    marginTop: 2,
  },
  requestPayoutBtn: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  requestPayoutBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  // Table
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    fontFamily: "PlusJakartaSans_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  tableRowEven: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 12,
    color: "#374151",
    fontFamily: "Poppins_400Regular",
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  historyEmpty: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  historyEmptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
    marginBottom: 20,
  },
  modalBalanceBox: {
    backgroundColor: `${Colors.primary}0D`,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  modalBalanceLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    marginBottom: 4,
  },
  modalBalanceAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  modalMinimum: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
  },
  modalFieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 8,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  dropdownTriggerText: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "Poppins_400Regular",
    flex: 1,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 4,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  dropdownItemActive: {
    backgroundColor: `${Colors.primary}12`,
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "Poppins_400Regular",
  },
  dropdownItemTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  noBankBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: `${Colors.primary}0D`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  noBankBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: "Poppins_400Regular",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
