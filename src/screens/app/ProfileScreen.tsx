import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuthStore } from '@/stores/useAuthStore';


export default function ProfileScreen() {
  const { logOut } = useAuthStore();

  const profileActions = [
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Manage your preferences',
      icon: 'settings-outline',
      color: Colors.primary,
      onPress: ()=> console.log('Settings'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your notifications',
      icon: 'notifications-outline',
      color: '#F59E0B',
      onPress: ()=> console.log('Notifications'),
    },
    {
      id: 'logout',
      title: 'Log out',
      subtitle: 'Sign out of your account',
      icon: 'log-out-outline',
      color: '#EF4444',
      onPress: () => logOut(),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {profileActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
              >
                <View style={styles.actionContent}>
                  <Ionicons name={action.icon as any} size={32} color={action.color} />
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <Ionicons name="person-circle" size={48} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>John Doe</Text>
              <Text style={styles.infoSubtitle}>john.doe@example.com</Text>
              <Text style={styles.infoDate}>Member since 2023</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Poppins_400Regular',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray + '30',
    borderRadius: 12,
    padding: 16,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  infoSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
    fontFamily: 'Poppins_400Regular',
  },
  infoDate: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'Poppins_400Regular',
  },
});
