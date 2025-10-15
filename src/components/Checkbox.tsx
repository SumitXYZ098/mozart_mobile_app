import React, { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  color?: string;
}

export default function Checkbox({
  label,
  checked: controlledChecked,
  onChange,
  color = "#6739B7",
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(false);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const toggleCheckbox = () => {
    const newValue = !checked;
    if (!isControlled) setInternalChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleCheckbox}
      className="flex flex-row items-center gap-x-1"
    >
      <View
        className={`w-4 h-4 border flex items-center rounded-sm justify-center ${
          checked ? "border-transparent" : "border-gray-400"
        }`}
        style={{
          backgroundColor: checked ? color : "transparent",
        }}
      >
        {checked && <Ionicons name="checkmark" size={12} color="white" />}
      </View>
      {label && <Text className="text-[#B3B3B3] text-sm font-poppins ">{label}</Text>}
    </TouchableOpacity>
  );
}
