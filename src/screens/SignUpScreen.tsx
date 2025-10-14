import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import InputField from '../components/InputField';
import { Colors } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>

      <InputField placeholder="First Name" />
      <InputField placeholder="Last Name" />
      <InputField placeholder="Email" keyboardType="email-address" />
      <InputField placeholder="Phone Number" keyboardType="phone-pad" />
      <InputField placeholder="Password" secureTextEntry />
      <InputField placeholder="Confirm Password" secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('VerifyEmail')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25, backgroundColor: Colors.white },
  title: { fontSize: 26, fontWeight: 'bold', color: Colors.primary, marginBottom: 20 },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: { color: Colors.white, textAlign: 'center', fontSize: 18, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  link: { color: Colors.primary, fontWeight: '600' },
});
