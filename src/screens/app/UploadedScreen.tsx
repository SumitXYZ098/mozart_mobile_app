import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { useUserPublishTracks } from "@/hooks/useUserPublishTracks";
import UploadCard from "@/components/screenComponents/homeScreen/UploadCard";
import { useNavigation } from "@react-navigation/native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

const { width } = Dimensions.get("window");

export default function UploadedScreen() {
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
  }, [loading]);

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
      </View>
    );
  };

  const renderUploadList = (data: any[]) => {
    if (loading) {
      return (
        <View style={styles.gridContainer}>
          {[1, 2, 3, 4].map((item) => (
            <SkeletonCard key={item} />
          ))}
        </View>
      );
    }

    if (data.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="cloud-upload-outline" size={64} color={Colors.gray} />
          <Text style={styles.emptyTitle}>No Uploads Found</Text>
          <Text style={styles.emptySubtitle}>
            Start uploading your music to see it here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.gridContainer}>
        {data.map((track) => (
          <UploadCard
            key={track.id}
            id={track.id.toLocaleString()}
            albumName={track.ReleaseTitle}
            albumType={track.ReleaseType}
            albumImage={track.CoverArt.formats?.thumbnail?.url ?? ""}
          />
        ))}
      </View>
    );
  };

  // You can filter tracks by status here
  const InProgressRoute = () =>
    renderUploadList(tracks.filter((t) => t.Status === "In-Progress"));
  const CompleteRoute = () =>
    renderUploadList(tracks.filter((t) => t.Status === "Complete"));
  const InactiveRoute = () =>
    renderUploadList(tracks.filter((t) => t.Status === "Inactive"));

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
    width: "100%",
    height: 130,
    backgroundColor: Colors.gray,
    borderRadius: 12,
    marginBottom: 12,
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
});
