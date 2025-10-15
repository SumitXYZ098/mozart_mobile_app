import React from "react";
import { View, Text, ViewProps } from "react-native";

interface DividerProps extends ViewProps {
  label?: string; // optional text in the middle
  color?: string; // default gray
  thickness?: number;
  marginVertical?: number;
}

export default function Divider({
  label,
  color = "#E5E7EB", // default Tailwind gray-200
  thickness = 1,
  marginVertical = 16,
  style,
  ...rest
}: DividerProps) {
  return (
    <View
      className="flex-row items-center justify-center"
      style={[{ marginVertical }, style]}
      {...rest}
    >
      {/* Left line */}
      <View
        className="flex-1"
        style={{
          height: thickness,
          backgroundColor: color,
        }}
      />

      {/* Optional label in middle */}
      {label && (
        <Text className="text-[#b3b3b3] mx-3 text-sm font-medium font-poppins">{label}</Text>
      )}

      {/* Right line */}
      <View
        className="flex-1"
        style={{
          height: thickness,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
