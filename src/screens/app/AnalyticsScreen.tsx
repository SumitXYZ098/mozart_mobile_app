import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import axios from "axios";

import { Colors } from "@/theme/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { ENDPOINTS } from "@/api/endpoints";
import AnalyticsChart from "@/components/screenComponents/analyticsScreen/AnalyticsChart";
import BestPerformingStores from "@/components/screenComponents/analyticsScreen/BestPerformingStores";

// Constants for Period selector matching User Dashboard Specs
const PERIODS = {
  DAYS_7: "7days",
  DAYS_14: "14days",
  DAYS_30: "30days",
};

// Interface for chart data
interface DataPoint {
  label: string;
  value: number;
}

// Interface for Store Data
interface StoreChannel {
  channel: string;
  totalUnits: number;
  percentage: string;
}

// Stores list for dropdown
const STORES = [
  "Youtube Music",
  "Spotify",
  "Apple Music",
  "Amazon Music",
  "Deezer",
];

// Beautiful Mock datasets corresponding to 7 Days, 14 Days, 30 Days periods
const MOCK_DATA: Record<
  string,
  {
    total: string;
    totalFormatted: string;
    change: string;
    isNegative: boolean;
    dateRange: string;
    points: DataPoint[];
  }
> = {
  [PERIODS.DAYS_7]: {
    total: "9,842",
    totalFormatted: "9.8K",
    change: "+12.45%",
    isNegative: false,
    dateRange: "30 May - 05 Jun 2026",
    points: [
      { label: "May 30", value: 1000 },
      { label: "May 31", value: 1050 },
      { label: "Jun 1", value: 1100 },
      { label: "Jun 2", value: 1500 },
      { label: "Jun 3", value: 1700 },
      { label: "Jun 4", value: 1600 },
      { label: "Jun 5", value: 1892 },
    ],
  },
  [PERIODS.DAYS_14]: {
    total: "24,000",
    totalFormatted: "24K",
    change: "-3.15%",
    isNegative: true,
    dateRange: "23 May - 05 Jun 2026",
    points: [
      { label: "May 23", value: 1200 },
      { label: "May 25", value: 1300 },
      { label: "May 27", value: 1550 },
      { label: "May 29", value: 1600 },
      { label: "May 31", value: 1750 },
      { label: "Jun 2", value: 2100 },
      { label: "Jun 4", value: 2400 },
    ],
  },
  [PERIODS.DAYS_30]: {
    total: "69,000",
    totalFormatted: "69K",
    change: "+24.8%",
    isNegative: false,
    dateRange: "07 May - 05 Jun 2026",
    points: [
      { label: "May 7", value: 1500 },
      { label: "May 12", value: 1650 },
      { label: "May 17", value: 1850 },
      { label: "May 22", value: 1950 },
      { label: "May 27", value: 2200 },
      { label: "Jun 1", value: 2700 },
      { label: "Jun 5", value: 3300 },
    ],
  },
};

// Mock Best Performing Stores corresponding to periods (6 channels matching Screenshot 2)
const MOCK_BEST_STORES: Record<string, StoreChannel[]> = {
  [PERIODS.DAYS_7]: [
    { channel: "Spotify", totalUnits: 4212, percentage: "42.80" },
    { channel: "Apple Music", totalUnits: 2641, percentage: "26.83" },
    { channel: "Soundcloud", totalUnits: 980, percentage: "10.00" },
    { channel: "Youtube Music", totalUnits: 980, percentage: "10.00" },
    { channel: "Audiomack", totalUnits: 529, percentage: "5.37" },
    { channel: "Instagram", totalUnits: 500, percentage: "5.00" },
  ],
  [PERIODS.DAYS_14]: [
    { channel: "Spotify", totalUnits: 10500, percentage: "43.75" },
    { channel: "Apple Music", totalUnits: 7200, percentage: "30.00" },
    { channel: "Soundcloud", totalUnits: 2400, percentage: "10.00" },
    { channel: "Youtube Music", totalUnits: 2400, percentage: "10.00" },
    { channel: "Audiomack", totalUnits: 800, percentage: "3.33" },
    { channel: "Instagram", totalUnits: 700, percentage: "2.92" },
  ],
  [PERIODS.DAYS_30]: [
    { channel: "Spotify", totalUnits: 31050, percentage: "45.00" },
    { channel: "Apple Music", totalUnits: 17250, percentage: "25.00" },
    { channel: "Soundcloud", totalUnits: 6900, percentage: "10.00" },
    { channel: "Youtube Music", totalUnits: 6900, percentage: "10.00" },
    { channel: "Audiomack", totalUnits: 3450, percentage: "5.00" },
    { channel: "Instagram", totalUnits: 3450, percentage: "5.00" },
  ],
};

