import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnalyticsScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-800">Analytics</Text>
        <Text className="text-gray-600 mt-2">Coming soon...</Text>
      </View>
    </SafeAreaView>
  );
};

export default AnalyticsScreen;
