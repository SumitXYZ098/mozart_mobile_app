import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useToastStore, ToastItem } from '@/stores/useToastStore';

function ToastBubble({ toast }: { toast: ToastItem }) {
  const backgroundColor =
    toast.type === 'success' ? '#16a34a' : toast.type === 'error' ? '#dc2626' : '#2563eb';

  return (
    <View style={[styles.toast, { backgroundColor }]}> 
      <Text style={styles.toastText}>{toast.message}</Text>
    </View>
  );
}

export default function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.stack}>
        {toasts.map((t) => (
          <ToastBubble key={t.id} toast={t} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 48,
    alignItems: 'center',
    zIndex: 999,
  },
  stack: {
    gap: 8,
  },
  toast: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});


