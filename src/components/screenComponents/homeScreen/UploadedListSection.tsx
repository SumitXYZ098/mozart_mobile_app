import { useUserPublishTracks } from "@/hooks/useUserPublishTracks";
import { Colors } from "@/theme/colors";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import UploadCard from "./UploadCard";
import EmptyState from "@/components/modules/EmptyState";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/metrics";
import { useNavigation } from "@react-navigation/native";

const UploadedListSection = () => {
  const { tracks, loading } = useUserPublishTracks();
  const shimmerAnimation = new Animated.Value(0);
  const navigation = useNavigation<any>();

  // Shimmer animation effect
  useEffect(() => {
    if (loading) {
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
  }, [loading, shimmerAnimation]);

  // Skeleton component
  const SkeletonCard = () => {
    const shimmerOpacity = shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    });

    return (
      <View style={styles.cardSection}>
        <Animated.View
          style={[styles.skeletonImage, { opacity: shimmerOpacity }]}
        />
        <View style={styles.overlay}>
          <Animated.View
            style={[styles.skeletonTitle, { opacity: shimmerOpacity }]}
          />
          <Animated.View
            style={[styles.skeletonSubTitle, { opacity: shimmerOpacity }]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <View className="flex flex-row justify-between items-center">
        <Text style={styles.heading}>My Uploads</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("MusicTab", { screen: "Upload" })}
          disabled={loading}
        >
          <Text style={[styles.linkText, loading && styles.disabledText]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      {tracks.length === 0 ? (
        <EmptyState
          imageSource={require("../../../../assets/images/3d-multimedia-record.png")}
          title="No Uploads Yet"
          subtitle="Your uploaded releases will appear here."
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tracksList}
          style={styles.scrollContainer}
        >
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            tracks.map((track) => (
              <Pressable
                key={track.id}
                onPress={() =>
                  navigation.navigate("MusicTab", {
                    screen: "Track",
                    params: { routeId: track.id },
                  })
                }
              >
                <UploadCard
                  id={track.id.toLocaleString()}
                  albumName={track.ReleaseTitle}
                  albumType={track.ReleaseType}
                  albumImage={track.CoverArt.formats?.thumbnail?.url ?? ""}
                />
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default UploadedListSection;

const styles = StyleSheet.create({
  section: {
    marginBottom: Platform.OS === "android" ? 60 : 40,
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
  scrollContainer: {
    marginHorizontal: horizontalScale(-24), // Extend to screen edges
  },
  tracksList: {
    flexDirection: "row",
    paddingHorizontal: horizontalScale(24),
    gap: 15,
  },
  cardSection: {
    overflow: "hidden",
    borderRadius: 12,
    width: 160, // Fixed width for horizontal scrolling
    height: 130,
    position: "relative",
  },
  overlay: {
    position: "absolute",
    backgroundColor: "rgba(54, 54, 54, 0.4)",
    width: "100%",
    height: "40%",
    zIndex: 3,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: horizontalScale(12),
  },
  // Skeleton styles
  skeletonImage: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.gray,
    borderRadius: 12,
  },
  skeletonTitle: {
    width: "80%",
    height: 18,
    backgroundColor: Colors.gray,
    borderRadius: 4,
    marginBottom: verticalScale(8),
  },
  skeletonSubTitle: {
    width: "60%",
    height: 12,
    backgroundColor: Colors.gray,
    borderRadius: 4,
  },
});
