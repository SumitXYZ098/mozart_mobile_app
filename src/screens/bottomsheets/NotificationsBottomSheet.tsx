import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface NotificationsBottomSheetProps {
  onClose: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

export default function NotificationsBottomSheet({ onClose }: NotificationsBottomSheetProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Welcome to Mozart!',
      message: 'Thank you for joining our music community. Start exploring amazing features.',
      time: '2 hours ago',
      type: 'success',
      read: false,
    },
    {
      id: '2',
      title: 'New Music Available',
      message: 'Check out the latest releases from your favorite artists.',
      time: '5 hours ago',
      type: 'info',
      read: false,
    },
    {
      id: '3',
      title: 'Security Alert',
      message: 'We noticed a new login from an unknown device. If this wasn\'t you, please secure your account.',
      time: '1 day ago',
      type: 'warning',
      read: true,
    },
    {
      id: '4',
      title: 'Playlist Updated',
      message: 'Your "Favorites" playlist has been updated with new songs.',
      time: '2 days ago',
      type: 'info',
      read: true,
    },
    {
      id: '5',
      title: 'Account Verification',
      message: 'Please verify your email address to unlock all features.',
      time: '3 days ago',
      type: 'error',
      read: true,
    },
  ]);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'alert-circle';
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return Colors.error;
      default:
        return Colors.primary;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications" size={24} color={Colors.primary} />
            <View>
              <Text style={styles.settingText}>Push Notifications</Text>
              <Text style={styles.settingSubtext}>Receive notifications on your device</Text>
            </View>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: Colors.lightGray, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="mail" size={24} color={Colors.primary} />
            <View>
              <Text style={styles.settingText}>Email Notifications</Text>
              <Text style={styles.settingSubtext}>Receive notifications via email</Text>
            </View>
          </View>
          <Switch
            value={emailEnabled}
            onValueChange={setEmailEnabled}
            trackColor={{ false: Colors.lightGray, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="megaphone" size={24} color={Colors.primary} />
            <View>
              <Text style={styles.settingText}>Marketing</Text>
              <Text style={styles.settingSubtext}>Receive promotional content</Text>
            </View>
          </View>
          <Switch
            value={marketingEnabled}
            onValueChange={setMarketingEnabled}
            trackColor={{ false: Colors.lightGray, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>
      </View>

      {/* Notifications List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Recent Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </Text>
        
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              !notification.read && styles.unreadNotification
            ]}
            onPress={() => markAsRead(notification.id)}
          >
            <View style={styles.notificationLeft}>
              <Ionicons
                name={getNotificationIcon(notification.type)}
                size={24}
                color={getNotificationColor(notification.type)}
              />
              <View style={styles.notificationContent}>
                <Text style={[
                  styles.notificationTitle,
                  !notification.read && styles.unreadText
                ]}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>
                  {notification.time}
                </Text>
              </View>
            </View>
            {!notification.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  markAllText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  closeButton: {
    padding: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: Colors.black,
    marginLeft: 12,
    fontFamily: 'Poppins_400Regular',
  },
  settingSubtext: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 12,
    marginTop: 2,
    fontFamily: 'Poppins_400Regular',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  unreadNotification: {
    backgroundColor: Colors.lightGray + '20',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  notificationContent: {
    marginLeft: 12,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'Poppins_400Regular',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
});
