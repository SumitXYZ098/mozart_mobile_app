import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { getUserDrafts } from "@/api/draftApi";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import BaseBottomSheet, {
  BaseBottomSheetRef,
} from "@/components/modules/baseBottomSheet/BaseBottomSheet";
import DynamicModal from "@/components/modules/modal/DynamicModal";
import { useDraftStore } from "@/stores/draftStore";
import { useDraftFlow } from "@/hooks/useDraft";
import { LazyImage } from "@/components/modules/LazyImage";

type DraftItem = {
  id: string;
  ReleaseTitle: string;
  ReleaseType: string;
  createdAt: Date;
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
  const bottomSheetRef = useRef<BaseBottomSheetRef>(null);
  const [modalData, setModalData] = useState<any>({
    visible: false,
  });
  const { setDraftId, clearDraft, draftId } = useDraftStore();
  const { deleteDraftMutation } = useDraftFlow();

  const showModal = (config: any) => setModalData({ ...config, visible: true });
  const hideModal = () => setModalData((p: any) => ({ ...p, visible: false }));

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

  useEffect(() => {
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
      <View
        style={[
          styles.draftCard,
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
  };

  const renderDraftItem = ({ item }: { item: DraftItem }) => (
    <View style={styles.draftCard}>
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
            <View style={styles.draftContent}>
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

              <Text style={styles.createdDate}>
                Created Date: {dayjs(item.createdAt).format("DD/MM/YYYY")}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => {
                bottomSheetRef.current?.present();
                setDraftId(Number(item.id));
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

  const handleDeleteDraft = () => {
    bottomSheetRef.current?.dismiss();

    showModal({
      type: "warning",
      title: "Are you sure?",
      message: "You won't be able to revert this!",
      confirmText: "Yes, delete it!",
      cancelText: "Cancel",
      onConfirm: async () => {
        hideModal();

        try {
          // 🟢 Run your async mutation
          await deleteDraftMutation.mutateAsync();

          // 🟢 Refetch draft list from API instead of local filtering
          await fetchDraftList();

          // 🟢 Show success modal
          showModal({
            type: "success",
            title: "Deleted!",
            message: "Your file has been deleted.",
            confirmText: "OK",
            onConfirm: hideModal,
          });
        } catch (error) {
          console.error("Error deleting draft:", error);

          // 🔴 Show error modal
          showModal({
            type: "error",
            title: "Failed!",
            message: "Something went wrong while deleting the draft.",
            confirmText: "OK",
            onConfirm: hideModal,
          });
        } finally {
          clearDraft();
        }
      },
      onCancel: hideModal,
    });
  };

  const handleEditDraft = () => {
    console.log("Edit draft:", draftId);
    bottomSheetRef.current?.dismiss();
    // Navigate to edit screen with draft id
    navigation.navigate("MusicTab", {
      screen: "NewRelease",
      params: { routeId: draftId, step: 1 },
    });
  };

  return (
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
      <BaseBottomSheet ref={bottomSheetRef} title="Actions">
        <View style={styles.actionContent}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              console.log("Edit Draft Id:", draftId);
              handleEditDraft();
            }}
          >
            <MaterialIcons name="edit" size={20} color={Colors.primary} />
            <Text
              style={{
                color: Colors.primary,
                marginVertical: 20,
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              Edit Draft
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              console.log("Delete Draft Id:", draftId);
              handleDeleteDraft();
            }}
          >
            <Ionicons name="trash-bin" size={20} color={Colors.error} />
            <Text
              style={{
                color: Colors.error,
                marginVertical: 20,
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              Delete Draft
            </Text>
          </TouchableOpacity>
        </View>
      </BaseBottomSheet>
      <DynamicModal {...modalData} />
    </SafeAreaView>
  );
};

export default DraftScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  draftCard: {
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
  albumImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  draftContent: {
    marginLeft: 10,
  },
  albumName: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.black,
    textTransform: "capitalize",
  },
  albumType: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.primary,
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
});
