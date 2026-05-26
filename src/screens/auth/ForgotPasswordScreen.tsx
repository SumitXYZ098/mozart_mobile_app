import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

import { toast } from '../../stores/useToastStore';
import AuthLayout from '../../components/layout/AuthLayout';
import { useSendForgotOtp } from '@/hooks/useForgotPassword';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const { mutateAsync: sendForgotOtp, isPending } = useSendForgotOtp();

  const handleSend = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
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

  return (
    <AuthLayout withBackground>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email to receive a verification code</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <TouchableOpacity
          style={[styles.button, (loading || isPending) && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={loading || isPending}
        >
          {loading || isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, justifyContent: 'center', padding: 25 },
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
