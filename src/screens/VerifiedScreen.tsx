import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Verified'>;

export default function VerifiedScreen({ navigation }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.check}>✓</Text>
      </Animated.View>

      <Text style={styles.text}>Verified!</Text>
      <Text style={styles.sub}>You have successfully verified your account.</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Onboarding')}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  check: { color: Colors.white, fontSize: 40, fontWeight: 'bold' },
  text: { fontSize: 26, fontWeight: 'bold', color: Colors.primary },
  sub: { color: Colors.gray, marginVertical: 10, textAlign: 'center' },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
    width: 180,
  },
  buttonText: { color: Colors.white, textAlign: 'center', fontSize: 16, fontWeight: '600' },
});
