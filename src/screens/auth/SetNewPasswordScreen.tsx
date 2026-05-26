import React, { useState } from 'react';
 
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useResetPassword } from '@/hooks/useForgotPassword';
import { toast } from '../../stores/useToastStore';
import AuthLayout from '../../components/layout/AuthLayout';

type Props = NativeStackScreenProps<AuthStackParamList, 'SetNewPassword'>;

export default function SetNewPasswordScreen({ navigation, route }: Props) {
  const { email, otp } = route.params;

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutateAsync: resetPassword, isPending } = useResetPassword();

  const handleSubmit = async () => {
    if (!password || !passwordConfirmation) {
      toast.error('Please fill all fields');
      return;
    }
    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword: password });
      toast.success('Your password has been updated');
      setTimeout(() => navigation.navigate('Login'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to reset password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout withBackground>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>Enter a new password for {email}</Text>
        <View style={styles.inputWrapper}>
          <View style={styles.inputWithIcon}>
            <TextInput
              placeholder="New Password"
              secureTextEntry={!showPassword}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.iconInside}
            >
              <Text>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <View style={styles.inputWithIcon}>
            <TextInput
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.iconInside}
            >
              <Text>{showConfirmPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.button, (loading || isPending) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading || isPending}
        >
          {loading || isPending ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttons}>Reset Password</Text>
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
  inputWrapper: { marginVertical: 10, width: '100%' },
  inputWithIcon: { position: 'relative', width: '100%', flexDirection: 'row' },
  iconInside: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingRight: 40,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.black,
    flex: 1,
  },
  button: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 10, width: '100%' },
  buttonDisabled: { backgroundColor: Colors.lightGray, opacity: 0.7 },


  buttons:{ color: Colors.white, textAlign: 'center', fontSize: 16 },


});
