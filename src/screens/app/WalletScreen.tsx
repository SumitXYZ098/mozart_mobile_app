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
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { LineChart } from "react-native-gifted-charts";
import { Colors } from "@/theme/colors";
import apiClient from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoints";
import { usePaymentStore } from "@/stores/usePaymentStore";
import { getAllBankDetails } from "@/api/userApi";
import { storageAPI } from "@/utils/storage";

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
  reviewedAt?: string;
  transactionReference?: string;
  rejectionReason?: string;
  user_payout_detail?: any;
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

const padEarningsData = (data: EarningsPoint[]): EarningsPoint[] => {
  if (data.length === 0) return [];
  if (data.length >= 6) return data;

  const padded = [...data];
  const lastPoint = data[data.length - 1];

  let lastDate: Date | null = null;
  const monthsAbbrev = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Try parsing "Dec 2025" style
  if (lastPoint.month) {
    const parts = lastPoint.month.split(" ");
    if (parts.length === 2) {
      const mIdx = monthsAbbrev.indexOf(parts[0]);
      const y = parseInt(parts[1], 10);
      if (mIdx !== -1 && !isNaN(y)) {
        lastDate = new Date(y, mIdx, 1);
      }
    }
  }

  // If not parsed, try default Date parse
  if (!lastDate && lastPoint.month) {
    const d = new Date(lastPoint.month);
    if (!isNaN(d.getTime())) {
      lastDate = d;
    }
  }

  if (!lastDate) {
    lastDate = new Date();
  }

  const pointsNeeded = 6 - data.length;
  for (let i = 1; i <= pointsNeeded; i++) {
    const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
    const mLabel = monthsAbbrev[nextDate.getMonth()];
    const yLabel = nextDate.getFullYear();
    const label = `${mLabel} ${yLabel}`;
    padded.push({
      month: label,
      total: 0,
    });
  }

  return padded;
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WalletScreen() {
  const navigation = useNavigation<any>();
  const { cards, loadPaymentState } = usePaymentStore();
  const { width: screenWidth } = Dimensions.get("window");

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
  const [payoutAmount, setPayoutAmount] = useState("");

  // History detail modal state
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<PayoutRequest | null>(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // Bank accounts from payment store
  const bankCards = cards.filter((c) => c.isBankAccount);

  // ── Data Fetchers ──────────────────────────────────────────────────────────

  const loadServerBankDetails = useCallback(async () => {
    try {
      const bankList = await getAllBankDetails();
      if (bankList && bankList.length > 0) {
        const currentCards = usePaymentStore.getState().cards;
        // Clean out any existing bank cards to replace them with the fresh user-owned bank accounts list
        let updatedCards = currentCards.filter(c => !c.isBankAccount);
        
        for (const resp of bankList) {
          const bankCard = {
            id: `card-bank-${resp.id}`,
            cardHolder: resp.account_holder_name || resp.accountHolderName || "Bank Account",
            cardNumber: (resp.account_number || resp.accountNumber || resp.iban || "0000 0000 0000 0000").replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim(),
            expiryDate: "12/29",
            cvv: "123",
            isPrimary: false,
            enableAutopay: true,
            isBankAccount: true,
            bankDetailsId: resp.id,
            bankName: resp.bank_name || resp.bankName || "Bank",
          };
          updatedCards = [bankCard, ...updatedCards];
        }

        usePaymentStore.setState({ cards: updatedCards });
        await storageAPI.setItem("user_saved_cards", JSON.stringify(updatedCards));
      }
    } catch (e) {
      console.warn("Failed to fetch bank details from server:", e);
    }
  }, []);

  const fetchEarnings = useCallback(async (r: EarningsRange) => {
    setLoadingChart(true);
    try {
    
      const res = await apiClient.get(ENDPOINTS.TOTAL_EARNINGS(r));
       
      let rawData = res.data?.data || res.data || [];
      if (!Array.isArray(rawData) && typeof rawData === "object" && rawData !== null) {
        const arrayKey = Object.keys(rawData).find(key => Array.isArray(rawData[key]));
        if (arrayKey) {
          rawData = rawData[arrayKey];
        } else {
          rawData = [];
        }
      }
      
      const data: EarningsPoint[] = Array.isArray(rawData)
        ? rawData.map((item: any) => {
            const fields = item && item.attributes ? { id: item.id, ...item.attributes } : item;
            return {
              month: fields.month || fields.label || fields.date || "",
              total: parseFloat(
                fields.total ?? 
                fields.earnings ?? 
                fields.totalEarnings ?? 
                fields.total_earnings ?? 
                fields.earnings_sum ?? 
                fields.value ?? 
                fields.amount ?? 
                fields.sum ?? 
                fields.royalty ?? 
                0
              ) || 0,
            };
          })
        : [];
        
       const total = data.reduce((sum: number, p: EarningsPoint) => sum + (p.total || 0), 0);
      setTotalEarnings(total);
      
      const paddedData = padEarningsData(data);
       setEarningsData(paddedData);
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
      setAvailableBalance(
        res.data?.availableBalance ?? 
        res.data?.balance ?? 
        res.data?.data?.availableBalance ?? 
        res.data?.data?.balance ?? 
        0
      );
    } catch (e) {
       setAvailableBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
       const res = await apiClient.get(ENDPOINTS.PAYOUT_REQUESTS);
       
      let rawData = res.data?.data || res.data || [];
      if (!Array.isArray(rawData) && typeof rawData === "object" && rawData !== null) {
        const arrayKey = Object.keys(rawData).find(key => Array.isArray(rawData[key]));
        if (arrayKey) {
          rawData = rawData[arrayKey];
        } else {
          rawData = [];
        }
      }
      
      const formattedData = Array.isArray(rawData)
        ? rawData
            .map((item: any) => (item && item.attributes ? { id: item.id, ...item.attributes } : item))
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
       setPayoutHistory(formattedData);
    } catch (e) {
       setPayoutHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchEarnings(range), fetchBalance(), fetchHistory()]);
    setRefreshing(false);
  }, [range, fetchEarnings, fetchBalance, fetchHistory]);

  useEffect(() => {
    fetchEarnings(range);
  }, [range, fetchEarnings]);

  useEffect(() => {
    loadPaymentState();
    loadServerBankDetails();
    fetchBalance();
    fetchHistory();
  }, [loadPaymentState, loadServerBankDetails, fetchBalance, fetchHistory]);

  // Auto-select the first bank account once loaded
  useEffect(() => {
    if (!selectedBankCardId && bankCards.length > 0) {
      setSelectedBankCardId(bankCards[0].id);
    }
  }, [bankCards, selectedBankCardId]);

  // ── Payout Request Submit ──────────────────────────────────────────────────

  const handleSubmitPayout = async () => {
    if (!selectedBankCardId) {
      Alert.alert("Select Bank Account", "Please select a bank account to proceed.");
      return;
    }
    
    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt < 50) {
      Alert.alert("Invalid Amount", "Minimum payout amount is $50.00.");
      return;
    }
    
    if (amt > availableBalance) {
      Alert.alert(
        "Insufficient Balance",
        `You cannot withdraw more than your available balance of ${formatCurrency(availableBalance)}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const selectedBankCard = bankCards.find((b) => b.id === selectedBankCardId);
      const bankDetailsId = selectedBankCard?.bankDetailsId;
      
      let resolvedBankDetailsId: any = bankDetailsId;
      if (!resolvedBankDetailsId && typeof selectedBankCardId === "string" && selectedBankCardId.startsWith("card-bank-")) {
        const parsedId = parseInt(selectedBankCardId.replace("card-bank-", ""), 10);
        if (!isNaN(parsedId)) {
          resolvedBankDetailsId = parsedId;
        }
      }

      const resolvedId = resolvedBankDetailsId;
      const arrayId = [resolvedId];

      const payoutPayload = {
        amount: amt,
        bank_card_id: resolvedId,
        bank_card: resolvedId,
        bank_cards: arrayId,
        user_payout_detail: resolvedId,
        user_payout_details: arrayId,
        payout_account: resolvedId,
        payout_accounts: arrayId,
        payout_account_id: resolvedId,
        bank_account: resolvedId,
        bank_account_id: resolvedId,
        bank_accounts: arrayId,
        payout_detail: resolvedId,
        payout_details: arrayId,
        userPayoutDetail: resolvedId,
        userPayoutDetails: arrayId,
        payoutAccount: resolvedId,
        payoutDetails: arrayId,
      };

      await apiClient.post(ENDPOINTS.PAYOUT_REQUESTS, {
        ...payoutPayload,
        data: payoutPayload,
      });
      setPayoutModalVisible(false);
      setPayoutAmount("");
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
    label: p.month || "",
    dataPointText: "",
  }));

  const rangeLabel =
    range === "1M" ? "1 Month" : range === "3M" ? "3 Months" : "6 Months";

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Royalties Overview</Text>
        <View style={{ width: 38, height: 38 }} />
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
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={[styles.cardSectionLabel, { marginBottom: 0 }]}>Total Earnings</Text>
            
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

          {loadingChart ? (
            <View style={styles.chartLoader}>
              <ActivityIndicator color={Colors.primary} size="large" />
            </View>
          ) : chartLineData.length > 0 ? (
            <LineChart
              data={chartLineData}
              height={180}
              width={screenWidth - 110}
              yAxisLabelWidth={35}
              spacing={65}
              initialSpacing={27}
              endSpacing={20}
              nestedScrollEnabled={true}
              disableScroll={false}
              isAnimated
              animationDuration={800}
              color={Colors.primary}
              thickness={2}
              strokeDashArray={[6, 4]}
              startFillColor={`${Colors.primary}22`}
              endFillColor="#ffffff"
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
              pointerConfig={{
                pointerStripColor: Colors.primary,
                pointerStripWidth: 1.5,
                strokeDashArray: [4, 4],
                pointerColor: Colors.primary,
                radius: 5,
                pointerLabelWidth: 0,
                pointerLabelHeight: 34,
                activatePointersOnLongPress: false,
                pointerLabelComponent: (items: any) => {
                  if (!items || items.length === 0) return null;
                  return (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        backgroundColor: '#ffffff',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                        elevation: 4,
                        borderWidth: 1.5,
                        borderColor: '#E5E7EB',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 50,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '800',
                          color: '#1A1A1A',
                          fontFamily: 'PlusJakartaSans_700Bold',
                        }}
                      >
                        {items[0].value}
                      </Text>
                    </View>
                  );
                },
              }}
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
              setPayoutAmount(availableBalance > 0 ? availableBalance.toString() : "");
              setPayoutModalVisible(true);
            }}
          >
            <Text style={styles.requestPayoutBtnText}>Request Payout</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Payout History ── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Payout History</Text>

          {/* Table Container with Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={{ width: 530 }}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: 90 }]}>Date</Text>
                <Text style={[styles.tableHeaderCell, { width: 85 }]}>Amount</Text>
                <Text style={[styles.tableHeaderCell, { width: 95 }]}>Status</Text>
                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Reviewed By</Text>
                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Reviewed On</Text>
                <Text style={[styles.tableHeaderCell, { width: 60, textAlign: "center" }]}>Action</Text>
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
                    <Text style={[styles.tableCell, { width: 90 }]}>
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                    <Text style={[styles.tableCell, { width: 85 }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                    <View style={{ width: 95 }}>
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
                    <Text style={[styles.tableCell, { width: 100 }]} numberOfLines={1}>
                      {item.reviewedBy || "—"}
                    </Text>
                    <Text style={[styles.tableCell, { width: 100 }]}>
                      {item.reviewedAt || item.reviewedOn
                        ? new Date(item.reviewedAt || item.reviewedOn!).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </Text>
                    <TouchableOpacity
                      style={{ width: 60, alignItems: "center", justifyContent: "center" }}
                      onPress={() => {
                        setSelectedHistoryItem(item);
                        setHistoryModalVisible(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="eye-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* ── Payout History Details Modal ── */}
      <Modal
        visible={historyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: "90%" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.modalTitle, { textAlign: "left", marginBottom: 4 }]}>Payout Details</Text>
                <Text style={{ fontSize: 11, color: "#6B7280", fontFamily: "Poppins_400Regular" }}>
                  View Complete Information About This Withdrawal Request
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setHistoryModalVisible(false)}
              >
                <Ionicons name="close" size={22} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {selectedHistoryItem && (() => {
              const item = selectedHistoryItem;
              const detail = item.user_payout_detail || {};
              const formattedDate = new Date(item.createdAt).toLocaleString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              });

              return (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Amount Panel */}
                  <View style={[styles.modalBalanceBox, { backgroundColor: `${statusColor(item.status)}0D`, paddingVertical: 20, alignItems: "center" }]}>
                    <Text style={styles.modalBalanceLabel}>Requested Amount</Text>
                    <Text style={[styles.modalBalanceAmount, { color: statusColor(item.status), fontSize: 32 }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor(item.status)}18`, marginTop: 8 }]}>
                      <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                        {statusLabel(item.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Request Information */}
                  <Text style={[styles.modalFieldLabel, { marginTop: 12 }]}>Request Information</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Requested On</Text>
                      <Text style={styles.detailValue}>{formattedDate}</Text>
                    </View>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Reviewed By</Text>
                      <Text style={styles.detailValue}>{item.reviewedBy || "Pending Review"}</Text>
                    </View>
                  </View>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Reviewed At</Text>
                      <Text style={styles.detailValue}>
                        {item.reviewedAt
                          ? new Date(item.reviewedAt).toLocaleDateString()
                          : "Not Reviewed Yet"}
                      </Text>
                    </View>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Reference Number</Text>
                      <Text style={styles.detailValue}>{item.transactionReference || "Not Assigned"}</Text>
                    </View>
                  </View>

                  {/* Payment Method */}
                  <Text style={[styles.modalFieldLabel, { marginTop: 16 }]}>Payment Method</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Bank Name</Text>
                      <Text style={styles.detailValue}>{detail.bank_name || "N/A"}</Text>
                    </View>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Account Number</Text>
                      <Text style={styles.detailValue}>
                        {detail.account_number
                          ? `****${detail.account_number.slice(-4)}`
                          : "****"}
                      </Text>
                    </View>
                  </View>

                  {/* Banner status */}
                  <View
                    style={[
                      styles.statusBanner,
                      {
                        backgroundColor:
                          item.status === "paid" || item.status === "approved"
                            ? "#D1FAE5"
                            : item.status === "rejected"
                            ? "#FEE2E2"
                            : "#FEF3C7",
                        borderColor:
                          item.status === "paid" || item.status === "approved"
                            ? "#10B981"
                            : item.status === "rejected"
                            ? "#EF4444"
                            : "#F59E0B",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBannerText,
                        {
                          color:
                            item.status === "paid" || item.status === "approved"
                              ? "#065F46"
                              : item.status === "rejected"
                              ? "#991B1B"
                              : "#92400E",
                        },
                      ]}
                    >
                      {item.status === "paid" || item.status === "approved"
                        ? "Your Payout Request Has Been Approved and Transferred."
                        : item.status === "rejected"
                        ? `Rejected: ${item.rejectionReason || "No reason provided."}`
                        : "Your Payout Request Is Awaiting Review."}
                    </Text>
                  </View>

                  {/* Close button */}
                  <TouchableOpacity
                    style={[styles.submitBtn, { marginTop: 24, paddingVertical: 12 }]}
                    onPress={() => setHistoryModalVisible(false)}
                  >
                    <Text style={styles.submitBtnText}>Close</Text>
                  </TouchableOpacity>
                </ScrollView>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* ── Payout Request Modal ── */}
      <Modal
        visible={payoutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPayoutModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
              >
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
                      navigation.navigate("ProfileTab", {
                        screen: "PayoutDetails",
                      });
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
                                ? `${c.bankName || c.cardHolder} (****${c.cardNumber.slice(-4)})`
                                : "Select Bank Account";
                            })()
                          : "Select Bank Account"}
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
                              {c.bankName || c.cardHolder} (****{c.cardNumber.slice(-4)})
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                )}

                {/* Amount input */}
                <Text style={[styles.modalFieldLabel, { marginTop: 16 }]}>Amount</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Enter payout amount"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                  value={payoutAmount}
                  onChangeText={setPayoutAmount}
                />

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
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    textAlign: "center",
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
    paddingBottom: 120,
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
    paddingHorizontal: 10,
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
    paddingHorizontal: 8,
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
    paddingHorizontal: 8,
  },
  tableRowEven: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
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
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: "100%",
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
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
  amountInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#374151",
    fontFamily: "Poppins_400Regular",
    backgroundColor: "#F9FAFB",
    marginTop: 8,
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
  modalCloseBtn: {
    padding: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  detailGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  detailGridCol: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailLabel: {
    fontSize: 9,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 11,
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
  },
  statusBanner: {
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
  },
  statusBannerText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    fontWeight: "600",
    lineHeight: 16,
  },
});
