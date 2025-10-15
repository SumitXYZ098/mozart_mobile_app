import React, { useEffect, useRef } from 'react';
import { View, Animated, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.delay(1000),
    ]).start(() => navigation.replace('Onboarding'));
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.primary }]}>
      <Animated.Image
        source={require('../../assets/icon.png')}
        style={[styles.logo, { opacity: fadeAnim }]}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 172, height: 80 },
});
