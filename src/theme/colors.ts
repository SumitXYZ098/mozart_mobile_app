import { useThemeStore } from "@/stores/useThemeStore";

export const getThemeColors = (isDark: boolean) => {
  return {
    primary: "#6739B7",
    white: isDark ? "#121214" : "#FFFFFF",
    black: isDark ? "#FFFFFF" : "#000000",
    gray: isDark ? "#8E8E93" : "#B3B3B3",
    lightGray: isDark ? "#2C2C2E" : "#E5E5E5",
    error: "#E63946",
    secondary: isDark ? "#1C1C1E" : "#F8F8F8",
    lightPrimary: isDark ? "#2A1D44" : "#EEE8FF",
    lightBlack: isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(17, 17, 17, 0.5)",
    bgGreen: isDark ? "#0F291B" : "#f0fff4",
    green: "#10b981",
    red: "#ef4444",
    bgRed: isDark ? "#2D0F0F" : "#ffe2e2",
  };
};

export const Colors = {
  primary: "#6739B7",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#B3B3B3",
  lightGray: "#E5E5E5",
  error: "#E63946",
  secondary: "#F8F8F8",
  lightPrimary: "#EEE8FF",
  lightBlack: "#11111180",
  bgGreen: "#f0fff4",
  green: "#10b981",
  red: "#ef4444",
  bgRed: "#ffe2e2",
};

export const useThemeColors = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  return getThemeColors(isDarkMode);
};
