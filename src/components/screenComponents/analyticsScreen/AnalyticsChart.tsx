import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Line,
} from "react-native-svg";

import { Colors } from "@/theme/colors";

const { width: screenWidth } = Dimensions.get("window");

interface DataPoint {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  points: DataPoint[];
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
}

const PERIODS = {
  DAYS_7: "7days",
  DAYS_14: "14days",
  DAYS_30: "30days",
};

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  points,
  selectedPeriod,
  setSelectedPeriod,
}) => {
  // Measure SVG dynamic width
  const defaultChartWidth = screenWidth - 88;
  const [chartWidth, setChartWidth] = useState<number>(defaultChartWidth);
  const chartHeight = 140;

  // Calculate coordinates for Svg path
  const chartPoints = useMemo(() => {
    if (points.length === 0) return [];

    const values = points.map((p) => p.value);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);

    return points.map((p, i) => {
      const x =
        points.length > 1
          ? i * (chartWidth / (points.length - 1))
          : chartWidth / 2;
      const yRange = chartHeight - 30; // 15px padding top/bottom
      const valScale =
        maxVal === minVal ? 0.5 : (p.value - minVal) / (maxVal - minVal);
      const y = chartHeight - 15 - valScale * yRange;
      return { x, y };
    });
  }, [points, chartWidth, chartHeight]);

  // Generate cubic bezier curve path
  const bezierPath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    let path = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const p0 = chartPoints[i];
      const p1 = chartPoints[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y;
      const cp2x = p0.x + (2 * (p1.x - p0.x)) / 3;
      const cp2y = p1.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [chartPoints]);

  // Closed path for SVG area gradient fill
  const fillPath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    return `${bezierPath} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight} L ${chartPoints[0].x} ${chartHeight} Z`;
  }, [bezierPath, chartPoints, chartHeight]);

  return (
    <View style={styles.chartCard}>
      {/* Chart Card Header */}
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Streams Overview</Text>
        
        {/* Sub Period selector tabs */}
        <View style={styles.chartPeriodBar}>
          {(
            [
              { label: "7 Days", value: PERIODS.DAYS_7 },
              { label: "14 Days", value: PERIODS.DAYS_14 },
              { label: "30 Days", value: PERIODS.DAYS_30 },
            ] as const
          ).map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => setSelectedPeriod(item.value)}
              style={[
                styles.periodButton,
                selectedPeriod === item.value && styles.periodButtonActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === item.value && styles.periodButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart Svg Line */}
      <View
        style={styles.chartWrapper}
        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
      >
        {points.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: Colors.gray, fontFamily: "Poppins_400Regular", fontSize: 13 }}>
              No data available for this period
            </Text>
          </View>
        ) : (
          <>
            <Svg width={chartWidth} height={chartHeight}>
              <Defs>
                {/* Area Fill Gradient under the bezier curve */}
                <SvgLinearGradient id="chartFillGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.22" />
                  <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0.00" />
                </SvgLinearGradient>
              </Defs>

              {/* 5 Horizontal Dashed Grid lines */}
              {Array.from({ length: 5 }).map((_, index) => {
                const yVal = (index * chartHeight) / 5 + 10;
                return (
                  <Line
                    key={`grid-${index}`}
                    x1="0"
                    y1={yVal}
                    x2={chartWidth}
                    y2={yVal}
                    stroke="#F0EFFB" // Soft purple-tinted grid line
                    strokeWidth="1.5"
                    strokeDasharray="4 4" // Dashed line
                  />
                );
              })}

              {/* Smooth Area Spline Fill */}
              {fillPath !== "" && <Path d={fillPath} fill="url(#chartFillGrad)" />}

              {/* Smooth Spline Stroke Line */}
              {bezierPath !== "" && (
                <Path
                  d={bezierPath}
                  stroke={Colors.primary}
                  strokeWidth="3.5"
                  fill="none"
                />
              )}
            </Svg>

            {/* Horizontal X Axis Labels matching SVG grid spacing */}
            <View style={styles.xLabelRow}>
              {points.map((pt, i) => {
                // Determine whether to display this label to prevent crowding
                let showLabel = true;
                if (points.length > 7) {
                  const step = Math.floor(points.length / 4);
                  showLabel = i === 0 || i === points.length - 1 || i % step === 0;
                }

                return (
                  <Text key={`label-${i}`} style={styles.xLabelText}>
                    {showLabel ? pt.label : ""}
                  </Text>
                );
              })}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default AnalyticsChart;

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F0EFFB",
    shadowColor: "#6739B7", // Premium brand shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    color: "#1A1A1A",
  },
  chartPeriodBar: {
    flexDirection: "row",
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 3,
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 9,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
    color: Colors.gray,
  },
  periodButtonTextActive: {
    color: Colors.white,
  },
  chartWrapper: {
    height: 180,
  },
  xLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  xLabelText: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: Colors.gray,
    minWidth: 32,
    textAlign: "center",
  },
});
