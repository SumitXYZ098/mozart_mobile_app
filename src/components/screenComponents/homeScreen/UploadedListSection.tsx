import { useUserPublishTracks } from "@/hooks/useUserPublishTracks";
import { Colors } from "@/theme/colors";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
} from "react-native";
import UploadCard from "./UploadCard";
import EmptyState from "@/components/modules/EmptyState";

interface UploadedListSectionProps {
  navigation?: {
    navigate: (screen: string) => void;
  };
}

const UploadedListSection = ({ navigation }: UploadedListSectionProps) => {
  const { tracks, loading } = useUserPublishTracks();
  const shimmerAnimation = new Animated.Value(0);

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
          onPress={() => navigation?.navigate("uploads")}
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
              <UploadCard
                key={track.id}
                id={track.id.toLocaleString()}
                albumName={track.ReleaseTitle}
                albumType={track.ReleaseType}
                albumImage={track.CoverArt.formats?.small?.url ?? ""}
              />
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
    marginBottom: 16,
    flexDirection: "column",
    rowGap: 10,
  },
  heading: {
    fontSize: 20,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.black,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  disabledText: {
    opacity: 0.5,
  },
  scrollContainer: {
    marginHorizontal: -24, // Extend to screen edges
  },
  tracksList: {
    flexDirection: "row",
    paddingHorizontal: 24,
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
    paddingHorizontal: 12,
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
    marginBottom: 8,
  },
  skeletonSubTitle: {
    width: "60%",
    height: 12,
    backgroundColor: Colors.gray,
    borderRadius: 4,
  },
});
