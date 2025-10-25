import { Colors } from "@/theme/colors";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import DraftCard from "./DraftCard";
import { getUserDrafts } from "@/api/draftApi";
import EmptyState from "@/components/modules/EmptyState";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { useNavigation } from "@react-navigation/native";
type DraftItem = {
  id: string;
  ReleaseTitle: string;
  ReleaseType: string;
  CoverArt?: {
    formats?: {
      thumbnail?: {
        url?: string;
      };
      small?: {
        url?: string;
      };
    };
  };
};

const DraftListSection = () => {
  const [draftList, setDraftList] = useState<DraftItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const shimmerAnimation = new Animated.Value(0);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchDraftList = async () => {
      setIsLoading(true);
      try {
        const response = await getUserDrafts();
        setDraftList(response.data || []);
      } catch (err) {
        console.log("Error fetching of draft list:", err);
        setDraftList([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDraftList();
  }, []);

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
      <View style={styles.draftCard}>
        <Animated.View
          style={[styles.skeletonImage, { opacity: shimmerOpacity }]}
        />
        <View style={styles.draftContent}>
          <Animated.View
            style={[styles.skeletonTitle, { opacity: shimmerOpacity }]}
          />
          <Animated.View
            style={[styles.skeletonSubTitle, { opacity: shimmerOpacity }]}
          />
        </View>
        <Animated.View
          style={[styles.skeletonDraftText, { opacity: shimmerOpacity }]}
        />
      </View>
    );
  };
  return (
    <View style={styles.section}>
      <View className="flex flex-row justify-between items-center">
        <Text style={styles.heading}>Drafts</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("MusicTab", { screen: "Draft" })}
          disabled={isLoading}
        >
          <Text style={[styles.linkText, isLoading && styles.disabledText]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : draftList.length === 0 ? (
        <EmptyState
          imageSource={require("../../../../assets/images/3d-multimedia-record.png")}
          title="No Drafts Yet"
          subtitle="Start creating your first draft to see it here."
        />
      ) : (
        draftList
          .slice(0, 3)
          .map((item) => (
            <DraftCard
              key={item.id}
              id={item.id}
              albumType={item.ReleaseType}
              albumName={item.ReleaseTitle}
              albumImage={item.CoverArt?.formats?.thumbnail?.url ?? ""}
            />
          ))
      )}
    </View>
  );
};

export default DraftListSection;

const styles = StyleSheet.create({
  section: {
    flex: 1,
    marginBottom: verticalScale(16),
    flexDirection: "column",
    rowGap: 10,
  },
  heading: {
    fontSize: moderateScale(20),
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.black,
  },
  linkText: {
    color: Colors.primary,
    fontSize: moderateScale(12),
    fontFamily: "PlusJakartaSans_700Bold",
  },
  disabledText: {
    opacity: 0.5,
  },
  draftCard: {
    display: "flex",
    backgroundColor: Colors.white,
    padding: 6,
    paddingRight: horizontalScale(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    marginBottom: moderateScale(10),
  },
  draftContent: {
    flex: 1,
    marginLeft: horizontalScale(12),
  },
  // Skeleton styles
  skeletonImage: {
    width: horizontalScale(78),
    height: verticalScale(60),
    backgroundColor: Colors.gray,
    borderRadius: 8,
  },
  skeletonTitle: {
    width: "80%",
    height: 18,
    backgroundColor: Colors.gray,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubTitle: {
    width: "60%",
    height: 12,
    backgroundColor: Colors.gray,
    borderRadius: 4,
  },
  skeletonDraftText: {
    width: 60,
    height: 24,
    backgroundColor: Colors.gray,
    borderRadius: 12,
  },
});
