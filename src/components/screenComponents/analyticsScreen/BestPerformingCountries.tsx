import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Image, Dimensions, ActivityIndicator } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Colors } from "@/theme/colors";
import FolderEmptyState from "./FolderEmptyState";

const { width: screenWidth } = Dimensions.get("window");

interface CountryItem {
  country: string;
  totalUnits: number;
  percentage: string;
}

interface BestPerformingCountriesProps {
  data: CountryItem[];
  loading: boolean;
}

const CHART_HEIGHT = 160; // Max height for bars

const BestPerformingCountries: React.FC<BestPerformingCountriesProps> = ({
  data = [],
  loading,
}) => {
  const [chartWidth, setChartWidth] = useState<number>(screenWidth - 68); // Static pixel-perfect initialization to prevent layout jumps on mount
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Dynamically calculate maxVal based on data, rounding up to a clean multiple
  const maxVal = useMemo(() => {
    if (!data || data.length === 0) return 10000;
    const realMax = Math.max(...data.map((item) => item.totalUnits));
    if (realMax <= 0) return 1000;
    if (realMax <= 10) return 10;
    if (realMax <= 50) return 50;
    if (realMax <= 100) return 100;
    if (realMax <= 500) return 500;
    if (realMax <= 1000) return 1000;
    // Round up to nearest 1000 for values > 1000
    return Math.ceil(realMax / 1000) * 1000;
  }, [data]);

  const hasCountry = (code: string) => {
    return data.some((item) => item.country.toUpperCase() === code.toUpperCase());
  };

  const formatUnits = (units: number) => {
    if (units >= 1000) {
      const kValue = units / 1000;
      if (Number.isInteger(kValue)) {
        return `${kValue}K`;
      }
      return `${kValue.toFixed(1)}K`;
    }
    return String(Math.round(units));
  };

  const barWidth = data.length > 5 ? 24 : 32;
  const yAxisLabelWidth = 30;
  const availableWidth = chartWidth - 20 - yAxisLabelWidth - 10;
  const spacing =
    data.length > 1
      ? (availableWidth - data.length * barWidth) / (data.length - 1)
      : 0;

  const barData = useMemo(() => {
    return data.map((item, index) => {
      const barPct = item.totalUnits / maxVal;
      const barHeightVal = CHART_HEIGHT * barPct;
      const countryName = item.country.toUpperCase();
      const canFitText = barHeightVal > 28;
      const isSelected = selectedIndex === index;

      return {
        value: item.totalUnits,
        topLabelComponent: () => {
          if (isSelected) return null; // Hide the label when bar is selected to avoid overlap with the tooltip

          return (
            <View
              style={{
                height: 0,
                width: barWidth,
                overflow: "visible",
                alignItems: "center",
              }}
            >
              <Text
                style={
                  canFitText
                    ? {
                        position: "absolute",
                        top: 12,
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontFamily: "PlusJakartaSans_700Bold",
                        transform: [{ rotate: "90deg" }],
                        textAlign: "center",
                      }
                    : {
                        position: "absolute",
                        top: -20,
                        color: "#555555",
                        fontSize: 12,
                        fontFamily: "PlusJakartaSans_700Bold",
                        textAlign: "center",
                      }
                }
              >
                {countryName}
              </Text>
            </View>
          );
        },
      };
    });
  }, [data, maxVal, barWidth, selectedIndex]);

  const yAxisLabelTexts = useMemo(() => {
    return [
      "0",
      formatUnits(maxVal * 0.2),
      formatUnits(maxVal * 0.4),
      formatUnits(maxVal * 0.6),
      formatUnits(maxVal * 0.8),
      formatUnits(maxVal),
    ];
  }, [maxVal]);

  return (
    <View
      style={styles.card}
      onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
    >
      <Text style={styles.cardTitle}>Best Performing Countries</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : data.length === 0 ? (
        <FolderEmptyState title="No Country Data Available" />
      ) : (
        <>
          {/* Dotted World Map with Overlay Markers */}
          <View style={styles.mapContainer}>
            <Image
              source={require("../../../../assets/images/map.png")}
              style={styles.mapImage}
            />
            {/* Country Markers (Purple Glowing Dots based on active response data) */}
            {/* USA West */}
            {hasCountry("US") && (
              <View style={[styles.marker, { top: "45%", left: "15%" }]}>
                <View style={styles.markerDot} />
              </View>
            )}
            {/* Canada / East US
            {hasCountry("CA") && (
              <View style={[styles.marker, { top: "23%", left: "34%" }]}>
                <View style={styles.markerDot} />
              </View>
            )} */}
            {/* South America (Mexico/Colombia region) */}
            {hasCountry("MX") && (
              <View style={[styles.marker, { top: "50%", left: "40%" }]}>
                <View style={styles.markerDot} />
              </View>
            )}
            {/* United Kingdom */}
            {hasCountry("GB") && (
              <View style={[styles.marker, { top: "24%", left: "48%" }]}>
                <View style={styles.markerDot} />
              </View>
            )}
            {/* India */}
            {hasCountry("IN") && (
              <View style={[styles.marker, { top: "43%", left: "67%" }]}>
                <View style={styles.markerDot} />
              </View>
            )}
            {/* Australia */}
            {hasCountry("AU") && (
              <View style={[styles.marker, { top: "72%", left: "84%" }]}>
                <View style={styles.markerDot} />
              </View>
            )}
          </View>

          {/* Gifted Charts Bar Chart */}
          <View style={styles.chartWrapper}>
            <BarChart
              data={barData}
              width={availableWidth}
              height={CHART_HEIGHT}
              barWidth={barWidth}
              spacing={spacing}
              initialSpacing={13}
              yAxisLabelWidth={yAxisLabelWidth}
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules={false}
              rulesColor="#F0EFFB"
              rulesThickness={1.5}
              rulesType="dashed"
              dashWidth={4}
              dashGap={4}
              noOfSections={5}
              maxValue={maxVal}
              yAxisLabelTexts={yAxisLabelTexts}
              yAxisTextStyle={styles.yAxisText}
              showGradient={true}
              frontColor="#5E25B6"
              gradientColor="#B59BF6"
              barBorderRadius={8}
              renderTooltip={(item: any, index: number) => {
                const isFirst = index === 0;
                const isLast = index === (data?.length || 1) - 1;
                const countryName = data[index]?.country?.toUpperCase() || "";
                return (
                  <View
                    style={{
                      backgroundColor: '#FFFFFF',
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                      elevation: 4,
                      marginBottom: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 9999,
                      marginLeft: isFirst ? 18 : isLast ? -18 : 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        fontFamily: 'PlusJakartaSans_600SemiBold',
                        color: '#7A7A7A',
                        marginBottom: 1,
                      }}
                    >
                      {countryName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: 'PlusJakartaSans_700Bold',
                        fontWeight: '700',
                        color: '#1A1A1A',
                      }}
                    >
                      {item.value !== undefined ? item.value.toFixed(2) : ""}
                    </Text>
                  </View>
                );
              }}
              autoCenterTooltip={true}
              overflowTop={45}
              onPress={(item: any, index: number) => setSelectedIndex(index)}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default BestPerformingCountries;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
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
    marginBottom: 20,
    marginLeft: 10,
    letterSpacing: -0.3,
  },
  mapContainer: {
    width: "100%",
    height: 180,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  mapImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  marker: {
    position: "absolute",
    width: 12,
    height: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  markerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#5E25B6",
    shadowColor: "#5E25B6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  chartWrapper: {
    width: "100%",
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },
  loaderContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9A9A9A",
    fontFamily: "Poppins_400Regular",
  },
  yAxisText: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#7A7A7A",
    textAlign: "right",
  },
});

