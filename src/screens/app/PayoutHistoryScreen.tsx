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
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/theme/colors";
import apiClient from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/useAuthStore";

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
  currency?: string;
}

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

type FilterStatus = "all" | "pending" | "paid" | "rejected";

export default function PayoutHistoryScreen() {
  const navigation = useNavigation<any>();
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("all");

  // Modal state
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<PayoutRequest | null>(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await apiClient.get(
        `${ENDPOINTS.PAYOUT_REQUESTS}?populate=*&populate[user_payout_detail][populate]=*`
      );

      let rawData = res.data?.data || res.data || [];
      if (!Array.isArray(rawData) && typeof rawData === "object" && rawData !== null) {
        const arrayKey = Object.keys(rawData).find((key) => Array.isArray(rawData[key]));
        if (arrayKey) {
          rawData = rawData[arrayKey];
        } else {
          rawData = [];
        }
      }

      const { user } = useAuthStore.getState();
      const formattedData = Array.isArray(rawData)
        ? rawData
          .map((item: any) => (item && item.attributes ? { id: item.id, ...item.attributes } : item))
          .filter((item: any) => {
            if (!user || !user.id) return false;
            const relId =
              item.user?.data?.id ||
              item.user?.id ||
              item.users_permissions_user?.data?.id ||
              item.users_permissions_user?.id ||
              item.user_payout_detail?.data?.attributes?.user?.data?.id ||
              item.user_payout_detail?.data?.attributes?.users_permissions_user?.data?.id ||
              item.user_payout_detail?.user?.id ||
              item.user_payout_detail?.users_permissions_user?.id;
            if (relId !== undefined && relId !== null) {
              return String(relId) === String(user.id);
            }
            return true;
          })
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
      setPayoutHistory(formattedData);
    } catch (e) {
      console.warn("Failed to fetch payout history:", e);
      setPayoutHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Filtered list
  const filteredHistory = payoutHistory.filter((item) => {
    // Status filter
    if (selectedStatus !== "all" && item.status !== selectedStatus) {
      if (selectedStatus === "paid" && item.status !== "paid" && item.status !== "approved") {
        return false;
      }
      if (selectedStatus !== "paid") {
        return false;
      }
    }

    // Search query filter (Bank name or transaction reference or amount)
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const detailRaw = item.user_payout_detail;
      const detail = (detailRaw?.data?.attributes
        ? { id: detailRaw.data.id, ...detailRaw.data.attributes }
        : detailRaw) || {};
      const bankName = (detail.bank_name || "Bank Transfer").toLowerCase();
      const amountStr = item.amount.toString();
      const refStr = (item.transactionReference || "").toLowerCase();
      return bankName.includes(q) || amountStr.includes(q) || refStr.includes(q);
    }

    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Payout History</Text>
          <Text style={styles.headerSubtitle}>
            {payoutHistory.length} total request{payoutHistory.length !== 1 && "s"}
          </Text>
        </View>
      </View>

      {/* Filter and Search Section */}
      <View style={styles.filterSection}>
        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search by bank or amount..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {([
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "paid", label: "Paid" },
            { key: "rejected", label: "Rejected" },
          ] as { key: FilterStatus; label: string }[]).map((tab) => {
            const active = selectedStatus === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setSelectedStatus(tab.key)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {loadingHistory && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : filteredHistory.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.centerContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[Colors.primary]} />}
        >
          <Ionicons name="receipt-outline" size={54} color="#D1D5DB" />
          <Text style={styles.emptyText}>No requests found</Text>
        </ScrollView>
      ) : (
        <FlatListCustom
          data={filteredHistory}
          refreshing={refreshing}
          onRefresh={refresh}
          onSelect={(item) => {
            setSelectedHistoryItem(item);
            setHistoryModalVisible(true);
          }}
        />
      )}

      {/* Details Modal */}
      <Modal
        visible={historyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: "90%" }]}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.modalTitle, { textAlign: "left", marginBottom: 4 }]}>Payout Details</Text>
                <Text style={{ fontSize: 11, color: "#6B7280", fontFamily: "Poppins_400Regular" }}>
                  View Complete Information About This Withdrawal Request
                </Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setHistoryModalVisible(false)}>
                <Ionicons name="close" size={22} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {selectedHistoryItem && (() => {
              const item = selectedHistoryItem;
              const detailRaw = item.user_payout_detail;
              const detail =
                (detailRaw?.data?.attributes
                  ? { id: detailRaw.data.id, ...detailRaw.data.attributes }
                  : detailRaw) || {};
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
                  <View
                    style={[
                      styles.modalBalanceBox,
                      { backgroundColor: `${statusColor(item.status)}0D`, paddingVertical: 20, alignItems: "center" },
                    ]}
                  >
                    <Text style={styles.modalBalanceLabel}>Requested Amount</Text>
                    <Text style={[styles.modalBalanceAmount, { color: statusColor(item.status), fontSize: 32 }]}>
                      {item.currency || "$"}{" "}
                      {item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${statusColor(item.status)}18`, marginTop: 8 },
                      ]}
                    >
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
                        {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : "Not Reviewed Yet"}
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
                        {detail.account_number ? `****${detail.account_number.slice(-4)}` : "****"}
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
                  <TouchableOpacity style={styles.modalCloseBtnAction} onPress={() => setHistoryModalVisible(false)}>
                    <Text style={styles.modalCloseBtnActionText}>Close</Text>
                  </TouchableOpacity>
                </ScrollView>
              );
            })()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// FlatList helper using ScrollView to cleanly support Pull to Refresh
function FlatListCustom({
  data,
  refreshing,
  onRefresh,
  onSelect,
}: {
  data: PayoutRequest[];
  refreshing: boolean;
  onRefresh: () => void;
  onSelect: (item: PayoutRequest) => void;
}) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      {data.map((item, idx) => {
        const detailRaw = item.user_payout_detail;
        const detail =
          (detailRaw?.data?.attributes ? { id: detailRaw.data.id, ...detailRaw.data.attributes } : detailRaw) || {};
        const bankName = detail.bank_name || "Bank Transfer";
        const currency = item.currency || detail.currency || "";
        const accountNum = detail.account_number || detail.iban || "";
        const maskedNum = accountNum ? `••••${accountNum.replace(/\s/g, "").slice(-4)}` : "••••";

        const COUNTRY_FLAGS_MAP: Record<string, string> = {
          India: "🇮🇳",
          "United States": "🇺🇸",
          Canada: "🇨🇦",
          "United Kingdom": "🇬🇧",
          Germany: "🇩🇪",
          France: "🇫🇷",
          Italy: "🇮🇹",
          Spain: "🇪🇸",
          Netherlands: "🇳🇱",
          Belgium: "🇧🇪",
          Switzerland: "🇨🇭",
          Australia: "🇦🇺",
          Japan: "🇯🇵",
          China: "🇨🇳",
          Brazil: "🇧🇷",
          Mexico: "🇲🇽",
          "South Africa": "🇿🇦",
          Singapore: "🇸🇬",
          "United Arab Emirates": "🇦🇪",
          "Saudi Arabia": "🇸🇦",
          "New Zealand": "🇳🇿",
          Sweden: "🇸🇪",
          Norway: "🇳🇴",
          Denmark: "🇩🇰",
          Finland: "🇫🇮",
          Ireland: "🇮🇪",
          Austria: "🇦🇹",
          Portugal: "🇵🇹",
          Poland: "🇵🇱",
          Turkey: "🇹🇷",
          Russia: "🇷🇺",
          "South Korea": "🇰🇷",
          "Hong Kong": "🇭🇰",
          Malaysia: "🇲🇾",
          Thailand: "🇹🇭",
          Indonesia: "🇮🇩",
          Philippines: "🇵🇭",
          Vietnam: "🇻🇳",
          Egypt: "🇪🇬",
          Nigeria: "🇳🇬",
          Kenya: "🇰🇪",
          Argentina: "🇦🇷",
          Colombia: "🇨🇴",
          Chile: "🇨🇱",
          Peru: "🇵🇪",
          "Bouvet Island": "🇳🇴",
        };
        const countryCode = (detail.country || "").trim();
        let countryFlag = "🏦";
        if (COUNTRY_FLAGS_MAP[countryCode]) {
          countryFlag = COUNTRY_FLAGS_MAP[countryCode];
        } else {
          const matchedKey = Object.keys(COUNTRY_FLAGS_MAP).find(
            (k) => k.toLowerCase() === countryCode.toLowerCase()
          );
          if (matchedKey) {
            countryFlag = COUNTRY_FLAGS_MAP[matchedKey];
          } else if (countryCode.length === 2) {
            try {
              const cps = countryCode
                .toUpperCase()
                .split("")
                .map((c: string) => 127397 + c.charCodeAt(0));
              countryFlag = String.fromCodePoint(...cps);
            } catch (_) { }
          }
        }

        return (
          <View key={item.id} style={[styles.historyCard, idx > 0 && { marginTop: 12 }]}>
            {/* Top Row: Bank info + Amount */}
            <View style={styles.historyCardTop}>
              <View style={styles.historyBankInfo}>
                <View style={styles.historyFlagCircle}>
                  <Text style={{ fontSize: 18 }}>{countryFlag}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyBankName} numberOfLines={1}>
                    {bankName.charAt(0).toUpperCase() + bankName.slice(1)}
                  </Text>
                  <Text style={styles.historyAccNum}>
                    {maskedNum} {currency ? `· ${currency}` : ""}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.historyAmount}>
                  {currency || "$"}
                  {item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${statusColor(item.status)}18`, marginTop: 4 },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                    {statusLabel(item.status)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom Row: Date + View button */}
            <View style={styles.historyCardBottom}>
              <Text style={styles.historyDate}>
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              <TouchableOpacity style={styles.historyViewBtn} onPress={() => onSelect(item)} activeOpacity={0.7}>
                <Ionicons name="eye-outline" size={14} color={Colors.primary} />
                <Text style={styles.historyViewBtnText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    marginTop: 1,
  },
  filterSection: {
    backgroundColor: "#F8F8FA",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#1A1A1A",
    fontFamily: "Poppins_400Regular",
    marginLeft: 8,
    padding: 0,
  },
  tabsRow: {
    gap: 8,
    paddingBottom: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabActive: {
    backgroundColor: `${Colors.primary}12`,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    fontFamily: "Poppins_400Regular",
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  // Cards styling
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0F0F2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  historyCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyBankInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  historyFlagCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  historyBankName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  historyAccNum: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    marginTop: 1,
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  historyCardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  historyDate: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  historyViewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${Colors.primary}0C`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${Colors.primary}1A`,
  },
  historyViewBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  // Modal styling
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
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  modalCloseBtn: {
    padding: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  modalBalanceBox: {
    borderRadius: 16,
    marginBottom: 20,
  },
  modalBalanceLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalBalanceAmount: {
    fontWeight: "800",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1A1A1A",
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 10,
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
  modalCloseBtnAction: {
    marginTop: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCloseBtnActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
