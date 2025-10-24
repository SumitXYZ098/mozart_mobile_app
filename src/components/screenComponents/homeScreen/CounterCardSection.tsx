import { ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/useAuthStore";
import { Colors } from "@/theme/colors";
import { formatValue } from "@/utils/utils";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View, Animated } from "react-native";

interface CountDataProps {
  clientCount: number;
  totalEarnings: number;
}

const CounterCardSection = () => {
  const { user } = useAuthStore();
  const [countData, setCountData] = useState<CountDataProps>({
    clientCount: 0,
    totalEarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const shimmerAnimation = new Animated.Value(0);

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      if (!user?.token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(ENDPOINTS.DASHBOARD_COUNTS, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = response.data?.data ?? response.data;

        setCountData({
          clientCount: data?.clientCount,
          totalEarnings: data?.totalEarnings ?? 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
        setCountData({
          clientCount: 0,
          totalEarnings: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardCounts();
  }, [user?.token]);

  // Shimmer animation effect
  useEffect(() => {
    if (isLoading) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [isLoading, shimmerAnimation]);

  // Skeleton component
  const SkeletonCard = () => {
    const shimmerOpacity = shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    });

    return (
      <View style={styles.card}>
        <Animated.View
          style={[styles.skeletonTitle, { opacity: shimmerOpacity }]}
        />
        <Animated.View
          style={[styles.skeletonSubTitle, { opacity: shimmerOpacity }]}
        />
        <Animated.View
          style={[styles.skeletonImage, { opacity: shimmerOpacity }]}
        />
        <View className="absolute z-10 w-[96px] h-[96px] bg-primary opacity-20 rounded-full -bottom-[30px] -right-[30px]" />
      </View>
    );
  };

  const cardData = [
    {
      id: "withdraw",
      title: "₹" + formatValue(countData.totalEarnings),
      subTitle: "Available to withdraw",
      imgSrc: require("../../../../assets/images/wallet-with-dollar.png"),
    },
    {
      id: "artists",
      title: countData.clientCount,
      subTitle: "Total Artists",
      imgSrc: require("../../../../assets/images/3d-multimedia-record.png"),
    },
  ];
  return (
    <View style={styles.section}>
      {isLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        cardData.map((card) => (
          <View key={card.id} style={styles.card}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubTitle}>{card.subTitle}</Text>
            <Image
              source={card.imgSrc}
              style={styles.cardImg}
              resizeMode="contain"
            />
            <View className="absolute z-10 w-[96px] h-[96px] bg-primary opacity-20 rounded-full -bottom-[30px] -right-[30px]" />
          </View>
        ))
      )}
    </View>
  );
};

export default CounterCardSection;
const styles = StyleSheet.create({
  section: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 15,
    marginBottom: 20,
  },
  card: {
    position: "relative",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    width: "48%",
    height: 121,
    boxShadow: "0 0 16px 0 rgba(17, 17, 17, 0.08)",
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  cardSubTitle: {
    fontSize: 10,
    color: Colors.gray,
    fontFamily: "Poppins_400Regular",
    width: "60%",
  },
  cardImg: {
    width: 68,
    height: 68,
    zIndex: 20,
    position: "absolute",
    right: 10,
    bottom: 10,
  },
  skeletonTitle: {
    width: "70%",
    height: 24,
    backgroundColor: Colors.gray,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubTitle: {
    width: "60%",
    height: 10,
    backgroundColor: Colors.gray,
    borderRadius: 4,
    marginBottom: 20,
  },
  skeletonImage: {
    width: 68,
    height: 68,
    backgroundColor: Colors.gray,
    borderRadius: 8,
    position: "absolute",
    right: 10,
    bottom: 10,
  },
});
