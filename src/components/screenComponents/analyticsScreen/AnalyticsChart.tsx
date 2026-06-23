import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { Colors } from "@/theme/colors";

const { width: screenWidth } = Dimensions.get("window");

interface DataPoint {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  points: DataPoint[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ points }) => {
  // Measure dynamic width
  const defaultChartWidth = screenWidth - 88;
  const [chartWidth, setChartWidth] = useState<number>(defaultChartWidth);
  const chartHeight = 140;

  const spacing = useMemo(() => {
    if (points.length <= 1) return chartWidth;
    return chartWidth / (points.length - 1);
  }, [points.length, chartWidth]);

  const chartData = useMemo(() => {
    return points.map((p) => ({
      value: p.value,
    }));
  }, [points]);

  return (
    <View style={styles.chartCard}>
      {/* Chart Line */}
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
            <LineChart
              data={chartData}
              width={chartWidth}
              height={chartHeight}
              initialSpacing={0}
              endSpacing={0}
              spacing={spacing}
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisLabelWidth={0}
              hideYAxisText={true}
              hideRules={false}
              rulesColor="#F0EFFB"
              rulesThickness={1.5}
              rulesType="dashed"
              dashWidth={4}
              dashGap={4}
              noOfSections={4}
              hideDataPoints={true}
              curved={true}
              areaChart={true}
              color={Colors.primary}
              thickness={3.5}
              startFillColor={Colors.primary}
              endFillColor={Colors.primary}
              startOpacity={0.22}
              endOpacity={0.00}
            />

            {/* Horizontal X Axis Labels matching spacing */}
            <View style={styles.xLabelRow}>
              {points.map((pt, i) => {
                // Determine whether to display this label to prevent crowding
                let showLabel = true;
                if (points.length > 7) {
                  const step = Math.floor(points.length / 4);
                  showLabel = i === 0 || i === points.length - 1 || i % step === 0;
                }

                if (!showLabel) return null;

                const x = i * spacing;
                const labelWidth = 50;
                let leftPosition = x - labelWidth / 2;
                // Clamp label position to stay within the chart boundaries
                leftPosition = Math.max(0, Math.min(leftPosition, chartWidth - labelWidth));

                return (
                  <Text
                    key={`label-${i}`}
                    style={[
                      styles.xLabelText,
                      {
                        position: "absolute",
                        left: leftPosition,
                        width: labelWidth,
                      },
                    ]}
                  >
                    {pt.label}
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
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  chartWrapper: {
    height: 180,
  },
  xLabelRow: {
    position: "relative",
    height: 20,
    marginTop: 12,
  },
  xLabelText: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: Colors.gray,
    textAlign: "center",
  },
});

