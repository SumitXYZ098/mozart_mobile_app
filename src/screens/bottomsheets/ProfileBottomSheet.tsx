import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface ProfileBottomSheetProps {
  onClose: () => void;
}

export default function ProfileBottomSheet({ onClose }: ProfileBottomSheetProps) {
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    joinDate: 'Member since 2023',
    stats: {
      posts: 42,
      followers: 1280,
      following: 340,
    },
  };

  const profileActions = [
    {
      id: 'edit',
      title: 'Edit Profile',
      icon: 'create-outline',
      onPress: () => console.log('Edit Profile'),
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      icon: 'shield-outline',
      onPress: () => console.log('Privacy Settings'),
    },
    {
      id: 'security',
      title: 'Security',
      icon: 'lock-closed-outline',
      onPress: () => console.log('Security'),
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: 'settings-outline',
      onPress: () => console.log('Preferences'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.joinDate}>{user.joinDate}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.stats.posts}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.stats.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.stats.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Profile Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {profileActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionItem}
            onPress={action.onPress}
          >
            <View style={styles.actionLeft}>
              <Ionicons name={action.icon as any} size={24} color={Colors.primary} />
              <Text style={styles.actionText}>{action.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Additional Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>
        <View style={styles.infoItem}>
          <Ionicons name="mail" size={20} color={Colors.gray} />
          <Text style={styles.infoText}>Email verified</Text>
          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="phone-portrait" size={20} color={Colors.gray} />
          <Text style={styles.infoText}>Phone verified</Text>
          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="finger-print" size={20} color={Colors.gray} />
          <Text style={styles.infoText}>Biometric enabled</Text>
          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
        </View>
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
  closeButton: {
    padding: 8,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  email: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
    fontFamily: 'Poppins_400Regular',
  },
  joinDate: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'Poppins_400Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingVertical: 20,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
    fontFamily: 'Poppins_400Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    color: Colors.black,
    marginLeft: 12,
    fontFamily: 'Poppins_400Regular',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  infoText: {
    fontSize: 14,
    color: Colors.black,
    marginLeft: 12,
    flex: 1,
    fontFamily: 'Poppins_400Regular',
  },
});
