import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView
} from 'react-native';
import InputField from '../components/InputField';
import { Colors } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Welcome Back!</Text>
        <InputField placeholder="Email or phone number" />
        <InputField placeholder="Password" secureTextEntry />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.linkText}>Forgot password?</Text>

        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <Text>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 25, color: Colors.primary },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: { color: Colors.white, textAlign: 'center', fontSize: 18, fontWeight: '600' },
  linkText: { color: Colors.gray, textAlign: 'center', marginTop: 15 },
  signupText: { color: Colors.primary, fontWeight: '600' },
});
