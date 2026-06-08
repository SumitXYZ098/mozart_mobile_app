import { Colors } from '@/theme/colors';
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
 
/**
 * Simple error component that shows an image above the error message.
 * Props:
 *   - image: require(...) or {uri: ...}
 *   - message: string (error text)
 */
export const ErrorWithImage = ({ image, message }: { image: any; message: string }) => (
  <View style={styles.container}>
    <Image source={image} style={styles.image} resizeMode="contain" />
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  message: {
    color: Colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
});
