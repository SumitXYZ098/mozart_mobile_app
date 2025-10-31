import { Colors } from "@/theme/colors";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface DraftCardProps {
  id: string;
  albumName: string;
  albumType: string;
  albumImage: string;
}

const DraftCard: React.FC<DraftCardProps> = ({
  id,
  albumName,
  albumImage,
  albumType,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigation = useNavigation<any>();

  // Lazy loading image component
  const LazyImage = () => {
    if (imageError) {
      return (
        <View style={[styles.albumImage, styles.errorImage]}>
          <Ionicons name="musical-notes" size={24} color={Colors.gray} />
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        {!imageLoaded && (
          <View style={[styles.albumImage, styles.placeholderImage]}>
            <Ionicons name="musical-notes" size={24} color={Colors.gray} />
          </View>
        )}
        <Image
          source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${albumImage}` }}
          style={[styles.albumImage, { opacity: imageLoaded ? 1 : 0 }]}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("MusicTab", {
          screen: "NewRelease",
          params: { routeId: id, step: 1 },
        })
      }
      focusable={false}
    >
      <View style={styles.section}>
        <View className="flex flex-row gap-x-2 items-center">
          <LazyImage />
          <View className="flex flex-col">
            <Text style={styles.albumName}>{albumName}</Text>
            <Text style={styles.albumType}>{albumType}</Text>
          </View>
        </View>
        <Text style={styles.draftText}>Draft</Text>
      </View>
    </TouchableOpacity>
  );
};

export default DraftCard;

const styles = StyleSheet.create({
  section: {
    display: "flex",
    backgroundColor: Colors.white,
    padding: 6,
    paddingRight: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
  },
  albumImage: {
    width: 78,
    height: 60,
    borderRadius: 8,
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
  imageContainer: {
    position: "relative",
  },
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
