import axios from "axios";
import { ENDPOINTS } from "@/api/endpoints";
import { Colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useAuthStore } from "@/stores/useAuthStore";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Utility to format date and time safely from raw inputs or ISO timestamps
const formatNotificationTime = (item: any) => {
  if (item.date && item.time) {
    return { date: item.date, time: item.time };
  }
  const dateSource = item.created_at || item.createdAt || item.date;
  if (!dateSource) {
    return { date: "", time: "" };
  }
  const dateObj = new Date(dateSource);
  if (isNaN(dateObj.getTime())) {
    return { date: String(item.date || ""), time: String(item.time || "") };
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;

  return {
    date: `${day} ${month} ${year}`,
    time: `${hours}:${minutesStr} ${ampm}`
  };
};

const NotificationScreen = () => {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { user } = useAuthStore();

  const fetchNotifications = React.useCallback(async () => {
    if (!user?.token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const res = await axios.get(ENDPOINTS.NOTIFICATIONS, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const responseData = res.data;
      const list = Array.isArray(responseData)
        ? responseData
        : (responseData && Array.isArray(responseData.data) ? responseData.data : []);
      setNotifications(list);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.token]);
console.log('Token:', user?.token);
console.log('Endpoint:', ENDPOINTS.NOTIFICATIONS);
  React.useEffect(() => {
    if (isFocused) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isFocused, fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (item: any) => {
    if (item.read) return;  
    if (!user?.token) return;
    try {
      await axios.put(
        ENDPOINTS.MARK_NOTIFICATION_AS_READ(item.id),
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setNotifications(prev =>
        prev.map(n => {
          const nId = n.id || n._id;
          if (nId === item.id) {
            if (n.attributes) {
              return {
                ...n,
                attributes: {
                  ...n.attributes,
                  read: true,
                  is_read: true,
                  isRead: true,
                  status: 'read'
                }
              };
            }
            return { ...n, read: true, is_read: true, isRead: true, status: 'read' };
          }
          return n;
        })
      );
    } catch (e) {
      console.error('Mark read error', e);
    }
  };

  // Map backend keys to unified schema
  const parsedNotifications = notifications.map((item: any) => {
    const attrs = item.attributes || {};
    const id = item.id || item._id;
    const title = attrs.title || item.title || attrs.subject || item.subject || 'Notification';
    const message = attrs.message || item.message || attrs.body || item.body || attrs.content || item.content || attrs.description || item.description || '';
    const isRead = !!(
      attrs.read || item.read ||
      attrs.is_read || item.is_read ||
      attrs.isRead || item.isRead ||
      attrs.status === 'read' || item.status === 'read'
    );
    const dateTime = formatNotificationTime({ ...item, ...attrs });

    return {
      id,
      title,
      message,
      read: isRead,
      date: dateTime.date,
      time: dateTime.time,
      rawDate: attrs.createdAt || attrs.created_at || item.created_at || item.createdAt || attrs.date || item.date || ''
    };
  });

  // Sort: newest first
  const sortedNotifications = [...parsedNotifications].sort((a, b) => {
    const timeA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
    const timeB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
    return timeB - timeA;
  });

  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleMarkAsRead(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.notifyCard, !item.read && styles.highlightCard]}>
        <View style={styles.iconContainor}>
          <Image
            source={require("../../../assets/images/notification.png")}
            resizeMode="contain"
            style={styles.notifyIcon}
          />
        </View>
        <View style={styles.contentContainor}>
          <View style={styles.titleRow}>
            <Text style={styles.contentTitle}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.contentSubTitle} numberOfLines={3} ellipsizeMode="tail">
            {item.message}
          </Text>
          <View style={styles.contentDateTime}>
            <Text style={styles.dateTime}>{item.date}</Text>
            <Ionicons name="at-circle" size={4} color={Colors.gray} />
            <Text style={styles.dateTime}>{item.time}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color={Colors.gray} style={{ opacity: 0.5 }} />
      <Text style={styles.emptyText}>No Notifications Yet</Text>
      <Text style={styles.emptySubText}>We'll let you know when something important happens.</Text>
    </View>
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sortedNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white
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
    fontWeight: "600",
    color: Colors.gray,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notifyCard: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    columnGap: 12,
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderColor: "#FAFAFA",
    borderStyle: "solid",
  },
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
    flex: 1,
    flexDirection: "column",
    rowGap: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contentTitle: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.gray,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.gray,
    opacity: 0.7,
    marginTop: 8,
    textAlign: "center",
  },
});
