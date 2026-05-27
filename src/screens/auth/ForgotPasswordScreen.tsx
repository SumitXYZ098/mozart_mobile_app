import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

import { toast } from '../../stores/useToastStore';
import AuthLayout from '../../components/layout/AuthLayout';
import { useSendForgotOtp } from '@/hooks/useForgotPassword';
import InputField from '@/components/modules/InputField';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      duration: 600,
      useNativeDriver: true,
      toValue: 1,
    }).start();
  }, []);

  const { mutateAsync: sendForgotOtp, isPending } = useSendForgotOtp();

  const handleSend = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const resp = await sendForgotOtp(email.trim().toLowerCase());
      toast.success(resp?.message || 'OTP sent to your email');
      navigation.navigate('ResetPassword', { email: email.trim().toLowerCase() });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isButtonsDisabled = loading || isPending;

  return (
    <AuthLayout withBackground>
      <Animated.View
        style={[styles.container, { opacity: fadeAnim }]}
        className="h-auto"
      >
        <ScrollView contentContainerStyle={styles.inner}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a verification code</Text>
          
          <View style={styles.inputWrapper}>
            <InputField
              placeholder="Enter your email"
              label="Email"
              type="email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError('');
              }}
              error={error}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isButtonsDisabled && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={isButtonsDisabled}
          >
            {isButtonsDisabled ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: { },
  inner: {
    display: "flex",
    justifyContent: "flex-end",
    paddingVertical: 24,
    paddingHorizontal: 22,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary, textAlign: 'center' },
  subtitle: { color: Colors.gray, textAlign: 'center', marginVertical: 10 },
  inputWrapper: { marginVertical: 20 },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 16,
    color: Colors.black,
  },
  button: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 10 },
  buttonText: { color: Colors.white, textAlign: 'center', fontWeight: '600', fontSize: 18 },
  buttonDisabled: { backgroundColor: Colors.lightGray, opacity: 0.7 },
});