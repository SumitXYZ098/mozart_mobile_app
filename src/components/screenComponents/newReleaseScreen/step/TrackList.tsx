import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { StepButtons } from "@/components/common/StepButtons";

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

const Step3: React.FC<Step3Props> = ({ onNext, onBack }) => {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cover Art</Text>
      <Text style={styles.subtitle}>
        Upload your album or single cover artwork.
      </Text>

      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.uploadText}>Tap to upload image</Text>
        )}
      </TouchableOpacity>

      <StepButtons onNext={onNext} onBack={onBack} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  uploadBox: {
    height: 200,
    borderWidth: 2,
    borderColor: "#DDD",
    borderStyle: "dashed",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  uploadText: { color: "#8C52FF", fontWeight: "600" },
  image: { width: "100%", height: "100%", borderRadius: 16 },
});

export default Step3;
