import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { useTicketStore } from "@/stores/ticketStore";

export default function SupportScreen() {
  const navigation = useNavigation<any>();
  const { tickets, loading, fetchTickets } = useTicketStore();

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  // Filter tickets by search query
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      (ticket.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    const st = status?.toLowerCase() || "";
    if (st.includes("progress") || st.includes("assign")) {
      return {
        bg: "#E0F2FE",
        text: "#0369A1",
        label: "In Progress",
      };
    } else if (st.includes("resolve") || st.includes("close")) {
      return {
        bg: "#DCFCE7",
        text: "#15803D",
        label: "Resolved",
      };
    }
    return {
      bg: "#F3E8FF",
      text: "#7E22CE",
      label: "Open",
    };
  };

  const formatCategory = (cat: string) => {
    const mapping: Record<string, string> = {
      technical_issue: "Technical Issue",
      content_management: "Content Management",
      arrange_meeting_call: "Arrange Meeting Call",
      quality_control_process: "Quality Control Process",
      copyright_claims: "Copyright Claims",
      invoices_payments: "Invoices & Payments",
      terminate_my_contract: "Terminate My Contract",
      general_question: "General Question",
      other: "Other",
    };
    return mapping[cat] || cat || "General Issue";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getCategoryIcon = (cat: string) => {
    const clean = cat?.toLowerCase() || "";
    if (clean.includes("tech")) return "cog";
    if (clean.includes("content")) return "albums";
    if (clean.includes("meet") || clean.includes("call")) return "calendar";
    if (clean.includes("quality") || clean.includes("control")) return "shield-checkmark";
    if (clean.includes("copyright") || clean.includes("claim")) return "alert-circle";
    if (clean.includes("invoice") || clean.includes("payment")) return "cash";
    if (clean.includes("contract") || clean.includes("terminate")) return "close-circle";
    return "help-circle";
  };

  const BarcodeMock = () => (
    <View style={styles.barcodeWrapper}>
      <View style={[styles.barcodeBar, { width: 1.5 }]} />
      <View style={[styles.barcodeBar, { width: 1, marginLeft: 1.5 }]} />
      <View style={[styles.barcodeBar, { width: 3, marginLeft: 1 }]} />
      <View style={[styles.barcodeBar, { width: 1, marginLeft: 1.5 }]} />
      <View style={[styles.barcodeBar, { width: 2, marginLeft: 1 }]} />
      <View style={[styles.barcodeBar, { width: 1.5, marginLeft: 1 }]} />
      <View style={[styles.barcodeBar, { width: 4, marginLeft: 2 }]} />
      <View style={[styles.barcodeBar, { width: 1, marginLeft: 1 }]} />
      <View style={[styles.barcodeBar, { width: 2, marginLeft: 1.5 }]} />
    </View>
  );

  const renderTicketItem = ({ item }: { item: any }) => {
    const statusInfo = getStatusStyle(item.status);
    const ticketNo = item.ticketNumber || `TKT-${item.id.slice(0, 6).toUpperCase()}`;
    const iconName = getCategoryIcon(item.category);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("TicketDetails", { ticketId: Number(item.id) })}
      >
        {/* Ticket Notches */}
        <View style={styles.notchLeft} />
        <View style={styles.notchRight} />

        {/* Ticket Top Section */}
        <View style={styles.cardHeader}>
          <Text style={styles.ticketId}>{ticketNo}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Ticket Main Details Layout with Category Icon */}
        <View style={styles.cardBody}>
          <View style={styles.iconContainer}>
            <Image
              source={require("../../../assets/icon.png")}
              style={{ width: 40, height: 40, tintColor: Colors.primary }}
              resizeMode="contain"
            />
          </View>
          <View style={styles.bodyTextContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardCategory}>
              {formatCategory(item.category || "quality_control_process")}
            </Text>
          </View>
        </View>

        {/* Perforated Separator Line */}
        <View style={styles.dashedLine} />

        {/* Ticket Bottom Section */}
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          <View style={styles.footerRight}>
            <BarcodeMock />
            <Ionicons name="chevron-forward" size={16} color={Colors.gray} style={{ marginLeft: 8 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray} style={styles.searchIcon} />
        <TextInput
          placeholder="Search tickets..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={Colors.gray}
          style={styles.searchInput}
        />
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredTickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No tickets found</Text>
          <Text style={styles.emptySubText}>
            If you need help, tap "Raise Ticket" at the bottom to submit a new issue request.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTicketItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
        />
      )}

      {/* Sticky Bottom Raise Ticket Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("RaiseTicket")}
          style={styles.bottomRaiseButton}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={20} color={Colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.bottomRaiseButtonText}>Raise Support Ticket</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
     
   },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Leave space for sticky bottom button
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
  },
  notchLeft: {
    position: "absolute",
    left: -8,
    bottom: 28,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F9FAFB", // matches parent background
    borderWidth: 1,
    borderColor: "#E5E7EB",
    zIndex: 10,
  },
  notchRight: {
    position: "absolute",
    right: -8,
    bottom: 28,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F9FAFB", // matches parent background
    borderWidth: 1,
    borderColor: "#E5E7EB",
    zIndex: 10,
  },
  dashedLine: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    height: 0,
    marginVertical: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 0,
  },
  cardDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 10,
  },
  bottomRaiseButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  bottomRaiseButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  // Adjust image style directly where Image is rendered (width/height 32)

  bodyTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  barcodeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 16,
    opacity: 0.2,
  },
  barcodeBar: {
    height: "100%",
    backgroundColor: "#000000",
  },
});
