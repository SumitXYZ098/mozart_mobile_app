import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, G, Rect, Circle as SVGCircle } from "react-native-svg";
import { Colors } from "@/theme/colors";

interface FolderEmptyStateProps {
  title: string;
}

const FolderEmptyState: React.FC<FolderEmptyStateProps> = ({ title }) => {
  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIllustration}>
        {/* Soft Background Blob */}
        <View style={styles.emptyStateBlob} />
        
        <Svg width={140} height={120} viewBox="0 0 140 120" fill="none">
          {/* Sparkles */}
          {/* Top Left Sparkle */}
          <Path d="M 25,18 L 25,28 M 20,23 L 30,23" stroke="#8E44AD" strokeWidth={1.5} strokeLinecap="round" />
          {/* Bottom Left Sparkle */}
          <Path d="M 18,85 L 18,95 M 13,90 L 23,90" stroke="#8E44AD" strokeWidth={1.5} strokeLinecap="round" />
          {/* Top Right Sparkle */}
          <Path d="M 115,22 L 115,32 M 110,27 L 120,27" stroke="#8E44AD" strokeWidth={1.5} strokeLinecap="round" />
          {/* Bottom Right Sparkle */}
          <Path d="M 125,78 L 125,88 M 120,83 L 130,83" stroke="#8E44AD" strokeWidth={1.5} strokeLinecap="round" />

          {/* Tilting Paper behind the folder front */}
          <G transform="rotate(10, 70, 55)">
            {/* Paper body */}
            <Rect
              x={35}
              y={25}
              width={65}
              height={50}
              rx={6}
              fill="#FFFFFF"
              stroke="#8E44AD"
              strokeWidth={2}
            />
            {/* Sad Eyes */}
            <SVGCircle cx={55} cy={42} r={2} fill="#8E44AD" />
            <SVGCircle cx={80} cy={42} r={2} fill="#8E44AD" />
            {/* Sad Mouth Curve */}
            <Path
              d="M 62,55 Q 67.5,50 73,55"
              stroke="#8E44AD"
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
          </G>

          {/* Folder Front Cover */}
          <Path
            d="M 30,50 L 52,50 C 55,50 57,47 58,45 L 63,38 C 65,35 68,33 72,33 L 102,33 C 107,33 110,36 110,41 L 110,88 C 110,93 107,96 102,96 L 38,96 C 33,96 30,93 30,88 Z"
            fill="#FFFFFF"
            stroke="#8E44AD"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          
          <Path
            d="M 40,58 H 100 M 40,68 H 100"
            stroke="#F0EFFB"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </Svg>
        
        {/* Bold text inside folder zone */}
        <Text style={styles.emptyStateInsideText}>No Data</Text>
      </View>
      <Text style={styles.emptyStateSubtitle}>{title}</Text>
    </View>
  );
};

export default FolderEmptyState;

const styles = StyleSheet.create({
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0EFFB",
    marginVertical: 12,
    width: "100%",
  },
  emptyStateIllustration: {
    position: "relative",
    width: 140,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateBlob: {
    position: "absolute",
    width: 100,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(240, 239, 251, 0.6)",
    transform: [{ scaleX: 1.2 }, { rotate: "-15deg" }],
  },
  emptyStateInsideText: {
    position: "absolute",
    bottom: 34,
    fontSize: 14,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: "#8E44AD",
  },
  emptyStateSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: Colors.gray,
    marginTop: 12,
    textAlign: "center",
  },
});
