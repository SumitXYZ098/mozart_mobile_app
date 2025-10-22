import React, { useState } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/app/HomeScreen';
import ProfileScreen from '@/screens/app/ProfileScreen';
import AnalyticsScreen from '@/screens/app/AnalyticsScreen';
import WalletScreen from '@/screens/app/WalletScreen';
import MusicScreen from '@/screens/app/MusicScreen';
import TabNavigation from '@/components/TabNavigation';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'wallet':
        return <WalletScreen />;
      case 'music':
        return <MusicScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View className="flex-1">
      {renderScreen()}
      <TabNavigation 
        activeTab={activeTab} 
        onTabPress={setActiveTab} 
      />
    </View>
  );
}
