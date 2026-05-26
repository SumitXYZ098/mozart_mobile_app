import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import AuthLayout from '../../components/layout/AuthLayout';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type ForgotPasswordSuccessProps = {};

export default function ForgotPasswordSuccessScreen({}: ForgotPasswordSuccessProps) {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <AuthLayout withBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>🎉 Password Reset Successful!</Text>
          <Text style={styles.message}>Your password has been updated. You can now log in with your new credentials.</Text>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, justifyContent: 'center', padding: 25 },
  content: { alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary, textAlign: 'center', marginBottom: 15 },
  message: { fontSize: 16, color: Colors.gray, textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  buttonText: { color: Colors.white, fontSize: 18, fontWeight: '600' },
});
