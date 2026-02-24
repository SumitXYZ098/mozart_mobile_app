import { TrackResponse } from "@/api/type";
import { LazyImage } from "@/components/modules/LazyImage";
import StatusBadge from "@/components/modules/StatusBadge";
import { usePublishTrackById } from "@/hooks/useUserPublishTracks";
import { Colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MyTrackScreen = (routes: any) => {
  const navigation = useNavigation<any>();
  const pubId = routes?.route.params?.routeId;
  const { currentTrack, loading } = usePublishTrackById(pubId);
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

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderTrackItem = ({ item }: { item: TrackResponse }) => {
    const primaryArtist =
      item.RoleCredits?.find((rc) => rc.roleName === "Primary Artist")
        ?.artistName || "Unknown";
    return (
      <View style={styles.updateCard}>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <LazyImage
                uri={currentTrack?.CoverArt?.formats?.small?.url ?? ""}
                style={styles.albumImage}
              />
              <View style={styles.updateContent}>
                <Text style={styles.trackName}>{item.TrackName}</Text>
                <Text style={styles.artistName}>
                  Primary Artist: {primaryArtist}
                </Text>

                <Text style={styles.createdDate}>
                  Release Date:{" "}
                  {dayjs(currentTrack?.DigitalReleaseDate).format("DD/MM/YYYY")}
                </Text>
              </View>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <StatusBadge status={item.Status} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSkeletonItem = () => (
    <View
      style={[
        styles.updateCard,
        {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
      ]}
    >
      <Animated.View
        style={[styles.skeletonImage, { opacity: shimmerOpacity }]}
      />
      <View style={[styles.draftContent, { flex: 1 }]}>
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

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.navigate('HomeTab')}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Tracks</Text>
        <View style={styles.placeholder}>
          <TouchableOpacity
            onPress={() =>
              navigation?.navigate("MusicTab", { screen: "CalendarEvent" })
            }
            style={styles.topButton}
          >
            <Image
              source={require("../../../assets/images/solar_calendar-bold.png")}
              resizeMode="contain"
              style={styles.menuIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation?.navigate("Notification")}
            style={styles.topButton}
          >
            <Image
              source={require("../../../assets/images/notification.png")}
              resizeMode="contain"
              style={styles.menuIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
        {loading ? (
          <Animated.View
            style={[styles.skeletonTitle, { opacity: shimmerOpacity }]}
          />
        ) : (
          <Text style={styles.albumName}>{`${currentTrack?.ReleaseTitle} (${
            currentTrack?.TrackList?.length
          } ${
            currentTrack?.TrackList?.length === 1 ? "Song" : "Songs"
          })`}</Text>
        )}
      </View>
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]} // Show 5 skeleton items
          renderItem={renderSkeletonItem}
          keyExtractor={(item) => item.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <FlatList
          data={currentTrack?.TrackList}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

export default MyTrackScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.gray,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  placeholder: { flexDirection: "row", alignItems: "center", columnGap: 6 },
  topButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 6,
    padding: 6,
  },
  menuIcon: { width: 24, height: 24 },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 24,
    textAlign: "center",
    overflow: "hidden",
    marginBottom: 4,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 80, // 👈 ensures scroll space at bottom
  },
  albumName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  albumImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  draftContent: {
    marginLeft: 10,
  },
  updateCard: {
    display: "flex",
    backgroundColor: Colors.white,
    padding: 6,
    paddingRight: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  updateContent: { marginLeft: 10 },
  trackName: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.black,
    textTransform: "capitalize",
  },
  artistName: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.black,
  },
  createdDate: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.gray,
  },
  skeletonImage: {
    width: 78,
    height: 78,
    backgroundColor: Colors.gray,
    borderRadius: 12,
  },
  skeletonTitle: {
    width: "70%",
    height: 18,
    backgroundColor: Colors.gray,
    borderRadius: 6,
  },
  skeletonSubTitle: {
    width: "60%",
    height: 12,
    backgroundColor: Colors.gray,
    borderRadius: 4,
    marginTop: 8,
  },
  skeletonDraftText: {
    width: 60,
    height: 24,
    backgroundColor: Colors.gray,
    borderRadius: 12,
  },
});
