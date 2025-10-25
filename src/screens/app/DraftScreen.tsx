import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { getUserDrafts } from "@/api/draftApi";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

type DraftItem = {
  id: string;
  ReleaseTitle: string;
  ReleaseType: string;
  CoverArt?: {
    formats?: {
      small?: {
        url?: string;
      };
    };
  };
};

const DraftScreen = () => {
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
        console.log("Error fetching draft list:", err);
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

  // Lazy loading image component
  const LazyImage = ({ uri, style }: { uri: string; style: any }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (imageError) {
      return (
        <View style={[style, styles.errorImage]}>
          <Ionicons name="musical-notes" size={24} color={Colors.gray} />
        </View>
      );
    }

    return (
      <View style={style}>
        {!imageLoaded && (
          <View style={[style, styles.placeholderImage]}>
            <Ionicons name="musical-notes" size={24} color={Colors.gray} />
          </View>
        )}
        <Image
          source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${uri}` }}
          style={[style, { opacity: imageLoaded ? 1 : 0 }]}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      </View>
    );
  };

  const renderDraftItem = ({ item }: { item: DraftItem }) => (
    <View style={styles.draftCard}>
      <LazyImage
        uri={item.CoverArt?.formats?.small?.url ?? ""}
        style={styles.albumImage}
      />
      <View style={styles.draftContent}>
        <Text style={styles.albumName}>{item.ReleaseTitle}</Text>
        <Text style={styles.albumType}>{item.ReleaseType}</Text>
      </View>
      <Text style={styles.draftText}>Draft</Text>
    </View>
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
            onPress={() => navigation.navigate("HomeTab")}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Drafts</Text>
          <View style={styles.placeholder}>
            <TouchableOpacity
              onPress={() => navigation?.navigate("Notification")}
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

        {isLoading ? (
          <FlatList
            data={[1, 2, 3, 4, 5]} // Show 5 skeleton items
            renderItem={renderSkeletonItem}
            keyExtractor={(item) => item.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : draftList.length > 0 ? (
          <FlatList
            data={draftList}
            renderItem={renderDraftItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No Drafts Found</Text>
            <Text style={styles.emptySubtitle}>
              Start creating your first draft to see it here
            </Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default DraftScreen;

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
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: Colors.gray,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  placeholder: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
  },
  topButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 6,
    padding: 6,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  draftCard: {
    display: "flex",
    backgroundColor: Colors.white,
    padding: 12,
    paddingRight: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  albumImage: {
    width: 78,
    height: 60,
    borderRadius: 8,
  },
  draftContent: {
    flex: 1,
    marginLeft: 12,
  },
  albumName: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.black,
    textTransform: "capitalize",
    marginBottom: 4,
  },
  albumType: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.gray,
  },
  draftText: {
    backgroundColor: "#E8A3003D",
    color: "#F49F00",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 600,
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
    width: 78,
    height: 60,
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
  // Lazy loading styles
  placeholderImage: {
    position: "absolute",
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  errorImage: {
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
});
