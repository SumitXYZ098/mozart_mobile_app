import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { useUserPublishTracks } from "@/hooks/useUserPublishTracks";
import { useNavigation } from "@react-navigation/native";
import { TabView, SceneMap} from "react-native-tab-view";
import dayjs from "dayjs";
import { LazyImage } from "@/components/modules/LazyImage";

const { width } = Dimensions.get("window");

export default function MyReleaseScreen() {
  const { tracks, loading } = useUserPublishTracks();
  const shimmerAnimation = new Animated.Value(0);
  const navigation = useNavigation<any>();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "inProgress", title: "In-Progress" },
    { key: "complete", title: "Complete" },
    { key: "inactive", title: "Inactive" },
  ]);

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
        <View style={[styles.updateContent, { flex: 1 }]}>
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

  const renderUpdateItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("MusicTab", {
          screen: "Track",
          params: { routeId: item.id },
        })
      }
      focusable={false}
    >
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
                uri={item.CoverArt?.formats?.small?.url ?? ""}
                style={styles.albumImage}
              />
              <View style={styles.updateContent}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 6,
                  }}
                >
                  <Text style={styles.albumName}>{item.ReleaseTitle}</Text>
                  <Text style={styles.albumType}>{item.ReleaseType}</Text>
                </View>
                <Text style={styles.totalTrack}>
                  Tracks: {item.TrackList?.length}
                </Text>
                <Text style={styles.createdDate}>
                  Release Date: {dayjs(item.releaseDate).format("DD/MM/YYYY")}
                </Text>
              </View>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              {item.Priority === "Priority" ? (
                <Ionicons
                  name="star"
                  size={20}
                  color={Colors.primary}
                  style={{
                    backgroundColor: Colors.lightPrimary,
                    padding: 3,
                    borderRadius: 4,
                  }}
                />
              ) : (
                <Ionicons
                  name="star"
                  size={20}
                  color={Colors.gray}
                  style={{
                    backgroundColor: Colors.secondary,
                    padding: 3,
                    borderRadius: 4,
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSkeletonItem = () => <SkeletonCard />;

  const renderUploadItems = (
    data: any[],
    isLoading: boolean,
    emptyMessage: string
  ) => {
    if (isLoading) {
      // ⏳ Skeletons while loading
      return (
        <FlatList
          data={[1, 2, 3, 4, 5]} // Show 5 skeleton items
          renderItem={renderSkeletonItem}
          keyExtractor={(item) => item.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      );
    }

    if (data.length === 0) {
      // ❌ Empty state message
      return (
        <View style={styles.emptyState}>
          <Ionicons name="cloud-upload-outline" size={64} color={Colors.gray} />
          <Text style={styles.emptyTitle}>{emptyMessage}</Text>
          <Text style={styles.emptySubtitle}>
            Start uploading your music to see it here
          </Text>
        </View>
      );
    }

    // ✅ Normal data render
    return (
      <FlatList
        data={data}
        renderItem={renderUpdateItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  // You can filter tracks by status here
  const InProgressRoute = () =>
    renderUploadItems(
      tracks.filter((t) => t.Status === "In-Progress"),
      loading,
      "No uploads in progress yet."
    );
  const CompleteRoute = () =>
    renderUploadItems(
      tracks.filter((t) => t.Status === "Complete"),
      loading,
      "No completed uploads yet."
    );

  const InactiveRoute = () =>
    renderUploadItems(
      tracks.filter((t) => t.Status === "Inactive"),
      loading,
      "No inactive uploads found."
    );

  const renderScene = SceneMap({
    inProgress: InProgressRoute,
    complete: CompleteRoute,
    inactive: InactiveRoute,
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("HomeTab")}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Releases</Text>
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

      {/* TABS */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width }}
        renderTabBar={(props) => (
          <View style={styles.customTabBar}>
            {props.navigationState.routes.map((route, i) => {
              const focused = index === i;
              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={() => setIndex(i)}
                  style={[styles.tabItem, focused && styles.activeTabItem]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      focused ? styles.activeTabText : styles.inactiveTabText,
                    ]}
                  >
                    {route.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    gap: 12,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
  },
  skeletonImage: {
    width: 78,
    height: 78,
    backgroundColor: Colors.gray,
    borderRadius: 12,
  },
  cardSection: {
    width: "48%",
    height: 130,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
  },
  customTabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    marginHorizontal: 24,
    marginBottom: 8,
    borderRadius: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  activeTabItem: {
    backgroundColor: "#E8D5FF", // light purple background
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: Colors.primary, // purple text color
  },
  inactiveTabText: {
    color: "#A0A0A0", // gray for inactive
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
  albumImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  albumName: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.black,
    textTransform: "capitalize",
    marginBottom: 4,
  },
  albumType: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.primary,
  },
  createdDate: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.gray,
  },
  totalTrack: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: Colors.black,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 80, // 👈 ensures scroll space at bottom
  },
});
