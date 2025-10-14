import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export default function VerifyEmailScreen({ navigation }: Props) {
  const [code, setCode] = useState(['', '', '', '', '', '']);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Account</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to your email</Text>

      <View style={styles.otpContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpInput}
            maxLength={1}
            keyboardType="number-pad"
            onChangeText={(value) => {
              const updated = [...code];
              updated[index] = value;
              setCode(updated);
            }}
            value={digit}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Verified')}>
        <Text style={styles.buttonText}>Verify Email</Text>
      </TouchableOpacity>

      <Text style={styles.resend}>Didn’t receive the code? <Text style={styles.link}>Resend</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, justifyContent: 'center', padding: 25 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary, textAlign: 'center' },
  subtitle: { color: Colors.gray, textAlign: 'center', marginVertical: 10 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 30 },
  otpInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    width: 45,
    height: 50,
    textAlign: 'center',
    fontSize: 20,
  },
  button: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 10 },
  buttonText: { color: Colors.white, textAlign: 'center', fontWeight: '600', fontSize: 18 },
  resend: { textAlign: 'center', marginTop: 15, color: Colors.gray },
  link: { color: Colors.primary, fontWeight: '600' },
});
