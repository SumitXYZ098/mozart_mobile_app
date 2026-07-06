import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { useMyPaymentLogs } from "@/hooks/useSubscription";
import { useNavigation } from "@react-navigation/native";

export default function OrderHistoryScreen() {
  const { data: logs, isLoading: isLogsLoading } = useMyPaymentLogs();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isLogsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : !logs || logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#AEAEB2" />
            <Text style={styles.emptyText}>No orders generated yet</Text>
          </View>
        ) : (
          <View style={styles.logsBlock}>
            {logs.map((log: any, index: number) => {
              let title = log.type ?? "N/A";
              if (log.type === "upgrade") {
                title = "Upgrade Plan";
              } else if (log.type === "subscription") {
                title = `Subscription: ${log.plan?.name || "Premium"}`;
              } else if (log.type === "priority-upload") {
                title = "Priority Upload";
              } else if (log.type === "artist-addon") {
                title = "Artist Add-on";
              }

              const amount = Number(log.amount).toFixed(2);
              const currency = log.currency?.toUpperCase() ?? "";
              let symbol = "";
              if (currency === "USD" || currency === "CAD") symbol = "$";
              else if (currency === "INR") symbol = "₹";

              let formattedDate = "-";
              if (log.paidAt || log.createdAt) {
                const d = new Date(log.paidAt || log.createdAt);
                if (!isNaN(d.getTime())) {
                  const day = String(d.getDate()).padStart(2, "0");
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const year = d.getFullYear();
                  let hours = d.getHours();
                  const minutes = String(d.getMinutes()).padStart(2, "0");
                  const ampm = hours >= 12 ? "PM" : "AM";
                  hours = hours % 12;
                  hours = hours ? hours : 12;
                  formattedDate = `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
                }
              }

              const isSuccess = log.status === "success" || log.status === "succeeded";

              return (
                <View
                  key={log.id || index}
                  style={[
                    styles.logRow,
                    index === logs.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.logLeft}>
                    <Text style={styles.logTitle}>{title}</Text>
                    <Text style={styles.logDate}>{formattedDate}</Text>
                  </View>
                  <View style={styles.logRight}>
                    <Text style={styles.logAmount}>
                      {symbol}{amount} {currency}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        isSuccess ? styles.statusSuccess : styles.statusFailed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isSuccess
                            ? styles.statusSuccessText
                            : styles.statusFailedText,
                        ]}
                      >
                        {log.status
                          ? log.status.charAt(0).toUpperCase() +
                          log.status.slice(1)
                          : "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#8E8E93",
    fontFamily: "Poppins_400Regular",
  },
  logsBlock: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  logLeft: {
    flex: 1,
    marginRight: 10,
  },
  logTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
    fontFamily: "Poppins_500Medium",
    marginBottom: 4,
  },
  logDate: {
    fontSize: 12,
    color: "#8E8E93",
    fontFamily: "Poppins_400Regular",
  },
  logRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  logAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1C1E",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusSuccess: {
    backgroundColor: "#E6F4EA",
  },
  statusSuccessText: {
    color: "#137333",
  },
  statusFailed: {
    backgroundColor: "#FCE8E6",
  },
  statusFailedText: {
    color: "#C5221F",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Poppins_500Medium",
  },
});
