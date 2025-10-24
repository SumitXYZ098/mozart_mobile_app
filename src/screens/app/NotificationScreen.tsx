import { notifications } from "@/mock/mockData";
import { Colors } from "@/theme/colors";
import { Entypo, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NotificationScreen = ({ navigation }: any) => {
  const renderNotificationItem = ({ item, index }: any) => (
    <View style={[styles.notifyCard, index === 0 && styles.highlightCard]}>
      <View style={styles.iconContainor}>
        <Image
          source={require("../../../assets/images/notification.png")}
          resizeMode="contain"
          style={styles.notifyIcon}
        />
      </View>
      <View style={styles.contentContainor}>
        <Text style={styles.contentTitle}>{item.title}</Text>
        <Text
          style={styles.contentSubTitle}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.message}
        </Text>
        <View style={styles.contentDateTime}>
          <Text style={styles.dateTime}>{item.date}</Text>
          <Ionicons name="at-circle" size={4} color={Colors.gray} />
          <Text style={styles.dateTime}>{item.time}</Text>
        </View>
      </View>
    </View>
  );
  const sortedNotifications = notifications.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notification</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FlatList
          data={sortedNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: Colors.gray,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  notifyCard: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    columnGap: 12,
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderColor:'#FAFAFA',
    borderStyle: 'solid'
  },
  // 👇 Highlight style for first card
  highlightCard: {
    backgroundColor: Colors.lightPrimary,
  },
  iconContainor: {
    width: 40,
    height: 40,
    padding: 8,
    borderRadius: 99,
    backgroundColor: Colors.lightPrimary,
  },
  notifyIcon: {
    width: "auto",
    height: "100%",
  },
  contentContainor: {
    flexShrink: 1,
    flexDirection: "column",
    rowGap: 8,
  },
  contentTitle: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: 600,
  },
  contentSubTitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.gray,
  },
  contentDateTime: {
    flexDirection: "row",
    columnGap: 4,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dateTime: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: "Poppins_400Regular",
  },
});
