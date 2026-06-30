import React, { useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Svg, { Path, Circle, G, Text as SVGText } from "react-native-svg";

import { Colors } from "@/theme/colors";
import FolderEmptyState from "./FolderEmptyState";

interface ChannelData {
  channel: string;
  totalUnits: number;
  percentage: string;
}

interface BestPerformingStoresProps {
  data: ChannelData[];
  loading: boolean;
  totalStreams: string;
  isEarnings?: boolean;
}

const PALETTE = [
  "#E57E20", // Spotify Orange
  "#9B59B6", // Instagram Purple
  "#FFA726", // Soundcloud Yellow
  "#2ECC71", // Audiomack Green
  "#FC3C44", // Apple Music Red
  "#111111", // Youtube Music Black
];

const getChannelColor = (channelName: string, index: number) => {
  const name = channelName.toLowerCase();
  if (name.includes("spotify")) return "#E57E20";
  if (name.includes("apple")) return "#FC3C44";
  if (name.includes("soundcloud")) return "#FFA726";
  if (name.includes("youtube")) return "#111111";
  if (name.includes("audiomack")) return "#2ECC71";
  if (name.includes("instagram")) return "#9B59B6";
  return PALETTE[index % PALETTE.length];
};

const formatUnits = (units: number, isEarnings: boolean) => {
  if (isEarnings) {
    const kValue = (units * 3.25) / 1000;
    const formatted = kValue >= 10 ? Math.round(kValue) : kValue.toFixed(1);
    return `₹${formatted}K`;
  } else {
    if (units >= 1000) {
      return `${(units / 1000).toFixed(1)}K`;
    }
    return String(units);
  }
};

const BestPerformingStores: React.FC<BestPerformingStoresProps> = ({
  data,
  loading,
  totalStreams,
  isEarnings = false,
}) => {
  // --- PIXEL PERFECT GEOMETRY FOR MOCKUP ---
  const R = 82;
  const C = 2 * Math.PI * R; // ~515.22
  const strokeWidth = 34; // Perfectly chunky segments
  const size = 330;
  const center = size / 2;

  // Sorting order mapping mockup starting from Top-Right
  const donutData = useMemo(() => {
    const clockwiseOrder = ["soundcloud", "instagram", "audiomack", "youtube", "apple", "spotify"];
    return [...data].sort((a, b) => {
      const aIdx = clockwiseOrder.findIndex((o) => a.channel.toLowerCase().includes(o));
      const bIdx = clockwiseOrder.findIndex((o) => b.channel.toLowerCase().includes(o));
      return aIdx - bIdx;
    });
  }, [data]);

  // Track spacing offsets correctly to avoid dynamic visual overlapping
  let accumulatedPercentage = 0;

  const centerDisplayValue = useMemo(() => {
    if (isEarnings) {
      const totalUnitsSum = data.reduce((sum, item) => sum + (item.totalUnits || 0), 0);
      if (totalUnitsSum <= 0) {
        return "₹0";
      }
      const kEarnings = (totalUnitsSum * 3.25) / 1000;
      const formatted = kEarnings >= 10 ? Math.round(kEarnings) : kEarnings.toFixed(1);
      return `₹${formatted}K`;
    }
    return totalStreams;
  }, [data, totalStreams, isEarnings]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Best Performing Stores</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : data.length === 0 ? (
        <FolderEmptyState title="No Store Data Available" />
      ) : (
        <View style={styles.container}>
          {/* SVG Donut Chart */}
          <View style={styles.chartWrapper}>
            {/* White shadow background circle matching the mockup shadow circle */}
            <View
              style={{
                position: "absolute",
                width: 240,
                height: 240,
                borderRadius: 109,
                backgroundColor: "#FFFFFF",
                borderColor: "#F8F8F8",
                borderWidth: 2,
              }}
            />
            <Svg width={size} height={size}>
              {/* Soft background track ring matching the mockup background circle (extends slightly outer/inner) */}
              <Circle
                cx={center}
                cy={center}
                r={86}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={46}
              />
              {donutData.map((item, index) => {
                const percentageVal = parseFloat(item.percentage) || 0;
                if (percentageVal <= 0) return null;

                const startPct = accumulatedPercentage;
                accumulatedPercentage += percentageVal;

                // Outer and Inner Radii balanced for 16px stroke expansion (keeping outer boundary under 104px)
                const rOut = 96;
                const rIn = 76; // base thickness 20px, expanded to 36px by the 16px stroke

                // Convert percentages to angles in radians starting at mockup's offset (-75 degrees)
                const startAngle = -Math.PI * 75 / 180 + (startPct / 100) * 2 * Math.PI;
                const endAngle = -Math.PI * 75 / 180 + (accumulatedPercentage / 100) * 2 * Math.PI;

                // Expanded gap adjustment in radians (compensating for 16px stroke width)
                const gapRad = data.length > 1 ? 0.32 : 0;
                const a1 = startAngle + gapRad / 2;
                const a2 = endAngle - gapRad / 2;

                if (a1 >= a2) return null;

                // Coordinates relative to center
                const x1 = center + rOut * Math.cos(a1);
                const y1 = center + rOut * Math.sin(a1);
                const x2 = center + rOut * Math.cos(a2);
                const y2 = center + rOut * Math.sin(a2);
                const x3 = center + rIn * Math.cos(a2);
                const y3 = center + rIn * Math.sin(a2);
                const x4 = center + rIn * Math.cos(a1);
                const y4 = center + rIn * Math.sin(a1);

                const largeArcFlag = (a2 - a1) > Math.PI ? 1 : 0;
                const pathD = `M ${x1} ${y1} A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
                const color = getChannelColor(item.channel, index);

                // --- dynamic label pointer logic ---
                const midAngle = (startAngle + endAngle) / 2;
                const xLineStart = center + (rOut + 4) * Math.cos(midAngle);
                const yLineStart = center + (rOut + 4) * Math.sin(midAngle);

                // Line elbow point extending outward
                const xElbow = center + (rOut + 22) * Math.cos(midAngle);
                const yElbow = center + (rOut + 22) * Math.sin(midAngle);

                // Line end point (horizontal line extension)
                const isRightSide = Math.cos(midAngle) > 0;
                const xLineEnd = xElbow + (isRightSide ? 15 : -15);
                const yLineEnd = yElbow;

                const linePathD = `M ${xLineStart} ${yLineStart} L ${xElbow} ${yElbow} L ${xLineEnd} ${yLineEnd}`;

                // Text labels positions
                const xText = xLineEnd + (isRightSide ? 6 : -6);
                const textAnchor = isRightSide ? "start" : "end";
                const formattedUnits = formatUnits(item.totalUnits, isEarnings);

                return (
                  <G key={item.channel}>
                    <Path
                      d={pathD}
                      fill={color}
                      stroke={color}
                      strokeWidth={19}
                      strokeLinejoin="round"
                    />
                  </G>
                );
              })}
            </Svg>

            {/* Centered Donut Hole Content */}
            <View style={styles.chartCenter}>
              <Text style={styles.centerValue}>
                {centerDisplayValue}
              </Text>
              <Text style={styles.centerLabel}>
                {isEarnings ? "Total earnings" : "Total Streams"}
              </Text>
            </View>
          </View>

          {/* Bottom Legend Container */}
          <View style={styles.legendContainer}>
            <View style={styles.legendGrid}>
              {data.map((item, index) => (
                <View style={styles.legendCard} key={item.channel}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: getChannelColor(item.channel, index) },
                    ]}
                  />
                  <View style={styles.legendTextContainer}>
                    <Text style={styles.legendUnits}>
                      {formatUnits(item.totalUnits, isEarnings)}
                    </Text>
                    <Text style={styles.legendChannel} numberOfLines={1}>
                      {item.channel}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default BestPerformingStores;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
    marginVertical: 16,
    width: "100%",
  },
  cardTitle: {
    fontSize: 19,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  loaderContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#7A7A7A",
  },
  container: {
    alignItems: "center",
    width: "100%",
  },
  chartWrapper: {
    width: 330,
    height: 330,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    
  },
  chartCenter: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  centerValue: {
    fontSize: 27, // Bigger typography matching the layout hierarchy
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontWeight: "800",
    color: "#1C1C1E",
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  centerLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#8E8E93",
   
  },
  legendContainer: {
    backgroundColor: "#F5F5F7", // Matched light grey container base
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: "100%",
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    rowGap: 20,
    width: "100%",
  },
  legendCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "33.33%", // Clean 3 column alignment
    columnGap: 8,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 4, // Squared radius for precise legend boxes
    marginTop: 2,
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: "column",
  },
  legendUnits: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: "#1A1A1A",
    lineHeight: 16,
  },
  legendChannel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "#9A9A9A",
    marginTop: 2,
  },
});