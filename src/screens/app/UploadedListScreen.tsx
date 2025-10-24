import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { useUserPublishTracks } from "@/hooks/useUserPublishTracks";
import { LinearGradient } from "expo-linear-gradient";
import UploadCard from "@/components/screenComponents/homeScreen/UploadCard";

const UploadedListScreen = ({ navigation }: any) => {
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
          style={[
            styles.skeletonImage,
            { opacity: shimmerOpacity }
          ]}
        />
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.skeletonTitle,
              { opacity: shimmerOpacity }
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonSubTitle,
              { opacity: shimmerOpacity }
            ]}
          />
        </View>
      </View>
    );
  };

  const renderUploadItem = ({ item }: { item: any }) => (
    <UploadCard
      id={item.id.toLocaleString()}
      albumName={item.ReleaseTitle}
      albumType={item.ReleaseType}
      albumImage={item.CoverArt.formats?.small?.url ?? ""}
    />
  );

  const renderSkeletonItem = () => <SkeletonCard />;

  return (
    <LinearGradient
      colors={["#EDE5F7", "#FFFFFF"]}
      locations={[0.4044, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>My Release</Text>
          <View style={styles.placeholder} />
        </View>

          {loading ? (
            <View style={styles.gridContainer}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <SkeletonCard key={item} />
              ))}
            </View>
          ) : tracks.length > 0 ? (
            <View style={styles.gridContainer}>
              {tracks.map((track) => (
                <UploadCard
                  key={track.id}
                  id={track.id.toLocaleString()}
                  albumName={track.ReleaseTitle}
                  albumType={track.ReleaseType}
                  albumImage={track.CoverArt.formats?.small?.url ?? ""}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-upload-outline" size={64} color={Colors.gray} />
              <Text style={styles.emptyTitle}>No Uploads Found</Text>
              <Text style={styles.emptySubtitle}>
                Start uploading your music to see it here
              </Text>
            </View>
          )}
       
      </SafeAreaView>
    </LinearGradient>
  );
};

export default UploadedListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  placeholder: {
    width: 40,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  cardSection: {
    overflow: "hidden",
    borderRadius: 12,
    width: "48%",
    height: 130,
    position: "relative",
    marginBottom: 15,
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_600SemiBold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
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
