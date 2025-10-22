import React from 'react';
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

interface SettingsBottomSheetProps {
  onClose: () => void;
}

export default function SettingsBottomSheet({ onClose }: SettingsBottomSheetProps) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);

  const settingsItems = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: 'person-outline',
      onPress: () => console.log('Profile Settings'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-outline',
      onPress: () => console.log('Privacy & Security'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => console.log('Notifications'),
    },
    {
      id: 'language',
      title: 'Language',
      icon: 'language-outline',
      onPress: () => console.log('Language'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => console.log('Help & Support'),
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => console.log('About'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      {/* Quick Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications" size={24} color={Colors.primary} />
            <Text style={styles.settingText}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.lightGray, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon" size={24} color={Colors.primary} />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: Colors.lightGray, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="finger-print" size={24} color={Colors.primary} />
            <Text style={styles.settingText}>Biometric Login</Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={setBiometricEnabled}
            trackColor={{ false: Colors.lightGray, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>
      </View>

      {/* Settings Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {settingsItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => console.log('Logout')}>
        <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
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
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: Colors.black,
    marginLeft: 12,
    fontFamily: 'Poppins_400Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  logoutText: {
    fontSize: 16,
    color: Colors.error,
    marginLeft: 8,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});
