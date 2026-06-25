import { TrackResponse } from "@/api/type";
import { LazyImage } from "@/components/modules/LazyImage";
import StatusBadge from "@/components/modules/StatusBadge";
import { usePublishTrackById } from "@/hooks/useUserPublishTracks";
import { Colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Audio } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";

const MyTrackScreen = (routes: any) => {
  const navigation = useNavigation<any>();
  const pubId = routes?.route.params?.routeId;
  const { currentTrack, loading } = usePublishTrackById(pubId);
  const shimmerAnimation = new Animated.Value(0);

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState<number | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  const isScrubbingRef = useRef(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const playingTrackIdRef = useRef<number | null>(null);
  const loadingTrackIdRef = useRef<number | null>(null);
  const progressBarLeftRef = useRef(0);

  const updatePlayingTrack = (trackId: number | null) => {
    playingTrackIdRef.current = trackId;
    setPlayingTrackId(trackId);
  };

  const updateLoadingTrack = (trackId: number | null) => {
    loadingTrackIdRef.current = trackId;
    setLoadingTrackId(trackId);
  };

  const getAudioUrl = (upload: any) => {
    if (!upload) return null;
    if (typeof upload === "string") return upload;
    if (typeof upload === "object" && upload.url) return upload.url;
    return null;
  };

  const createPlaybackStatusUpdateHandler = (trackId: number) => (status: any) => {
    // Only handle status updates if this track is still the active playing track
    if (playingTrackIdRef.current !== trackId) return;

    if (status.isLoaded) {
      if (!isScrubbingRef.current) {
        setPlaybackPosition(status.positionMillis || 0);
      }
      setPlaybackDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
        if (soundRef.current) {
          soundRef.current.unloadAsync().catch((err) => console.log("Error unloading on finish", err));
          soundRef.current = null;
        }
        setSound(null);
        updatePlayingTrack(null);
      }
    } else if (status.error) {
      console.error(`Playback error: ${status.error}`);
    }
  };

  const handleProgressTouchStart = async (e: any) => {
    const { pageX, locationX } = e.nativeEvent;
    progressBarLeftRef.current = pageX - locationX;
    isScrubbingRef.current = true;

    const activeSound = soundRef.current;
    if (!activeSound || playbackDuration <= 0 || progressBarWidth <= 0) return;
    const percentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
    const seekMillis = percentage * playbackDuration;
    setPlaybackPosition(seekMillis);
    try {
      await activeSound.setPositionAsync(seekMillis);
    } catch (err) {
      console.log("Error seeking on touch start", err);
    }
  };

  const handleProgressTouchMove = (e: any) => {
    if (playbackDuration <= 0 || progressBarWidth <= 0) return;
    const { pageX } = e.nativeEvent;
    const touchX = pageX - progressBarLeftRef.current;
    const percentage = Math.max(0, Math.min(1, touchX / progressBarWidth));
    const seekMillis = percentage * playbackDuration;
    setPlaybackPosition(seekMillis);
  };

  const handleProgressTouchEnd = async (e: any) => {
    const activeSound = soundRef.current;
    if (!activeSound || playbackDuration <= 0 || progressBarWidth <= 0) return;
    const { pageX } = e.nativeEvent;
    const touchX = pageX - progressBarLeftRef.current;
    const percentage = Math.max(0, Math.min(1, touchX / progressBarWidth));
    const seekMillis = percentage * playbackDuration;
    
    isScrubbingRef.current = false;
    setPlaybackPosition(seekMillis);
    try {
      await activeSound.setPositionAsync(seekMillis);
    } catch (err) {
      console.log("Error seeking on touch end", err);
    }
  };

  const playSound = async (trackId: number, uri: string) => {
    updatePlayingTrack(trackId);
    updateLoadingTrack(trackId);
    setIsPlaying(false);

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch (err) {
          console.log("Error unloading previous sound:", err);
        }
        soundRef.current = null;
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        createPlaybackStatusUpdateHandler(trackId)
      );

      // Verify if the user changed the track or stopped playback during async load
      if (playingTrackIdRef.current !== trackId) {
        await newSound.unloadAsync();
        return;
      }

      setSound(newSound);
      soundRef.current = newSound;
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing sound:", error);
      if (playingTrackIdRef.current === trackId) {
        updatePlayingTrack(null);
        setIsPlaying(false);
      }
    } finally {
      if (loadingTrackIdRef.current === trackId) {
        updateLoadingTrack(null);
      }
    }
  };

  const togglePlayback = async () => {
    const activeSound = soundRef.current;
    if (!activeSound) return;
    try {
      if (isPlaying) {
        await activeSound.pauseAsync();
        setIsPlaying(false);
      } else {
        await activeSound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      if (soundRef.current) {
        soundRef.current.stopAsync()
          .then(() => {
            soundRef.current?.unloadAsync();
            soundRef.current = null;
          })
          .catch((err) => console.log("Error stopping sound on blur", err));
        setSound(null);
        setIsPlaying(false);
        updatePlayingTrack(null);
        updateLoadingTrack(null);
      } else {
        updatePlayingTrack(null);
        updateLoadingTrack(null);
      }
    });

    return () => {
      unsubscribe();
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch((err) => console.log("Error unloading sound on unmount", err));
        soundRef.current = null;
      }
      playingTrackIdRef.current = null;
      loadingTrackIdRef.current = null;
    };
  }, [navigation]);

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

    const audioUrl = getAudioUrl(item.TrackUpload);
    const hasAudio = !!audioUrl;
    const isCurrentPlaying = playingTrackId === item.id;
    const progressPct = playbackDuration > 0 ? playbackPosition / playbackDuration : 0;

    const handlePlayPress = () => {
      if (!audioUrl) return;
      const fullUrl = audioUrl.startsWith("http")
        ? audioUrl
        : `${process.env.EXPO_PUBLIC_API_URL}${audioUrl}`;

      const isCurrentActive = playingTrackIdRef.current === item.id;

      if (isCurrentActive) {
        if (soundRef.current) {
          togglePlayback();
        } else {
          // If soundRef.current is null but playingTrackIdRef matches, it means it is currently loading.
          // Clicking it again should cancel loading.
          updatePlayingTrack(null);
          updateLoadingTrack(null);
          setIsPlaying(false);
        }
      } else {
        playSound(item.id, fullUrl);
      }
    };

    return (
      <View style={styles.updateCard}>
        <View style={{ flexDirection: "column", gap: 8 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Cover Art with Play Overlay */}
              <TouchableOpacity
                onPress={handlePlayPress}
                disabled={!hasAudio}
                activeOpacity={0.8}
                style={styles.imageContainer}
              >
                <LazyImage
                  uri={currentTrack?.CoverArt?.formats?.small?.url ?? ""}
                  style={styles.albumImage}
                />
                {hasAudio && (
                  <View style={styles.playOverlay}>
                    {loadingTrackId === item.id ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Ionicons
                        name={isCurrentPlaying && isPlaying ? "pause" : "play"}
                        size={18}
                        color={Colors.white}
                      />
                    )}
                  </View>
                )}
              </TouchableOpacity>

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

          {/* Progress Bar (Only visible for the active track) */}
          {isCurrentPlaying && hasAudio && (
            <View style={styles.playerContainer}>
              <View
                style={styles.progressTrack}
                onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={handleProgressTouchStart}
                onResponderMove={handleProgressTouchMove}
                onResponderRelease={handleProgressTouchEnd}
              >
                {/* Background Track Line */}
                <View style={styles.progressBackgroundLine} />

                {/* Active Progress Fill Line */}
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPct * 100}%` },
                  ]}
                  pointerEvents="none"
                />

                {/* Slider Knob Thumb */}
                <View
                  style={[
                    styles.progressKnob,
                    { left: `${progressPct * 100}%` },
                  ]}
                  pointerEvents="none"
                />
              </View>
              <View style={styles.timeLabelsRow}>
                <Text style={styles.timeText}>
                  {formatTime(playbackPosition)}
                </Text>
                <Text style={styles.timeText}>
                  {formatTime(playbackDuration)}
                </Text>
              </View>
            </View>
          )}
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
          onPress={() => navigation.goBack()}
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
  imageContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  playerContainer: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderColor: "#E5E5E5",
  },
  progressTrack: {
    width: "100%",
    height: 16,
    justifyContent: "center",
    position: "relative",
    marginBottom: 4,
  },
  progressBackgroundLine: {
    height: 4,
    width: "100%",
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    position: "absolute",
  },
  progressBarFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    position: "absolute",
  },
  progressKnob: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
    position: "absolute",
    top: 2,
    transform: [{ translateX: -6 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  timeLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    fontSize: 9,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.gray,
  },
});
