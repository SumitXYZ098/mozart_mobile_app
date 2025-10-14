import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.bg}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signUpbutton} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  container: { paddingBottom: 60 },
  button: {
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 100,
    borderRadius: 30,
    marginBottom: 15,
  },
  signUpbutton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 100,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.white,
    marginBottom: 15,
  },
  buttonText: { color: Colors.primary, fontWeight: 'bold', fontSize: 18 },
  signUpText: { color: Colors.white, fontSize: 16 },
});
