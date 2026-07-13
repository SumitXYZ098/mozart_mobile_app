import React, { useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Svg, { Path, Circle, G, Text as SVGText } from "react-native-svg";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

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
  "#1877F2", // Meta Blue
  "#111111", // TikTok Black
  "#2ECC71", // Spotify Green
  "#FC3C44", // Apple Music Red
  "#FFA726", // Soundcloud Yellow
  "#9B59B6", // Instagram Purple
];

const getChannelColor = (channelName: string, index: number) => {
  const name = channelName.toLowerCase();
  if (name.includes("spotify")) return "#2ECC71"; // Green
  if (name.includes("apple")) return "#FC3C44"; // Red
  if (name.includes("soundcloud")) return "#FFA726";
  if (name.includes("youtube")) return "#FF0000";
  if (name.includes("audiomack")) return "#2ECC71";
  if (name.includes("instagram")) return "#9B59B6";
  if (name.includes("meta")) return "#1877F2"; // Blue
  if (name.includes("tiktok")) return "#111111"; // Black
  return PALETTE[index % PALETTE.length];
};

const renderBrandIcon = (channelName: string) => {
  const name = channelName.toLowerCase();
  if (name.includes("spotify")) {
    return <FontAwesome name="spotify" size={24} color="#2ECC71" style={{ marginRight: 2 }} />;
  }
  if (name.includes("apple")) {
    return <FontAwesome name="apple" size={24} color="#FC3C44" style={{ marginRight: 2 }} />;
  }
  if (name.includes("youtube")) {
    return <FontAwesome name="youtube-play" size={24} color="#FF0000" style={{ marginRight: 2 }} />;
  }
  if (name.includes("soundcloud")) {
    return <FontAwesome name="soundcloud" size={24} color="#FFA726" style={{ marginRight: 2 }} />;
  }
  if (name.includes("instagram")) {
    return <FontAwesome name="instagram" size={24} color="#9B59B6" style={{ marginRight: 2 }} />;
  }
  if (name.includes("meta") || name.includes("tiktok")) {
    // Falls back to purple music note as seen in the user's screenshot
    return <Ionicons name="musical-note" size={24} color="#7F3DFF" style={{ marginRight: 2 }} />;
  }
  return <Ionicons name="musical-note" size={24} color="#7A7A7A" style={{ marginRight: 2 }} />;
};

