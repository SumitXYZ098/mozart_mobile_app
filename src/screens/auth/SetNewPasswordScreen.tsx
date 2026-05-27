import React, { useState, useRef, useEffect } from 'react';
 
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useResetPassword } from '@/hooks/useForgotPassword';
import { toast } from '../../stores/useToastStore';
import AuthLayout from '../../components/layout/AuthLayout';
import InputField from '@/components/modules/InputField';

type Props = NativeStackScreenProps<AuthStackParamList, 'SetNewPassword'>;

export default function SetNewPasswordScreen({ navigation, route }: Props) {
  const { email, otp } = route.params;

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      duration: 600,
      useNativeDriver: true,
      toValue: 1,
    }).start();
  }, []);

  const { mutateAsync: resetPassword, isPending } = useResetPassword();

  const handleSubmit = async () => {
    let hasError = false;
    setPasswordError('');
    setConfirmPasswordError('');

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }
    if (!passwordConfirmation) {
      setConfirmPasswordError('Confirm password is required');
      hasError = true;
    }

    if (hasError) return;

    if (password !== passwordConfirmation) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword: password });
      toast.success('Your password has been updated successfully');
      setTimeout(() => navigation.navigate('Login'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to reset password';
      toast.error(msg);
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
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>Enter a new password for {email}</Text>
          
          <View style={styles.inputWrapper}>
            <InputField
              placeholder="New Password"
              label="New Password"
              type="password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
            />
          </View>

          <View style={styles.inputWrapper}>
            <InputField
              placeholder="Confirm Password"
              label="Confirm Password"
              type="password"
              value={passwordConfirmation}
              onChangeText={(text) => {
                setPasswordConfirmation(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              error={confirmPasswordError}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isButtonsDisabled && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isButtonsDisabled}
          >
            {isButtonsDisabled ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttons}>Reset Password</Text>
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
  inputWrapper: { marginVertical: 10, width: '100%' },
  button: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 10, width: '100%' },
  buttonDisabled: { backgroundColor: Colors.lightGray, opacity: 0.7 },
  buttons:{ color: Colors.white, textAlign: 'center', fontSize: 16 },
});