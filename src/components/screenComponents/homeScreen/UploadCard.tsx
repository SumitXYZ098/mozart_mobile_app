import { Colors } from "@/theme/colors";
import React, { useState } from "react";
import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface UploadCardProps {
  id: string;
  albumName: string;
  albumType: string;
  albumImage: string;
}

const UploadCard: React.FC<UploadCardProps> = ({
  id,
  albumName,
  albumImage,
  albumType,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Lazy loading image component
  const LazyImage = () => {
    if (imageError) {
      return (
        <View style={[styles.albumImage, styles.errorImage]}>
          <Ionicons name="musical-notes" size={100} color={Colors.gray} />
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        {!imageLoaded && (
          <View style={[styles.albumImage, styles.placeholderImage]}>
            <Ionicons name="musical-notes" size={100} color={Colors.gray} />
          </View>
        )}
        <ImageBackground
          source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${albumImage}` }}
          style={[styles.albumImage, { opacity: imageLoaded ? 1 : 0 }]}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        >
          <LinearGradient
            colors={["#ffffff03", "#00000080"]}
            locations={[0.5, 0.8]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.overlay}
          >
            <Text style={styles.albumName}>{albumName}</Text>
            <Text style={styles.albumType}>{albumType}</Text>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  };

  return (
    <View style={styles.cardSection}>
      <LazyImage />
    </View>
  );
};

export default UploadCard;

const styles = StyleSheet.create({
  cardSection: {
    overflow: "hidden",
    borderRadius: 12,
    width: 160, // Fixed width for horizontal scrolling
    height: 130,
    position: "relative",
  },

  albumImage: {
    width: "auto",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 3,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 12,
    justifyContent: "flex-end",
  },

  albumName: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.white,
    textTransform: "capitalize",
  },
  albumType: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.white,
  },
  imageContainer: {
    position: "relative",
  },
  placeholderImage: {
    position: "absolute",
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  errorImage: {
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
});
