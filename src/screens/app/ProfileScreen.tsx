import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Your Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
  text: { color: Colors.primary, fontSize: 22, fontWeight: '600' },
});
