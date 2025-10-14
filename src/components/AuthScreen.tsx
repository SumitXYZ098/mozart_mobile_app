import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { Button } from './Button';

interface AuthScreenProps {
  onLogin: () => void;
  onSignup: () => void;
}

const { width, height } = Dimensions.get('window');

export function AuthScreen({ onLogin, onSignup }: AuthScreenProps) {
  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay */}
        <View style={styles.overlay} />
        
        {/* Content */}
        <View style={styles.content}>
          {/* App Logo/Title */}
          <View style={styles.logoContainer}>
            <View className="bg-white/20 backdrop-blur-sm rounded-full p-6 mb-6">
              <View className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full items-center justify-center">
                <Text className="text-white text-3xl font-bold">M</Text>
              </View>
            </View>
            <Text className="text-white text-5xl font-bold mb-3 text-center">
              Mozart
            </Text>
            <Text className="text-white/90 text-xl text-center mb-12">
              Mobile App
            </Text>
          </View>

          {/* Auth Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Login"
              onPress={onLogin}
              variant="primary"
              className="mb-4 bg-white/90"
              textClassName="text-purple-600 font-semibold"
            />
            <Button
              title="Sign Up"
              onPress={onSignup}
              variant="outline"
              className="border-white/80 bg-transparent"
              textClassName="text-white font-semibold"
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
});