const formatUnits = (units: number, isEarnings: boolean) => {
  if (isEarnings) {
    const kValue = (units * 3.25) / 1000;
    const formatted = kValue >= 10 ? Math.round(kValue) : kValue.toFixed(1);
    return `₹${formatted}K`;
  } else {
    if (units >= 1000000) {
      return `${(units / 1000000).toFixed(units % 1000000 === 0 ? 0 : 1)}M`;
    }
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
  const size = 330;
  const center = size / 2;

  // Sorting order mapping mockup starting from Top-Right
  const donutData = useMemo(() => {
    const clockwiseOrder = ["meta", "tiktok", "spotify", "apple", "youtube", "audiomack", "instagram", "soundcloud"];
    return [...data].sort((a, b) => {
      const aIdx = clockwiseOrder.findIndex((o) => a.channel.toLowerCase().includes(o));
      const bIdx = clockwiseOrder.findIndex((o) => b.channel.toLowerCase().includes(o));
      return aIdx - bIdx;
    });
  }, [data]);

  // Visual layout calculation to ensure small segments are visible and don't overlap
  const visualDonutData = useMemo(() => {
    if (donutData.length === 0) return [];

    // 1. Filter out zero segments
    const activeSegments = donutData.filter(item => {
      const val = item.totalUnits || 0;
      return val > 0;
    });

    if (activeSegments.length === 0) return [];

    const totalUnitsSum = activeSegments.reduce((sum, d) => sum + (d.totalUnits || 0), 0);

    // 2. Assign raw percentages
    const segmentsWithRaw = activeSegments.map(item => {
      const rawPct = totalUnitsSum > 0 ? ((item.totalUnits || 0) / totalUnitsSum) * 100 : 0;
      return { ...item, rawPct };
    });

    // 3. Enforce a minimum of 8% for any visible segment to fit rounded caps nicely
    const MIN_PCT = 8;
    let reservedPct = 0;
    let flexibleCount = 0;
    let flexibleRawSum = 0;

    segmentsWithRaw.forEach(item => {
      if (item.rawPct < MIN_PCT) {
        reservedPct += MIN_PCT;
      } else {
        flexibleCount++;
        flexibleRawSum += item.rawPct;
      }
    });

    // If we reserved too much, scale down the minimum to fit
    const maxReserved = 100 - MIN_PCT; // Always leave at least MIN_PCT for the largest segment
    const actualMinPct = reservedPct > maxReserved ? (maxReserved / (segmentsWithRaw.length - flexibleCount)) : MIN_PCT;

    const finalReservedPct = segmentsWithRaw.reduce((sum, item) => {
      return sum + (item.rawPct < actualMinPct ? actualMinPct : 0);
    }, 0);

    const allowedFlexiblePct = 100 - finalReservedPct;

    // 4. Calculate final visual percentages
    return segmentsWithRaw.map(item => {
      let visualPct = item.rawPct;
      if (item.rawPct < actualMinPct) {
        visualPct = actualMinPct;
      } else if (flexibleRawSum > 0) {
        visualPct = (item.rawPct / flexibleRawSum) * allowedFlexiblePct;
      }
      return { ...item, visualPct };
    });
  }, [donutData]);

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
              {/* Soft background track ring matching the mockup background circle */}
              <Circle
                cx={center}
                cy={center}
                r={86}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={46}
              />
              {visualDonutData.map((item, index) => {
                const color = getChannelColor(item.channel, index);

                // If this is the only store or takes up 100%, render a full circle ring
                if (item.visualPct >= 99.9) {
                  return (
                    <Circle
                      key={`${item.channel}-${index}`}
                      cx={center}
                      cy={center}
                      r={86}
                      fill="none"
                      stroke={color}
                      strokeWidth={20}
                    />
                  );
                }

                const startPct = accumulatedPercentage;
                accumulatedPercentage += item.visualPct;

                // Start and End angles in radians starting at mockup's offset (-75 degrees)
                const startAngle = -Math.PI * 75 / 180 + (startPct / 100) * 2 * Math.PI;
                const endAngle = -Math.PI * 75 / 180 + (accumulatedPercentage / 100) * 2 * Math.PI;

                // Adjust gap to compensate for strokeWidth 19 (which extends 9.5px on each side)
                const segmentAngle = endAngle - startAngle;
                let gapRad = visualDonutData.length > 1 ? 0.28 : 0; // 0.14 rad gap at each end
                if (segmentAngle <= gapRad) {
                  gapRad = segmentAngle * 0.4;
                }

                const a1 = startAngle + gapRad / 2;
                const a2 = endAngle - gapRad / 2;

                if (a1 >= a2) return null;

                const rOut = 96;
                const rIn = 76;

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

                return (
                  <G key={`${item.channel}-${index}`}>
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
                  {renderBrandIcon(item.channel)}
                  <View style={styles.legendTextContainer}>
                    <Text style={styles.legendChannel} numberOfLines={1}>
                      {item.channel}
                    </Text>
                    <Text style={[styles.legendUnits, { color: getChannelColor(item.channel, index) }]}>
                      {formatUnits(item.totalUnits, isEarnings)}
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
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
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
    fontSize: 27,
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
    backgroundColor: "#F8F9FC",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "#EEF0F5",
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    width: "100%",
  },
  legendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: "48.5%",
    columnGap: 10,
    borderColor: "#EAEFF8",
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: "column",
  },
  legendUnits: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 2,
  },
  legendChannel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "#9A9A9A",
  },
});