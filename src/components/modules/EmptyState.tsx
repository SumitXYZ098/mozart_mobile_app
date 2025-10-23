import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Colors } from "@/theme/colors";

interface EmptyStateProps {
  imageSource: any;
  title: string;
  subtitle: string;
}

const EmptyState = ({ imageSource, title, subtitle }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Image source={imageSource} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingHorizontal: 24,
  },
  image: {
    width: 160,
    height: 160,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    color: Colors.black,
    fontFamily: "PlusJakartaSans_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "center",
    marginTop: 4,
  },
});
