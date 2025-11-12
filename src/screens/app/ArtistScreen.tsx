import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "@/theme/colors";
import DynamicSearchBar from "@/components/modules/DynamicSearchBar";
import { useArtistList } from "@/hooks/useArtistList";
import BaseBottomSheet, {
  BaseBottomSheetRef,
} from "@/components/modules/baseBottomSheet/BaseBottomSheet";
import { ArtistTransformed } from "@/api/artistApi";
import { LazyImage } from "@/components/modules/LazyImage";
import EmptyProfile from "../../../assets/images/emptyProfile.png";
import ArtistDetailsDialog from "@/components/screenComponents/artistScreen/ArtistDetailsDialog";
import ArtistDetailsForm from "@/components/screenComponents/artistScreen/ArtistDetailsForm";

const ArtistScreen = () => {
  const navigation = useNavigation<any>();
  const { artists, loading, fetchArtists } = useArtistList();
  const bottomSheetRef = useRef<BaseBottomSheetRef>(null);
  const shimmerAnimation = new Animated.Value(0);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [showArtistDialog, setShowArtistDialog] = useState(false);
  const [openArtistForm, setOpenArtistForm] = useState(false);

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
          styles.artistCard,
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
        <View style={[styles.artistContent, { flex: 1 }]}>
          <Animated.View
            style={[styles.skeletonTitle, { opacity: shimmerOpacity }]}
          />
          <Animated.View
            style={[styles.skeletonSubTitle, { opacity: shimmerOpacity }]}
          />
        </View>
        <Animated.View
          style={[styles.skeletonArtistText, { opacity: shimmerOpacity }]}
        />
      </View>
    );
  };

  const renderArtistItem = ({ item }: { item: ArtistTransformed }) => (
    <View style={styles.artistCard}>
      <View style={{ flexDirection: "column", gap: 4 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {item.profileImage ? (
              <LazyImage uri={item.profileImage} style={styles.artistImage} />
            ) : (
              <Image source={EmptyProfile} style={styles.artistImage} />
            )}
            <View style={styles.artistContent}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  columnGap: 6,
                }}
              >
                <Text style={styles.artistName}>{item.name}</Text>
              </View>

              <Text style={styles.createdDate}>
                Total Releases: {item.trackCount}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            <View
              style={[
                styles.statusBox,
                {
                  backgroundColor: item.verified
                    ? Colors.bgGreen
                    : Colors.bgRed,
                },
              ]}
            >
              <Text
                style={[
                  styles.artistStatus,
                  { color: item.verified ? Colors.green : Colors.red },
                ]}
              >
                {item.verified ? "Verified" : "Unverified"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setArtistId(item.id.toString());
                bottomSheetRef.current?.present();
              }}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={Colors.gray}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSkeletonItem = () => <SkeletonCard />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Artists</Text>
        <View style={styles.placeholder}>
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
      <TouchableOpacity
        style={styles.newArtistButton}
        onPress={() => {
          setArtistId("");
          setOpenArtistForm(true);
        }}
      >
        <Ionicons name="add-sharp" size={20} color={Colors.white} />
        <Text style={styles.newArt}>New artist</Text>
      </TouchableOpacity>
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>Artists List</Text>
        <DynamicSearchBar onSearch={(query) => fetchArtists(query)} />
      </View>
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]} // Show 5 skeleton items
          renderItem={renderSkeletonItem}
          keyExtractor={(item) => item.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : artists.length > 0 ? (
        <FlatList
          data={artists}
          renderItem={renderArtistItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color={Colors.gray} />
          <Text style={styles.emptyTitle}>No Any Artists Found</Text>
          <Text style={styles.emptySubtitle}>
            Start creating your artist to see it here
          </Text>
        </View>
      )}
      <BaseBottomSheet ref={bottomSheetRef} title="Actions">
        <View style={styles.actionContent}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              bottomSheetRef.current?.dismiss();
              setOpenArtistForm(true);
            }}
          >
            <FontAwesome5 name="user-edit" size={20} color={Colors.primary} />
            <Text
              style={{
                color: Colors.primary,
                marginVertical: 20,
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              Edit Artists Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              bottomSheetRef.current?.dismiss();
              setShowArtistDialog(true);
            }}
          >
            <MaterialCommunityIcons
              name="account-details"
              size={28}
              color={Colors.gray}
            />
            <Text
              style={{
                color: Colors.gray,
                marginVertical: 20,
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              Show Artists Details
            </Text>
          </TouchableOpacity>
        </View>
      </BaseBottomSheet>

      {/* Artist Profile */}
      <ArtistDetailsDialog
        visible={showArtistDialog}
        onClose={() => setShowArtistDialog(false)}
        artistId={artistId ?? ""}
        onRefresh={() => fetchArtists()}
      />

      {/* New/Edit Artist Profile */}
      <ArtistDetailsForm
        artistId={artistId}
        visible={openArtistForm}
        onClose={() => setOpenArtistForm(false)}
        onRefresh={() => fetchArtists()}
      />
    </SafeAreaView>
  );
};

export default ArtistScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: Colors.gray,
    fontFamily: "PlusJakartaSans_600SemiBold",
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
  newArtistButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    paddingVertical: 16,
    borderRadius: 36,
    marginBottom: 12,
  },
  newArt: {
    fontSize: 14,
    fontWeight: 700,
    color: Colors.white,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: Colors.black,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 90,
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
  skeletonImage: {
    width: 52,
    height: 52,
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
  skeletonArtistText: {
    width: 60,
    height: 24,
    backgroundColor: Colors.gray,
    borderRadius: 12,
  },
  artistCard: {
    display: "flex",
    backgroundColor: Colors.white,
    padding: 6,
    paddingRight: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  artistImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  artistContent: {
    marginLeft: 10,
  },
  artistName: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.black,
    textTransform: "capitalize",
  },
  artistStatus: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  statusBox: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  createdDate: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.gray,
  },
  actionContent: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  actionButton: {
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: Colors.secondary,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
});
