import React from 'react';
import { TextInput, View, StyleSheet, Text, TextInputProps } from 'react-native';
import { Colors } from '../theme/colors';

interface Props extends TextInputProps {
  label?: string;
}

export default function InputField({ label, ...props }: Props) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholderTextColor="#999"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { color: Colors.black, marginBottom: 5, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
});
