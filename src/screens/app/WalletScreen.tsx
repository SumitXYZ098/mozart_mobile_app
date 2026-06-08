import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../../theme/colors";

const TRANSACTIONS = [
  { id: "1", amount: "₹14000.00", date: "24, June 2025 ,03:00 PM" },
  { id: "2", amount: "₹16000.00", date: "25, June 2025 ,04:00 PM" },
  { id: "3", amount: "₹20000.00", date: "27, June 2025 ,06:00 PM" },
  { id: "4", amount: "₹22000.00", date: "28, June 2025 ,07:00 PM" },
  { id: "5", amount: "₹18000.00", date: "26, June 2025 ,05:00 PM" },
  { id: "6", amount: "₹18000.00", date: "26, June 2025 ,05:00 PM" },
  { id: "7", amount: "₹18000.00", date: "26, June 2025 ,05:00 PM" },
  { id: "8", amount: "₹18000.00", date: "26, June 2025 ,05:00 PM" },
];

export default function WalletScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<"balance" | "history">("balance");

  const handleWithdraw = () => {
    Alert.alert(
      "Success",
      "Withdrawal request submitted successfully.",
      [{ text: "OK" }],
      { cancelable: true }
    );
  };

  const renderTransactionItem = (item: typeof TRANSACTIONS[0]) => (
    <View key={item.id} style={styles.transactionCard}>
      <View style={styles.transactionLeft}>
        <View style={styles.amountContainer}>
          <Text style={styles.transactionAmount}>{item.amount}</Text>
          <MaterialIcons name="check-circle" size={16} color={Colors.green || "#10B981"} style={styles.checkIcon} />
        </View>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
        <MaterialIcons name="more-vert" size={20} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("HomeTab")}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Notification")}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab("balance")}
          style={[
            styles.tabButton,
            activeTab === "balance" && styles.activeTabButton,
          ]}
          activeOpacity={0.9}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "balance" && styles.activeTabText,
            ]}
          >
            Balance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("history")}
          style={[
            styles.tabButton,
            activeTab === "history" && styles.activeTabButton,
          ]}
          activeOpacity={0.9}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "balance" ? (
          <>
            {/* Balance Card */}
            <LinearGradient
              colors={["#7324D6", "#9E58F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardLabel}>Your Balance</Text>
                <Text style={styles.cardSublabel}>Current Balance</Text>
                <Text style={styles.balanceText}>₹100K</Text>
                <TouchableOpacity
                  onPress={handleWithdraw}
                  style={styles.withdrawButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.withdrawButtonText}>Withdraw</Text>
                </TouchableOpacity>
              </View>
              <Image
                source={require("../../../assets/images/wallet2.png")}
                style={styles.walletImage}
                resizeMode="contain"
              />
            </LinearGradient>

            {/* Recent Transactions Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity
                onPress={() => setActiveTab("history")}
                activeOpacity={0.6}
              >
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>

            {/* List first 4 transactions */}
            {TRANSACTIONS.slice(0, 4).map(renderTransactionItem)}
          </>
        ) : (
          <>
            {/* History Tab List */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
            </View>

            {/* List all transactions */}
            {TRANSACTIONS.map(renderTransactionItem)}
          </>
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
  headerButton: {
    backgroundColor: "#F4EFFF",
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A4A4A",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5FA",
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: "#E8D5FF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#AEAEB2",
    fontFamily: "Poppins_400Regular",
  },
  activeTabText: {
    color: Colors.primary,
    fontFamily: "Poppins_500Medium",
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Add padding bottom so it floats nicely over bottom bar
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    height: 195,
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
    overflow: "visible", // let wallet float nicely
    marginBottom: 24,
  },
  cardLeft: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardLabel: {
    fontSize: 18,
    color: Colors.white,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
  },
  cardSublabel: {
    fontSize: 11,
    color: Colors.white,
    opacity: 0.75,
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
  },
  balanceText: {
    fontSize: 38,
    color: Colors.white,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "800",
    marginVertical: 4,
  },
  withdrawButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  withdrawButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Poppins_500Medium",
  },
  walletImage: {
    width: 180,
    height: 180,
    position: "absolute",
    right: -12,
    bottom: -8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "Poppins_500Medium",
    fontWeight: "600",
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F2EDF7",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: {
    flex: 1,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    fontFamily: "Poppins_600SemiBold",
  },
  checkIcon: {
    marginLeft: 6,
  },
  transactionDate: {
    fontSize: 11,
    color: "#8E8E93",
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
  },
  moreButton: {
    padding: 4,
  },
});
