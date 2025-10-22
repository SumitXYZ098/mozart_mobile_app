import React from 'react';
import { View, ImageBackground, StyleSheet, StatusBar } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  withBackground?: boolean;
}

export default function AuthLayout({ children, withBackground = true }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      {withBackground ? (
        <ImageBackground
          source={require('../../assets/images/background.png')}
          style={styles.background}
          resizeMode="cover">
          <View style={styles.overlay}>{children}</View>
        </ImageBackground>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, justifyContent: 'center', width:'100%', height:'100%' },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
