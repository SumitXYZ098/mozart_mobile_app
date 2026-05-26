import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useVerifyForgotOtp, useResendForgotOtp } from '@/hooks/useForgotPassword';
import { toast } from '../../stores/useToastStore';
import AuthLayout from '../../components/layout/AuthLayout';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const { mutateAsync: verifyOtp, isPending: verifying } = useVerifyForgotOtp();
  const { mutateAsync: resendOtp, isPending: resending } = useResendForgotOtp();

  const handleChange = (value: string, idx: number) => {
    const arr = [...code];
    arr[idx] = value;
    setCode(arr);
    if (value && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKey = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[idx] && idx > 0) {
      const arr = [...code];
      arr[idx - 1] = '';
      setCode(arr);
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = code.join('');
    if (otp.length < 6) {
      toast.error('Enter the 6‑digit OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await verifyOtp({ email, otp });
      toast.success(response.message || 'OTP verified');
      navigation.navigate('SetNewPassword', { email, otp });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'OTP verification failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending) return;
    try {
      await resendOtp(email);
      toast.success('OTP resent');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to resend OTP';
      toast.error(msg);
    }
  };

  const disabled = loading || verifying;

  return (
    <AuthLayout withBackground>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>We sent a 6‑digit code to {email}</Text>
        <View style={styles.otpContainer}>
          {code.map((d, i) => (
            <TextInput
              ref={ref => {
                inputs.current[i] = ref;
              }}
              key={i}
              style={styles.otpInput}
              maxLength={1}
              keyboardType="number-pad"
              onChangeText={v => handleChange(v, i)}
              onKeyPress={e => handleKey(e, i)}
              value={d}
            />
          ))}
        </View>
        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={disabled}
        >
          {disabled ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.resend}>
          Didn't receive?{' '}
          <Text style={[styles.link, resending && styles.linkDisabled]} onPress={handleResend}>
            {resending ? 'Resending...' : 'Resend'}
          </Text>
        </Text>
      </SafeAreaView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, justifyContent: 'center', padding: 25 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary, textAlign: 'center' },
  subtitle: { color: Colors.gray, textAlign: 'center', marginVertical: 10 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 30 },
  otpInput: { borderWidth: 1, borderColor: Colors.lightGray, borderRadius: 8, width: 45, height: 50, textAlign: 'center', fontSize: 20 },
  button: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 10 },
  buttonText: { color: Colors.white, textAlign: 'center', fontWeight: '600', fontSize: 18 },
  buttonDisabled: { backgroundColor: Colors.lightGray, opacity: 0.7 },
  resend: { textAlign: 'center', marginTop: 15, color: Colors.gray },
  link: { color: Colors.primary, fontWeight: '600' },
  linkDisabled: { color: Colors.gray },
});
