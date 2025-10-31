import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, Modal } from "react-native";
import { ProgressBar } from "react-native-paper";
import { Colors } from "@/theme/colors";

export const LoadingOverlay = ({
  visible,
  message = "Processing...",
  progress = 0,
}: {
  visible: boolean;
  message?: string;
  progress?: number;
}) => {
  if (!visible) return null;

  const hasProgress = progress > 0 && progress < 100;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.text}>{message}</Text>

          {hasProgress && (
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={progress / 100}
                color={Colors.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    width: "80%",
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.gray,
    fontWeight: "500",
  },
  progressContainer: {
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 10,
  },
  progressText: {
    marginTop: 6,
    color: Colors.gray,
    fontWeight: "600",
  },
});