// Helper utility to parse date format from API (YYYY-MM-DD) into display date format (e.g. "30 May - 06 Jun 2026")
const formatDateRange = (startStr: string, endStr: string) => {
  if (!startStr || !endStr) return "";
  try {
    const parseDate = (str: string) => {
      const parts = str.split("-");
      if (parts.length === 3) {
        const year = parts[0];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return { day, month: months[monthIdx], year };
      }
      return null;
    };
    const s = parseDate(startStr);
    const e = parseDate(endStr);
    if (s && e) {
      if (s.year === e.year) {
        return `${s.day} ${s.month} - ${e.day} ${e.month}`;
      } else {
        return `${s.day} ${s.month} ${s.year} - ${e.day} ${e.month} ${e.year}`;
      }
    }
  } catch (err) {
    console.error("Error formatting dates:", err);
  }
  return `${startStr} - ${endStr}`;
};

// Safe date parsing helper to avoid react-native Hermes engine parser issues with YYYY-MM-DD
const parseDateString = (dateStr: string) => {
  if (!dateStr) return "";
  // Check if string contains timezone suffix, strip it for plain date parsing
  const cleanStr = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = cleanStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[month - 1]} ${day}`;
    }
  }

  // Fallback to native parsing
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    }
  } catch {}

  return dateStr;
};

// Mapper to normalize any API data response format to DataPoint[]
const mapApiData = (apiData: any[], period: string) => {
  if (!apiData || apiData.length === 0) return null;

  return apiData.map((item: any) => {
    let label = "";
    if (item.label) label = item.label;
    else if (item.day) label = item.day;
    else if (item.date) {
      label = parseDateString(item.date);
    }

    let value = 0;
    if (typeof item.value === "number") value = item.value;
    else if (typeof item.streams === "number") value = item.streams;
    else if (typeof item.count === "number") value = item.count;
    else if (typeof item.streams_count === "number") value = item.streams_count;
    else if (item.value) value = parseFloat(item.value) || 0;
    else if (item.streams) value = parseFloat(item.streams) || 0;
    else if (item.count) value = parseFloat(item.count) || 0;

    return { label, value };
  });
};

const formatTotalUnitsLabel = (units: number) => {
  if (units >= 1000) {
    return `${(units / 1000).toFixed(1)}K`;
  }
  return String(units);
};

const AnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { user } = useAuthStore();

  // Screen State
  const [activeTab, setActiveTab] = useState<"trends" | "sales">("trends");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(PERIODS.DAYS_7);
  const [selectedStore, setSelectedStore] = useState<string>("Youtube Music");
  const [storeDropdownVisible, setStoreDropdownVisible] = useState<boolean>(false);

  // Badge notifications count
  const [notificationCount, setNotificationCount] = useState<number>(0);

  // API State: Daily Streams Overview
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiData, setApiData] = useState<any[] | null>(null);

  // API State: Best Performing Stores
  const [storesLoading, setStoresLoading] = useState<boolean>(false);
  const [storesApiResponse, setStoresApiResponse] = useState<any>(null);
  const [storesApiData, setStoresApiData] = useState<StoreChannel[] | null>(null);

  // Call both daily-trends endpoints and notifications
  const fetchAnalyticsData = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setStoresLoading(true);

    try {
      // 1. Fetch Streams Overview trend data
      const streamsPromise = axios.get(ENDPOINTS.TOTAL_STREAMS, {
        params: { period: selectedPeriod },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // 2. Fetch Best Performing Stores platform data
      const storesPromise = axios.get(ENDPOINTS.TOTAL_STREAM_PER_PLATFORM, {
        params: { period: selectedPeriod },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // 3. Fetch notifications to update header badging count
      const notificationsPromise = axios.get(ENDPOINTS.NOTIFICATIONS, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Run parallel requests
      const [streamsRes, storesRes, notificationsRes] = await Promise.all([
        streamsPromise.catch((e) => {
          console.error("Streams overview error:", e);
          return null;
        }),
        storesPromise.catch((e) => {
          console.error("Best performing stores error:", e);
          return null;
        }),
        notificationsPromise.catch((e) => {
          console.error("Notifications fetch error:", e);
          return null;
        }),
      ]);

      // Handle Streams trend data
      if (streamsRes && streamsRes.data && streamsRes.data.success) {
        setApiResponse(streamsRes.data);
        setApiData(streamsRes.data.data || []);
      } else {
        setApiData(null);
        setApiResponse(null);
      }

      // Handle Best Performing Stores data
      if (storesRes && storesRes.data && storesRes.data.success) {
        setStoresApiResponse(storesRes.data);
        setStoresApiData(storesRes.data.data || []);
      } else {
        setStoresApiData(null);
        setStoresApiResponse(null);
      }

      // Handle notification badge counts
      if (notificationsRes && notificationsRes.data) {
        const responseData = notificationsRes.data;
        const list = Array.isArray(responseData)
          ? responseData
          : responseData && Array.isArray(responseData.data)
            ? responseData.data
            : [];
        const unreadList = list.filter((item: any) => {
          const attrs = item.attributes || {};
          const isRead = !!(
            attrs.read ||
            item.read ||
            attrs.is_read ||
            item.is_read ||
            attrs.isRead ||
            item.isRead ||
            attrs.status === "read" ||
            item.status === "read"
          );
          return !isRead;
        });
        setNotificationCount(unreadList.length);
      }
    } catch (error) {
      console.error("Failed fetching analytics data:", error);
      setApiData(null);
      setApiResponse(null);
      setStoresApiData(null);
      setStoresApiResponse(null);
    } finally {
      setLoading(false);
      setStoresLoading(false);
      setRefreshing(false);
    }
  }, [user?.token, selectedPeriod]);

  // Fetch when screen loads/changes period
  useEffect(() => {
    if (isFocused) {
      fetchAnalyticsData();
    }
  }, [isFocused, selectedPeriod, fetchAnalyticsData]);

  // Pull to refresh action
  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  // Compile active report card values (API values with mock fallbacks)
  // Compile active report card values (API values with mock fallbacks)
  const activeDataset = useMemo(() => {
    if (apiData && apiData.length > 0) {
      const mapped = mapApiData(apiData, selectedPeriod);
      if (mapped && mapped.length > 0) {
        const totalSum = mapped.reduce((sum, pt) => sum + pt.value, 0);
        const totalStr = totalSum.toLocaleString();
        const formattedTotal = formatTotalUnitsLabel(totalSum);

        const dateRangeStr =
          apiResponse?.startDate && apiResponse?.endDate
            ? formatDateRange(apiResponse.startDate, apiResponse.endDate)
            : "";

        const changeStr =
          apiResponse?.percentageChange ||
          apiResponse?.change ||
          "0%";

        const isNegativeVal = changeStr.startsWith("-");

        return {
          total: totalStr,
          totalFormatted: formattedTotal,
          change: changeStr,
          isNegative: isNegativeVal,
          dateRange: dateRangeStr,
          points: mapped,
        };
      }
    }

    return {
      total: "0",
      totalFormatted: "0",
      change: "0%",
      isNegative: false,
      dateRange: "",
      points: [],
    };
  }, [apiData, apiResponse, selectedPeriod]);

  // Compile Best Performing Stores data
  const bestPerformingStoresDataset = useMemo(() => {
    if (storesApiData && storesApiData.length > 0) {
      const totalSum = storesApiData.reduce(
        (sum, item) => sum + (item.totalUnits || 0),
        0
      );
      const totalStr = formatTotalUnitsLabel(totalSum);

      return {
        total: totalStr,
        data: storesApiData,
      };
    }

    return {
      total: "0",
      data: [],
    };
  }, [storesApiData, selectedPeriod]);

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case PERIODS.DAYS_14:
        return "14 Days Report";
      case PERIODS.DAYS_30:
        return "30 Days Report";
      case PERIODS.DAYS_7:
      default:
        return "Weekly Report";
    }
  };

  const getVsPeriodLabel = () => {
    switch (selectedPeriod) {
      case PERIODS.DAYS_14:
        return "Vs Previous 14 Days";
      case PERIODS.DAYS_30:
        return "Vs Previous 30 Days";
      case PERIODS.DAYS_7:
      default:
        return "Vs Previous 7 Days";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("HomeTab");
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Overview</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Notification")}
          style={styles.notificationButton}
        >
          <View style={styles.notificationWrapper}>
            <Ionicons name="notifications" size={18} color={Colors.white} />
            {notificationCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Primary Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab("trends")}
          style={[styles.tabItem, activeTab === "trends" && styles.tabItemActive]}
        >
          <Text
            style={[styles.tabText, activeTab === "trends" && styles.tabTextActive]}
          >
            Daily Trends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("sales")}
          style={[styles.tabItem, activeTab === "sales" && styles.tabItemActive]}
        >
          <Text
            style={[styles.tabText, activeTab === "sales" && styles.tabTextActive]}
          >
            Sales Report
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {activeTab === "trends" ? (
          <View>
            {/* Title Section */}
            <Text style={styles.sectionTitle}>Your Streams & Downloads</Text>
            <Text style={styles.sectionSubtitle}>Performing Store</Text>

            {/* Store Dropdown Trigger */}
            <TouchableOpacity
              onPress={() => setStoreDropdownVisible(true)}
              style={styles.dropdownButton}
            >
              <Text style={styles.dropdownText}>{selectedStore}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.gray} />
            </TouchableOpacity>

            {loading && !refreshing ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : (
              <View style={styles.cardsStack}>
                {/* Metric Summary Card: Left purple accent bar and brand shadows */}
                <View style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <Text style={styles.reportTitle}>{getPeriodLabel()}</Text>
                    <Text style={styles.reportDate}>
                      {activeDataset.dateRange}
                    </Text>
                  </View>
                  <View style={styles.reportRow}>
                    <View style={styles.metricContainer}>
                      <Text style={styles.metricValue}>
                        {activeDataset.total}
                      </Text>
                      <Text style={styles.metricLabel}>Total Streams</Text>
                    </View>
                    <View style={styles.changeContainer}>
                      <Text
                        style={[
                          styles.changeValue,
                          {
                            color: activeDataset.isNegative
                              ? Colors.red
                              : Colors.green,
                          },
                        ]}
                      >
                        {activeDataset.change}
                      </Text>
                      <Text style={styles.changeLabel}>{getVsPeriodLabel()}</Text>
                    </View>
                  </View>
                </View>

                {/* SVG Chart Component */}
                <AnalyticsChart
                  points={activeDataset.points}
                  selectedPeriod={selectedPeriod}
                  setSelectedPeriod={setSelectedPeriod}
                />

                {/* Best Performing Stores Component (SVG Donut Chart) */}
                <BestPerformingStores
                  data={bestPerformingStoresDataset.data}
                  loading={storesLoading && !refreshing}
                  totalStreams={bestPerformingStoresDataset.total}
                />
              </View>
            )}
          </View>
        ) : (
          /* Sales Report Tab: Premium empty state visual placeholder */
          <View style={styles.salesContainer}>
            <View style={styles.salesCard}>
              <View style={styles.salesIconWrapper}>
                <Ionicons
                  name="document-text-outline"
                  size={52}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.salesTitle}>Sales Report</Text>
              <Text style={styles.salesSubtitle}>
                No financial transactions or sales records are currently
                available. Reports are compiled monthly after processing.
              </Text>
              
              <TouchableOpacity
                style={styles.salesActionButton}
                onPress={() =>
                  navigation.navigate("MusicTab", {
                    screen: "NewRelease",
                    params: { step: 0 },
                  })
                }
              >
                <Text style={styles.salesActionText}>Distribute Music</Text>
                <Ionicons name="arrow-forward-outline" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Interactive Dropdown selection menu Modal */}
      <Modal
        visible={storeDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStoreDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStoreDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Store</Text>
              <TouchableOpacity onPress={() => setStoreDropdownVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>
            {STORES.map((store) => (
              <TouchableOpacity
                key={store}
                style={[
                  styles.dropdownItem,
                  selectedStore === store && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedStore(store);
                  setStoreDropdownVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedStore === store && styles.dropdownItemTextActive,
                  ]}
                >
                  {store}
                </Text>
                {selectedStore === store && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default AnalyticsScreen;

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
  },
  backButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    color: "#2C2C2C",
  },
  notificationButton: {
    backgroundColor: Colors.primary,
    borderRadius: 99,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    right: -4,
    top: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "bold",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderColor: "#F0EFFB",
    paddingHorizontal: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    color: Colors.gray,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.gray,
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#3A3A3A",
  },
  loaderContainer: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  cardsStack: {
    flexDirection: "column",
    rowGap: 24,
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F0EFFB",
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary, // Left vertical accent line
    shadowColor: "#6739B7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    paddingLeft: 18,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  reportTitle: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    color: "#333",
  },
  reportDate: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.gray,
  },
  reportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  metricContainer: {
    flexDirection: "column",
  },
  metricValue: {
    fontSize: 32,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: Colors.primary,
    lineHeight: 38,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.gray,
    marginTop: 4,
  },
  changeContainer: {
    alignItems: "flex-end",
  },
  changeValue: {
    fontSize: 24,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    lineHeight: 28,
  },
  changeLabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: Colors.gray,
    marginTop: 4,
  },
  salesContainer: {
    paddingTop: 30,
    alignItems: "center",
  },
  salesCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: "#F0EFFB",
    shadowColor: "#6739B7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    alignItems: "center",
  },
  salesIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.lightPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  salesTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  salesSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  salesActionButton: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  salesActionText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.white,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  dropdownMenu: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: "#2C2C2C",
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#FAFAFA",
  },
  dropdownItemActive: {
    backgroundColor: "#F8F5FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: -12,
  },
  dropdownItemText: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#333",
  },
  dropdownItemTextActive: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    color: Colors.primary,
  },
});
