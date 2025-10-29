import { Colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";

// Lazy loading image component
export const LazyImage = ({ uri, style }: { uri: string; style: any }) => {
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

const styles = StyleSheet.create({
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
