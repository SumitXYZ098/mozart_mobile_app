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
  const chartHeight = 180;
  const yAxisLabelWidth = 35;
  const initialSpacing = 15;
  const endSpacing = 15;

  // Measure dynamic width
  const defaultChartWidth = screenWidth - 88;
  const [chartWidth, setChartWidth] = useState<number>(defaultChartWidth);

  const usableWidth = useMemo(() => {
    return Math.max(100, chartWidth - yAxisLabelWidth - initialSpacing - endSpacing);
  }, [chartWidth]);

  const isWeekdayOnly = useMemo(() => {
    const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return points.length <= 7 && points.every(p => weekdays.includes(p.label.toLowerCase().trim()));
  }, [points]);

  const spacing = useMemo(() => {
    if (points.length <= 1) return usableWidth;
    // If it's a weekly view (weekday names and <= 7 points), stretch it to fit the visible width
    if (isWeekdayOnly) {
      return usableWidth / (points.length - 1);
    }
    // For 14/30 days, we want spacing of 55px so it scrolls horizontally
    return 55;
  }, [points.length, usableWidth, isWeekdayOnly]);

  const chartData = useMemo(() => {
    return points.map((p) => ({
      value: p.value,
      label: p.label, // Show label for every point as scrolling is enabled
      fullLabel: p.label,
    }));
  }, [points]);

  const formatYLabel = (valueStr: string) => {
    const val = parseFloat(valueStr);
    if (isNaN(val)) return valueStr;
    if (val >= 1000) {
      return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
    }
    return String(val);
  };

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
          <LineChart
            data={chartData}
            width={chartWidth - yAxisLabelWidth}
            height={chartHeight}
            initialSpacing={initialSpacing}
            endSpacing={endSpacing}
            spacing={spacing}
            nestedScrollEnabled={true}
            disableScroll={false}
            isAnimated
            animationDuration={900}
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisLabelWidth={yAxisLabelWidth}
            hideYAxisText={false}
            formatYLabel={formatYLabel}
            yAxisTextStyle={styles.yAxisText}
            xAxisLabelTextStyle={styles.xLabelText}
            xAxisLabelsHeight={24}
            xAxisLabelsVerticalShift={2}
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
            pointerConfig={{
              pointerStripColor: '#D1C4E9',
              pointerStripWidth: 1.5,
              strokeDashArray: [4, 4],
              pointerColor: Colors.primary,
              radius: 5,
              pointerLabelWidth: 80,
              pointerLabelHeight: 50,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items: any) => {
                if (!items || items.length === 0) return null;
                const point = items[0];
                return (
                  <View
                    style={{
                      backgroundColor: Colors.white,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#EAEAEA',
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 4,
                      minWidth: 80,
                    }}
                  >
                    <Text style={{ fontSize: 9, color: Colors.gray, fontFamily: 'Poppins_400Regular' }}>
                      {point.fullLabel}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#1A1A1A', fontFamily: 'Poppins_700Bold', fontWeight: '700', marginTop: 1 }}>
                      {point.value?.toLocaleString()}
                    </Text>
                  </View>
                );
              },
              pointerComponent: () => (
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: '#E0E7FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#3B82F6',
                    }}
                  />
                </View>
              ),
            }}
          />
        )}
      </View>
    </View>
  );
};

export default AnalyticsChart;

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  chartWrapper: {
    height: 200,
  },
  xLabelText: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: Colors.gray,
    textAlign: "center",
  },
  yAxisText: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: Colors.gray,
    textAlign: "right",
  },
});

