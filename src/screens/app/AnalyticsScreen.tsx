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
  Alert,
  Share,
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
import BestPerformingCountries from "@/components/screenComponents/analyticsScreen/BestPerformingCountries";
import FolderEmptyState from "@/components/screenComponents/analyticsScreen/FolderEmptyState";
import Svg, { Path, G, Rect, Circle as SVGCircle } from "react-native-svg";

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
    total: "9,476",
    totalFormatted: "9.4K",
    change: "-7.29%",
    isNegative: true,
    dateRange: "15 Aug - 22 Aug 2025",
    points: [
      { label: "Sun", value: 1520 },
      { label: "Mon", value: 1410 },
      { label: "Tue", value: 1200 },
      { label: "Wed", value: 1310 },
      { label: "Thu", value: 1220 },
      { label: "Fri", value: 1080 },
      { label: "Sat", value: 1736 },
    ],
  },
  [PERIODS.DAYS_14]: {
    total: "24,000",
    totalFormatted: "24K",
    change: "-3.15%",
    isNegative: true,
    dateRange: "09 Aug - 22 Aug 2025",
    points: [
      { label: "Aug 9", value: 1600 },
      { label: "Aug 10", value: 1550 },
      { label: "Aug 11", value: 1700 },
      { label: "Aug 12", value: 1620 },
      { label: "Aug 13", value: 1500 },
      { label: "Aug 14", value: 1800 },
      { label: "Aug 15", value: 1950 },
      { label: "Aug 16", value: 1700 },
      { label: "Aug 17", value: 1650 },
      { label: "Aug 18", value: 1820 },
      { label: "Aug 19", value: 1710 },
      { label: "Aug 20", value: 1680 },
      { label: "Aug 21", value: 1580 },
      { label: "Aug 22", value: 2140 },
    ],
  },
  [PERIODS.DAYS_30]: {
    total: "69,000",
    totalFormatted: "69K",
    change: "+24.80%",
    isNegative: false,
    dateRange: "24 Jul - 22 Aug 2025",
    points: [
      { label: "Jul 24", value: 10000 },
      { label: "Jul 29", value: 11500 },
      { label: "Aug 3", value: 10800 },
      { label: "Aug 8", value: 12200 },
      { label: "Aug 13", value: 11900 },
      { label: "Aug 18", value: 13100 },
      { label: "Aug 22", value: 14500 },
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
  } else if (parts.length === 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[month - 1]} ${year}`;
    }
  }

  // Fallback to native parsing
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    }
  } catch { }

  return dateStr;
};

const mapApiData = (apiData: any[], period: string) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) return null;

  return apiData.filter(Boolean).map((item: any) => {
    let label = "Unknown";
    if (item.label) label = String(item.label);
    else if (item.month) label = String(item.month);
    else if (item.day) label = parseDateString(String(item.day));
    else if (item.date) label = parseDateString(String(item.date));

    let value = 0;
    const v = item.value ?? item.totalStreams ?? item.streams ?? item.count ?? item.streams_count;
    if (v !== undefined && v !== null) {
      value = Number(v) || 0;
    }

    return { label, value };
  });
};

const padForOneMonth = (data: any[]) => {
  const latestDate = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const padded = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(latestDate.getFullYear(), latestDate.getMonth() - i, 1);
    const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
    
    const existing = data?.find((item: any) => 
      item.label.includes(months[d.getMonth()]) && item.label.includes(String(d.getFullYear()))
    );
    
    if (existing) {
      padded.push({ ...existing, label });
    } else {
      padded.push({ label, value: 0 });
    }
  }
  return padded;
};

const formatTotalUnitsLabel = (units: number) => {
  if (units >= 1000000) {
    return `${(units / 1000000).toFixed(units % 1000000 === 0 ? 0 : 1)}M`;
  }
  if (units >= 1000) {
    return `${(units / 1000).toFixed(1)}K`;
  }
  return String(units);
};



const getParsedData = (res: any) => {
  if (!res) return null;
  let payload = res;
  if (res.data !== undefined) payload = res.data;

  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      // Ignored
    }
  }
  return payload;
};

const isResponseValid = (resData: any) => {
  return resData !== null && resData !== undefined;
};

const extractArrayData = (parsedData: any) => {
  if (!parsedData) return [];

  if (Array.isArray(parsedData)) return parsedData;
  if (parsedData.items && Array.isArray(parsedData.items)) return parsedData.items;
  if (parsedData.platforms && Array.isArray(parsedData.platforms)) return parsedData.platforms;
  if (parsedData.stores && Array.isArray(parsedData.stores)) return parsedData.stores;
  if (parsedData.countries && Array.isArray(parsedData.countries)) return parsedData.countries;

  const searchObj = (obj: any, depth = 0): any[] | null => {
    if (!obj || typeof obj !== 'object' || depth > 4) return null;
    if (Array.isArray(obj) && obj.length > 0) return obj;

    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key]) && obj[key].length > 0) return obj[key];
    }

    for (const key of Object.keys(obj)) {
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        const found = searchObj(obj[key], depth + 1);
        if (found) return found;
      }
    }
    return null;
  };

  const result = searchObj(parsedData);
  return result || [];
};

const AnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { user } = useAuthStore();

  // Dynamically generate years from 2000 up to the current year
  const YEARS = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2000;
    const length = currentYear - startYear + 1;
    return Array.from({ length }, (_, i) => {
      const yr = startYear + i;
      return { label: String(yr), value: String(yr - startYear).padStart(2, "0") };
    });
  }, []);

  // Screen State
  const [activeTab, setActiveTab] = useState<"trends" | "sales">("trends");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(PERIODS.DAYS_7);
  const [selectedStore, setSelectedStore] = useState<string>("Youtube Music");
  const [storeDropdownVisible, setStoreDropdownVisible] = useState<boolean>(false);

  // Sales Report Form State
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);

  // Reports list state
  interface SalesReport {
    id: string | number;
    from: string;
    to: string;
  }

  const [reports, setReports] = useState<SalesReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState<boolean>(false);

  // Custom Month Picker Modal State
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);
  const [pickerTarget, setPickerTarget] = useState<"from" | "to">("from");
  const [tempMonth, setTempMonth] = useState<string>("06");
  const [tempYear, setTempYear] = useState<string>("26");

  const isYearDisabled = (yValue: string) => {
    const yearNum = 2000 + parseInt(yValue, 10);
    const now = new Date();
    const currentYear = now.getFullYear();

    // Rule 1: Cannot select future years
    if (yearNum > currentYear) {
      return true;
    }

    // Rule 2: Validation against other selected target
    if (pickerTarget === "from" && toDate) {
      const [, toYearStr] = toDate.split("/");
      const toYearNum = 2000 + parseInt(toYearStr, 10);
      if (yearNum > toYearNum) return true;
    } else if (pickerTarget === "to" && fromDate) {
      const [, fromYearStr] = fromDate.split("/");
      const fromYearNum = 2000 + parseInt(fromYearStr, 10);
      if (yearNum < fromYearNum) return true;
    }

    return false;
  };

  const isMonthDisabled = (mValue: string) => {
    const monthNum = parseInt(mValue, 10);
    const tempYearNum = 2000 + parseInt(tempYear, 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Rule 1: Cannot select future months
    if (tempYearNum > currentYear) {
      return true;
    }
    if (tempYearNum === currentYear && monthNum > currentMonth) {
      return true;
    }

    // Rule 2: Validation against other selected target
    if (pickerTarget === "from" && toDate) {
      const [toMonthStr, toYearStr] = toDate.split("/");
      const toYearNum = 2000 + parseInt(toYearStr, 10);
      const toMonthNum = parseInt(toMonthStr, 10);
      if (tempYearNum === toYearNum && monthNum > toMonthNum) {
        return true;
      }
    } else if (pickerTarget === "to" && fromDate) {
      const [fromMonthStr, fromYearStr] = fromDate.split("/");
      const fromYearNum = 2000 + parseInt(fromYearStr, 10);
      const fromMonthNum = parseInt(fromMonthStr, 10);
      if (tempYearNum === fromYearNum && monthNum < fromMonthNum) {
        return true;
      }
    }

    return false;
  };

  const openDatePicker = (target: "from" | "to") => {
    console.log("[Analytics] openDatePicker called for target:", target);
    setPickerTarget(target);
    const currentDate = target === "from" ? fromDate : toDate;
    if (currentDate) {
      const parts = currentDate.split("/");
      if (parts.length === 2) {
        setTempMonth(parts[0]);
        setTempYear(parts[1]);
      }
    } else {
      setTempMonth("06");
      setTempYear("26");
    }
    setPickerVisible(true);
  };

  const handleConfirmDate = () => {
    const formattedDate = `${tempMonth}/${tempYear}`;
    console.log("[Analytics] handleConfirmDate called. Selected Month/Year:", formattedDate, "for:", pickerTarget);
    if (pickerTarget === "from") {
      setFromDate(formattedDate);
    } else {
      setToDate(formattedDate);
    }
    setPickerVisible(false);
  };

  const formatToYYYYMM = (dateStr: string) => {
    const parts = dateStr.split("/");
    if (parts.length === 2) {
      return `20${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const fetchReports = useCallback(async () => {
    if (!user?.token) return;
    setReportsLoading(true);
    try {
      const response = await axios.get(ENDPOINTS.GET_MY_CSV_LOGS, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.data && response.data.success) {
        const rawData = response.data.data || [];
        const mapped: SalesReport[] = rawData.map((item: any) => ({
          id: item.id,
          from: item.startMonth,
          to: item.endMonth,
        }));
        setReports(mapped);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("[Analytics] Fetch reports error:", error);
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, [user?.token]);

  const handleRequestReport = async () => {
    if (!fromDate || !toDate) {
      Alert.alert("Required Fields", "Please select both 'From' and 'To' dates.");
      return;
    }
    if (!user?.token) {
      Alert.alert("Authentication", "Please log in to generate reports.");
      return;
    }

    const formattedFrom = formatToYYYYMM(fromDate);
    const formattedTo = formatToYYYYMM(toDate);
    console.log("[Analytics] handleRequestReport called. Requesting report from:", formattedFrom, "to:", formattedTo);

    setReportsLoading(true);
    try {
      const response = await axios.get(
        ENDPOINTS.GENERATE_CSV_REPORT,
        {
          params: {
            startMonth: formattedFrom,
            endMonth: formattedTo,
          },
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        Alert.alert(
          "Report Generated",
          `Your sales report from ${fromDate} to ${toDate} has been successfully generated.`
        );
        fetchReports();
        setFromDate(null);
        setToDate(null);
      } else {
        Alert.alert("Error", response.data?.message || "Failed to generate report.");
      }
    } catch (error: any) {
      console.error("[Analytics] Request report error:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to generate report."
      );
    } finally {
      setReportsLoading(false);
    }
  };

  const handleDownloadReport = async (id: number | string) => {
    if (!user?.token) {
      Alert.alert("Authentication", "Please log in to download reports.");
      return;
    }
    setReportsLoading(true);
    try {
      const url = ENDPOINTS.DOWNLOAD_CSV_REPORT(id);
      console.log("[Analytics] Fetching CSV report content from:", url);
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.data) {
        console.log("[Analytics] Opening share sheet for CSV report...");
        await Share.share({
          message: response.data,
          title: "Royalty Report CSV",
        });
      } else {
        Alert.alert("Error", "No report data returned from server.");
      }
    } catch (error: any) {
      console.error("[Analytics] Download report error:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to download report content."
      );
    } finally {
      setReportsLoading(false);
    }
  };

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

  // API State: Best Performing Countries
  const [countriesLoading, setCountriesLoading] = useState<boolean>(false);
  const [countriesApiData, setCountriesApiData] = useState<any[] | null>(null);

  // API State: Sales Report Charts
  const [salesPeriod, setSalesPeriod] = useState<"1month" | "3months" | "6months">("3months");
  const [salesLoading, setSalesLoading] = useState<boolean>(false);
  const [salesStreamsData, setSalesStreamsData] = useState<DataPoint[] | null>(null);
  const [salesStoresData, setSalesStoresData] = useState<StoreChannel[] | null>(null);
  const [salesCountriesData, setSalesCountriesData] = useState<any[] | null>(null);
  const [salesStreamsResponse, setSalesStreamsResponse] = useState<any>(null);

  // Call daily-trends endpoints and notifications
  const fetchAnalyticsData = useCallback(async () => {
    // console.log("[Analytics] fetchAnalyticsData started. Selected period:", selectedPeriod);
    if (!user?.token) {
      console.warn("[Analytics] Cannot fetch analytics: user token is missing");
      return;
    }
    setLoading(true);
    setStoresLoading(true);
    setCountriesLoading(true);

    try {
      // console.log("[Analytics] Sending request to TOTAL_STREAMS:", ENDPOINTS.TOTAL_STREAMS);
      const streamsPromise = axios.get(ENDPOINTS.TOTAL_STREAMS, {
        params: { period: selectedPeriod },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // console.log("[Analytics] Sending request to TOTAL_STREAM_PER_PLATFORM:", ENDPOINTS.TOTAL_STREAM_PER_PLATFORM);
      const storesPromise = axios.get(ENDPOINTS.TOTAL_STREAM_PER_PLATFORM, {
        params: { period: selectedPeriod },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // console.log("[Analytics] Sending request to BEST_PERFORMING_COUNTRIES:", ENDPOINTS.BEST_PERFORMING_COUNTRIES);
      const countriesPromise = axios.get(ENDPOINTS.BEST_PERFORMING_COUNTRIES, {
        params: { period: selectedPeriod },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const notificationsPromise = axios.get(ENDPOINTS.NOTIFICATIONS, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Run parallel requests
      const [streamsRes, storesRes, countriesRes, notificationsRes] = await Promise.all([
        streamsPromise.catch((e) => {
          console.error("[Analytics] Streams overview request error:", e?.response?.data || e?.message || e);
          return null;
        }),
        storesPromise.catch((e) => {
          console.error("[Analytics] Best performing stores request error:", e?.response?.data || e?.message || e);
          return null;
        }),
        countriesPromise.catch((e) => {
          console.error("[Analytics] Best performing countries request error:", e?.response?.data || e?.message || e);
          return null;
        }),
        notificationsPromise.catch((e) => {
          console.error("[Analytics] Notifications request error:", e?.response?.data || e?.message || e);
          return null;
        }),
      ]);

      if (streamsRes) {
        // console.log("[Analytics] Streams response received:", streamsRes.status, JSON.stringify(streamsRes.data));
      } else {
        console.warn("[Analytics] Streams response was null or failed");
      }
      if (storesRes) {
        // console.log("[Analytics] Stores response received:", storesRes.status, JSON.stringify(storesRes.data));
      } else {
        console.warn("[Analytics] Stores response was null or failed");
      }
      if (countriesRes) {
        // console.log("[Analytics] Countries response received:", countriesRes.status, JSON.stringify(countriesRes.data));
      } else {
        console.warn("[Analytics] Countries response was null or failed");
      }

      // Handle Streams trend data
      const streamsData = getParsedData(streamsRes);
      if (streamsData && isResponseValid(streamsData)) {
        setApiResponse(streamsData);
        setApiData(extractArrayData(streamsData));
      } else {
        setApiData(null);
        setApiResponse(null);
      }

      // Handle Best Performing Stores data
      const storesData = getParsedData(storesRes);
      if (storesData && isResponseValid(storesData)) {
        setStoresApiResponse(storesData);
        const rawStores = extractArrayData(storesData);
        const mappedStores = rawStores.filter(Boolean).map((item: any) => ({
          channel: String(item.channel || item.platform || item.store || "Unknown"),
          totalUnits: Number(item.totalUnits ?? item.units ?? item.streams ?? item.totalStreams ?? item.value ?? 0),
          percentage: String(item.percentage || "0"),
        }));
        setStoresApiData(mappedStores);
      } else {
        setStoresApiData(null);
        setStoresApiResponse(null);
      }

      // Handle Best Performing Countries data
      const countriesData = getParsedData(countriesRes);
      if (countriesData && isResponseValid(countriesData)) {
        const rawCountries = extractArrayData(countriesData);
        const mappedCountries = rawCountries.filter(Boolean).map((item: any) => ({
          country: String(item.country || item.countryCode || "Unknown"),
          totalUnits: Number(item.totalUnits ?? item.units ?? item.streams ?? item.totalStreams ?? item.value ?? 0),
          percentage: String(item.percentage || "0"),
        }));
        setCountriesApiData(mappedCountries);
      } else {
        setCountriesApiData(null);
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
      console.error("[Analytics] General analytics fetch error:", error);
      setApiData(null);
      setApiResponse(null);
      setStoresApiData(null);
      setStoresApiResponse(null);
      setCountriesApiData(null);
    } finally {
      setLoading(false);
      setStoresLoading(false);
      setCountriesLoading(false);
      setRefreshing(false);
    }
  }, [user?.token, selectedPeriod]);

  // Call sales report endpoints
  const fetchSalesReportData = useCallback(async () => {
    // console.log("[Analytics] fetchSalesReportData started. Selected period:", salesPeriod);
    if (!user?.token) {
      console.warn("[Analytics] Cannot fetch sales analytics: user token is missing");
      return;
    }
    setSalesLoading(true);

    try {
      const rangeVal = salesPeriod === "1month" ? "1M" : salesPeriod === "3months" ? "3M" : "6M";
      const apiParams = {
        range: rangeVal,
      };

      // console.log("[Analytics] Sending request to ROYALTY_TOTAL_STREAMS with params:", apiParams);
      const streamsPromise = axios.get(ENDPOINTS.ROYALTY_TOTAL_STREAMS, {
        params: apiParams,
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // console.log("[Analytics] Sending request to ROYALTY_PLATFORM_STREAMS with params:", apiParams);
      const storesPromise = axios.get(ENDPOINTS.ROYALTY_PLATFORM_STREAMS, {
        params: apiParams,
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // console.log("[Analytics] Sending request to ROYALTY_COUNTRY_STREAMS with params:", apiParams);
      const countriesPromise = axios.get(ENDPOINTS.ROYALTY_COUNTRY_STREAMS, {
        params: apiParams,
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Run parallel requests
      const [streamsRes, storesRes, countriesRes] = await Promise.all([
        streamsPromise.catch((e) => {
          // console.error("[Analytics] Royalty total streams request error:", e?.response?.data || e?.message || e);
          return null;
        }),
        storesPromise.catch((e) => {
          // console.error("[Analytics] Royalty platform streams request error:", e?.response?.data || e?.message || e);
          return null;
        }),
        countriesPromise.catch((e) => {
          // console.error("[Analytics] Royalty country streams request error:", e?.response?.data || e?.message || e);
          return null;
        }),
      ]);

      // 1. Process ROYALTY_TOTAL_STREAMS
      const streamsData = getParsedData(streamsRes);
      if (streamsData && isResponseValid(streamsData)) {
        setSalesStreamsResponse(streamsData);
        const dataArr = extractArrayData(streamsData);
        const mapped = mapApiData(dataArr, salesPeriod) || [];
        if (salesPeriod === "1month") {
          setSalesStreamsData(padForOneMonth(mapped));
        } else {
          // Reverse because API sends newest first (e.g. Mar, Feb, Jan) 
          // and chart needs oldest first left-to-right (Jan, Feb, Mar)
          setSalesStreamsData(mapped.reverse());
        }
      } else {
        if (salesPeriod === "1month") {
          setSalesStreamsData(padForOneMonth([]));
        } else {
          setSalesStreamsData([]);
        }
        setSalesStreamsResponse(null);
      }

      // 2. Process ROYALTY_PLATFORM_STREAMS
      const storesData = getParsedData(storesRes);
      if (storesData && isResponseValid(storesData)) {
        const rawStores = extractArrayData(storesData);
        const mappedStores: StoreChannel[] = rawStores.filter(Boolean).map((item: any) => ({
          channel: String(item.channel || item.platform || item.store || item.name || item.storeName || "Unknown"),
          totalUnits: Number(item.totalUnits ?? item.units ?? item.streams ?? item.totalStreams ?? item.value ?? 0),
          percentage: String(item.percentage || "0"),
        }));
        setSalesStoresData(mappedStores);
      } else {
        setSalesStoresData([]);
      }

      // 3. Process ROYALTY_COUNTRY_STREAMS
      const countriesData = getParsedData(countriesRes);
      if (countriesData && isResponseValid(countriesData)) {
        const rawCountries = extractArrayData(countriesData);
        const mappedCountries: any[] = rawCountries.filter(Boolean).map((item: any) => ({
          country: String(item.country || item.countryCode || item.name || "Unknown"),
          totalUnits: Number(item.totalUnits ?? item.units ?? item.streams ?? item.totalStreams ?? item.value ?? 0),
          percentage: String(item.percentage || "0"),
        }));
        setSalesCountriesData(mappedCountries);
      } else {
        setSalesCountriesData([]);
      }

    } catch (error) {
      console.error("[Analytics] General sales analytics fetch error:", error);
      setSalesStreamsData([]);
      setSalesStoresData([]);
      setSalesCountriesData([]);
      setSalesStreamsResponse(null);
    } finally {
      setSalesLoading(false);
      setRefreshing(false);
    }
  }, [user?.token, salesPeriod]);

  // Fetch when screen loads/changes period or active tab
  useEffect(() => {
    if (isFocused) {
      if (activeTab === "trends") {
        fetchAnalyticsData();
      } else {
        fetchReports();
        fetchSalesReportData();
      }
    }
  }, [isFocused, selectedPeriod, salesPeriod, activeTab, fetchAnalyticsData, fetchReports, fetchSalesReportData]);

  // Pull to refresh action
  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === "trends") {
      fetchAnalyticsData();
    } else {
      fetchReports();
      fetchSalesReportData();
    }
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

  // Compile active Sales Report total streams and formatted string
  const salesTotalStreamsFormatted = useMemo(() => {
    if (salesStreamsResponse?.totalStreams) {
      return formatTotalUnitsLabel(Number(salesStreamsResponse.totalStreams));
    }
    if (salesStreamsData && salesStreamsData.length > 0) {
      const sum = salesStreamsData.reduce((total, dp) => total + dp.value, 0);
      return formatTotalUnitsLabel(sum);
    }
    return "0";
  }, [salesStreamsData, salesStreamsResponse]);

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
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}
      </View>

      {/* Primary Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab("trends")}
          style={styles.tabItem}
        >
          <Text
            style={[styles.tabText, activeTab === "trends" && styles.tabTextActive]}
          >
            Daily Trends
          </Text>
          {activeTab === "trends" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("sales")}
          style={styles.tabItem}
        >
          <Text
            style={[styles.tabText, activeTab === "sales" && styles.tabTextActive]}
          >
            Sales Report
          </Text>
          {activeTab === "sales" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
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
            {/* <TouchableOpacity
              onPress={() => setStoreDropdownVisible(true)}
              style={styles.dropdownButton}
            >
              <Text style={styles.dropdownText}>{selectedStore}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.gray} />
            </TouchableOpacity> */}

            <View style={styles.cardsStack}>
              {/* Sub Period selector tabs outside the chart, above the report card */}
              <View style={styles.chartPeriodBar}>
                {(
                  [
                    { label: "7 Days", value: PERIODS.DAYS_7 },
                    { label: "14 Days", value: PERIODS.DAYS_14 },
                    { label: "30 Days", value: PERIODS.DAYS_30 },
                  ] as const
                ).map((item, index, arr) => {
                  const isActive = selectedPeriod === item.value;
                  const showDivider =
                    index > 0 &&
                    !isActive &&
                    selectedPeriod !== arr[index - 1].value;

                  return (
                    <React.Fragment key={item.value}>
                      {showDivider && <View style={styles.divider} />}
                      <TouchableOpacity
                        onPress={() => setSelectedPeriod(item.value)}
                        style={[
                          styles.periodButton,
                          isActive && styles.periodButtonActive,
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.periodButtonText,
                            isActive && styles.periodButtonTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>

              {/* Metric Summary Card: Left purple accent bar and brand shadows */}
              <View style={styles.reportCard}>
                <View style={styles.reportRow}>
                  <View style={styles.reportLeftColumn}>
                    <Text style={styles.reportTitle}>Streaming Report</Text>
                    <Text style={styles.reportSubtitle}>Last Reporting Days</Text>
                  </View>
                  <View style={styles.reportRightColumn}>
                    <Text style={styles.reportValue}>{activeDataset.total}</Text>
                    <Text style={styles.reportMetricLabel}>Total Streams</Text>
                  </View>
                </View>
              </View>

              {/* SVG Chart Component */}
              {loading && !refreshing ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : activeDataset.points && activeDataset.points.length > 0 ? (
                <AnalyticsChart
                  points={activeDataset.points}
                />
              ) : (
                <FolderEmptyState title="No Data Available" />
              )}

              {/* Best Performing Countries Card */}
              <BestPerformingCountries
                data={countriesApiData || []}
                loading={countriesLoading && !refreshing}
              />
              {/* Best Performing Stores Component (SVG Donut Chart) */}
              <BestPerformingStores
                data={bestPerformingStoresDataset.data}
                loading={storesLoading && !refreshing}
                totalStreams={bestPerformingStoresDataset.total}
                isEarnings={false}
              />
            </View>
          </View>
        ) : (
          /* Sales Report Tab: Premium analytics visualization + report generator */
          <View style={styles.salesContainer}>
            <View style={styles.cardsStack}>
              {/* Sales Period selector tabs outside the chart, above the report card */}
              <View style={styles.chartPeriodBar}>
                {(
                  [
                    { label: "1 Month", value: "1month" },
                    { label: "3 Months", value: "3months" },
                    { label: "6 Months", value: "6months" },
                  ] as const
                ).map((item, index, arr) => {
                  const isActive = salesPeriod === item.value;
                  const showDivider =
                    index > 0 &&
                    !isActive &&
                    salesPeriod !== arr[index - 1].value;

                  return (
                    <React.Fragment key={item.value}>
                      {showDivider && <View style={styles.divider} />}
                      <TouchableOpacity
                        onPress={() => setSalesPeriod(item.value)}
                        style={[
                          styles.periodButton,
                          isActive && styles.periodButtonActive,
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.periodButtonText,
                            isActive && styles.periodButtonTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>

              {/* Streams Section */}
              <View>
                <Text style={styles.sectionTitle}>Streams</Text>
                {salesLoading && !refreshing ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                  </View>
                ) : salesStreamsData && salesStreamsData.length > 0 ? (
                  <AnalyticsChart points={salesStreamsData} />
                ) : (
                  <FolderEmptyState title="No Data Available" />
                )}
              </View>

              {/* Streaming Report Card */}
              <View style={styles.reportCard}>
                <View style={styles.reportRow}>
                  <View style={styles.reportLeftColumn}>
                    <Text style={styles.reportTitle}>Streaming Report</Text>
                    <Text style={styles.reportSubtitle}>
                      {salesPeriod === "1month"
                        ? "Last 1 Month"
                        : salesPeriod === "3months"
                          ? "Last 3 Months"
                          : "Last 6 Months"}
                    </Text>
                  </View>
                  <View style={styles.reportRightColumn}>
                    <Text style={styles.reportValue}>{salesTotalStreamsFormatted}</Text>
                    <Text style={styles.reportMetricLabel}>Total Streams</Text>
                  </View>
                </View>
              </View>

              {/* Best Performing Countries */}
              <View>
                <Text style={styles.sectionTitle}>Best Preforming Countries</Text>
                {salesLoading && !refreshing ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                  </View>
                ) : salesCountriesData && salesCountriesData.length > 0 ? (
                  <BestPerformingCountries data={salesCountriesData} loading={false} />
                ) : (
                  <FolderEmptyState title="No Country Data Available" />
                )}
              </View>

              {/* Best Performing Stores */}
              <View>
                <Text style={styles.sectionTitle}>Best Preforming Stores</Text>
                {salesLoading && !refreshing ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                  </View>
                ) : salesStoresData && salesStoresData.length > 0 ? (
                  <BestPerformingStores
                    data={salesStoresData}
                    loading={false}
                    totalStreams={salesTotalStreamsFormatted}
                    isEarnings={false}
                  />
                ) : (
                  <FolderEmptyState title="No Store Data Available" />
                )}
              </View>

              {/* Request & Download Section at the bottom */}
              <View style={{ marginTop: 12 }}>
                <Text style={styles.sectionTitle}>Request & Download Reports</Text>
                <View style={styles.salesFormCard}>
                  <View style={styles.salesInputGroup}>
                    <Text style={styles.salesInputLabel}>From</Text>
                    <TouchableOpacity
                      style={styles.salesDateSelector}
                      onPress={() => openDatePicker("from")}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.salesDateText,
                          !fromDate && styles.salesDatePlaceholder,
                        ]}
                      >
                        {fromDate || "MM/YY"}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color={Colors.gray} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.salesInputGroup}>
                    <Text style={styles.salesInputLabel}>To</Text>
                    <TouchableOpacity
                      style={styles.salesDateSelector}
                      onPress={() => openDatePicker("to")}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.salesDateText,
                          !toDate && styles.salesDatePlaceholder,
                        ]}
                      >
                        {toDate || "MM/YY"}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color={Colors.gray} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.salesRequestBtn}
                    onPress={handleRequestReport}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.salesRequestBtnText}>Request Report</Text>
                  </TouchableOpacity>

                  {reportsLoading && !refreshing ? (
                    <View style={styles.loaderContainer}>
                      <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                  ) : reports.length === 0 ? (
                    <View style={styles.salesDashedBox}>
                      <Text style={styles.salesDashedText}>No Reports Generated Yet</Text>
                    </View>
                  ) : (
                    <View style={styles.reportsListContainer}>
                      {reports.map((report) => (
                        <View key={report.id} style={styles.reportListCard}>
                          <Text style={styles.reportCardDateText}>
                            {report.from} To {report.to}
                          </Text>
                          <TouchableOpacity
                            style={styles.reportDownloadBtn}
                            onPress={() => handleDownloadReport(report.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.reportDownloadBtnText}>Download</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
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

      {/* Custom Month/Year Picker Modal */}
      <Modal
        visible={pickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.pickerContainer}
            activeOpacity={1}
          >
            <Text style={styles.pickerTitle}>
              Select Month & Year ({pickerTarget === "from" ? "From" : "To"})
            </Text>

            <Text style={styles.pickerSubTitle}>Select Year</Text>
            <View style={{ height: 120, marginBottom: 16 }}>
              <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                <View style={styles.yearGrid}>
                  {YEARS.map((y) => {
                    const isActive = tempYear === y.value;
                    const isDisabled = isYearDisabled(y.value);
                    return (
                      <TouchableOpacity
                        key={y.value}
                        disabled={isDisabled}
                        style={[
                          styles.monthGridItem,
                          isActive && styles.monthGridItemActive,
                          isDisabled && styles.monthGridItemDisabled,
                          { width: "30%", marginBottom: 10 }
                        ]}
                        onPress={() => {
                          console.log("[Analytics] Selected Year:", y.label, "value:", y.value);
                          setTempYear(y.value);
                        }}
                        activeOpacity={isDisabled ? 1 : 0.7}
                      >
                        <Text
                          style={[
                            styles.monthGridItemText,
                            isActive && styles.monthGridItemTextActive,
                            isDisabled && styles.monthGridItemTextDisabled,
                          ]}
                        >
                          {y.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <Text style={styles.pickerSubTitle}>Select Month</Text>
            {/* Month Grid */}
            <View style={styles.monthGrid}>
              {[
                { label: "Jan", value: "01" },
                { label: "Feb", value: "02" },
                { label: "Mar", value: "03" },
                { label: "Apr", value: "04" },
                { label: "May", value: "05" },
                { label: "Jun", value: "06" },
                { label: "Jul", value: "07" },
                { label: "Aug", value: "08" },
                { label: "Sep", value: "09" },
                { label: "Oct", value: "10" },
                { label: "Nov", value: "11" },
                { label: "Dec", value: "12" },
              ].map((m) => {
                const isActive = tempMonth === m.value;
                const isDisabled = isMonthDisabled(m.value);
                return (
                  <TouchableOpacity
                    key={m.value}
                    disabled={isDisabled}
                    style={[
                      styles.monthGridItem,
                      isActive && styles.monthGridItemActive,
                      isDisabled && styles.monthGridItemDisabled,
                    ]}
                    onPress={() => {
                      console.log("[Analytics] Selected Month:", m.label, "value:", m.value);
                      setTempMonth(m.value);
                    }}
                    activeOpacity={isDisabled ? 1 : 0.7}
                  >
                    <Text
                      style={[
                        styles.monthGridItemText,
                        isActive && styles.monthGridItemTextActive,
                        isDisabled && styles.monthGridItemTextDisabled,
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.pickerActions}>
              <TouchableOpacity
                style={[styles.pickerActionBtn, styles.pickerCancelBtn]}
                onPress={() => setPickerVisible(false)}
              >
                <Text style={styles.pickerCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerActionBtn, styles.pickerOkBtn]}
                onPress={handleConfirmDate}
              >
                <Text style={styles.pickerOkBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
    gap: 40,
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
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -1.5,
    left: 0,
    right: 0,
    height: 3.5,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 3.5,
    borderTopRightRadius: 3.5,

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
  chartPeriodBar: {
    flexDirection: "row",
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 4,
    alignItems: "center",
    width: "100%",
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    color: "#7A7A7A",
  },
  periodButtonTextActive: {
    color: Colors.white,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: "#E5E5E5",
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  reportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportLeftColumn: {
    flexDirection: "column",
  },
  reportTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: "#1A1A1A",
  },
  reportSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#A0A0A0",
    marginTop: 4,
  },
  reportRightColumn: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  reportValue: {
    fontSize: 32,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: Colors.primary,
    lineHeight: 38,
  },
  reportMetricLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#A0A0A0",
    marginTop: 4,
  },
  salesContainer: {
    width: "100%",
  },
  salesFormCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  salesInputGroup: {
    marginBottom: 16,
  },
  salesInputLabel: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    color: Colors.gray,
    marginBottom: 8,
  },
  salesDateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,


  },
  salesDateText: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "#2C2C2C",
  },
  salesDatePlaceholder: {
    color: Colors.gray,
  },
  salesRequestBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  salesRequestBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
  },
  salesDashedBox: {
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: "#D2D2D2",
    borderRadius: 12,
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  salesDashedText: {
    color: "#9A9A9A",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  pickerTitle: {
    fontSize: 17,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: "#2C2C2C",
    textAlign: "center",
    marginBottom: 20,
  },
  reportsListContainer: {
    marginTop: 16,
    width: "100%",
  },
  reportListCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0EFFB",
  },
  reportCardDateText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#2C2C2C",
  },
  reportDownloadBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  reportDownloadBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
  },
  yearSelectorRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 24,
    marginBottom: 20,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingVertical: 8,
  },
  yearNavBtn: {
    padding: 8,
  },
  yearText: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: "#2C2C2C",
    minWidth: 60,
    textAlign: "center",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 24,
  },
  monthGridItem: {
    width: "30%",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F0EFFB",
  },
  monthGridItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  monthGridItemText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#3A3A3A",
  },
  monthGridItemTextActive: {
    color: Colors.white,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
  },
  pickerActions: {
    flexDirection: "row",
    columnGap: 12,
  },
  pickerActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerCancelBtn: {
    backgroundColor: "#F0EFFB",
  },
  pickerCancelBtnText: {
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    fontSize: 15,
  },
  pickerOkBtn: {
    backgroundColor: Colors.primary,
  },
  pickerOkBtnText: {
    color: Colors.white,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    fontSize: 15,
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
  pickerSubTitle: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 10,
    marginTop: 10,
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  monthGridItemDisabled: {
    backgroundColor: "#F9F9FB",
    borderColor: "#EAEAEA",
    opacity: 0.45,
  },
  monthGridItemTextDisabled: {
    color: "#BBBBBB",
  },
  tabsAndPeriodRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderColor: "#F0EFFB",
  },
  salesTabButtons: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 10,
  },
  salesTabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#F1F1F1",
  },
  salesTabBtnActive: {
    backgroundColor: Colors.primary,
  },
  salesTabBtnText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#555555",
  },
  salesTabBtnTextActive: {
    color: Colors.white,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  salesPeriodContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 20,
    padding: 2,
    backgroundColor: Colors.white,
  },
  salesPeriodBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  salesPeriodBtnText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#7A7A7A",
  },
  salesPeriodBtnTextActive: {
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  salesPeriodDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#E5E5E5",
  },
  salesPeriodRowBelow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
  },

});
