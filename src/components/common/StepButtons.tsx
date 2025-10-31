import { Colors } from "@/theme/colors";
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export const StepButtons = ({
  onNext,
  onBack,
  nextText = "Next Step",
  backText = "Back",
}: {
  onNext?: () => void;
  onBack?: () => void;
  nextText?: string;
  backText?: string;
}) => (
  <View style={styles.btnContainer}>
    {onNext && (
      <TouchableOpacity onPress={onNext} style={styles.nextBtn} >
        <Text style={styles.nextText}>{nextText}</Text>
      </TouchableOpacity>
    )}
    {onBack && (
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>{backText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: "column",
    justifyContent: "center",
    rowGap: 16,
    marginTop: 30,
  },
  backBtn: {
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 12,
  },
  nextBtn: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 12,
  },
  backText: { color: Colors.gray, fontWeight: "600" },
  nextText: { color: Colors.white, fontWeight: "600" },
});
