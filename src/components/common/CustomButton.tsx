import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  GestureResponderEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/theme/colors";

interface CustomButtonProps {
  label?: string;
  customClasses?: object;
  buttonType?: "primary" | "secondary" | "disable" | "white";
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  buttonType = "primary",
  customClasses = {},
  icon,
  endIcon,
  onPress,
  disabled = false,
  loading = false,
}) => {
  const gradientColors =
    buttonType === "primary"
      ? ["#6E36BE", "#370382"]
      : buttonType === "white"
      ? ["#FFFFFF", "#FFFFFF"]
      : [];

  const isGradient = buttonType === "primary" || buttonType === "white";

  const getButtonStyle = () => {
    switch (buttonType) {
      case "secondary":
        return {
          backgroundColor: Colors.lightPrimary,
        //   borderWidth: 1,
        //   borderColor: Colors.primary,
        };
      case "disable":
        return {
          backgroundColor: Colors.secondary,
        };
      case "white":
        return {
          borderWidth: 1,
          borderColor: Colors.primary,
        };
      default:
        return {};
    }
  };

  const getTextColor = () => {
    switch (buttonType) {
      case "primary":
        return Colors.white;
      case "secondary":
        return Colors.primary;
      case "disable":
        return Colors.gray;
      case "white":
        return Colors.primary;
      default:
        return Colors.white;
    }
  };

  const renderButtonContent = () => (
    <View style={styles.innerContainer}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        label && (
          <Text
            style={[styles.label, { color: getTextColor() }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        )
      )}
      {endIcon && <View style={styles.iconContainer}>{endIcon}</View>}
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.buttonWrapper, disabled && styles.disabled, customClasses]}
    >
      {isGradient ? (
        <LinearGradient
          colors={[gradientColors?.[0], gradientColors?.[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, getButtonStyle()]}
        >
          {renderButtonContent()}
        </LinearGradient>
      ) : (
        <View style={[styles.button, getButtonStyle()]}>
          {renderButtonContent()}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: 10,
    overflow: "hidden",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 6,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  disabled: {
    opacity: 0.6,
  },
});
