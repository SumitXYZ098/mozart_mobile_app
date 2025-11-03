import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFormContext, Controller } from "react-hook-form";
import { Colors } from "@/theme/colors";
import {
  deleteUploadFileById,
  getUploadFileById,
  uploadFile,
} from "@/api/uploadApi";

interface CoverArtStepProps {
  draftFormData: any;
}

const CoverArtStep: React.FC<CoverArtStepProps> = ({ draftFormData }) => {
  const { control, setValue, watch, getValues } = useFormContext();
  const coverArtId = watch("CoverArt");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ✅ Load saved draft image
  useEffect(() => {
    if (draftFormData?.data?.CoverArt?.id) {
      setValue("CoverArt", draftFormData.data.CoverArt.id);
    }
  }, [draftFormData, setValue]);

  useEffect(() => {
    const fetchImageUrl = async () => {
      const savedImageId = getValues("CoverArt");
      if (savedImageId) {
        const imgUrl = await getUploadFileById(savedImageId);
        setPreviewUrl(imgUrl?.formats?.thumbnail?.url);
      }
    };
    fetchImageUrl();
  }, []);

  // ✅ Image picker (Expo SDK 52+)
  const handlePickImage = async () => {
    try {
      // Request permissions
      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos."
        );
        return;
      }

      // Launch picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;

      const selected = result.assets[0];
      // console.log("📸 Picked image:", selected);
      console.log("📸 Picked image:", selected.file);
      let file: any;
      if (Platform.OS === "web" && selected.file) {
        file = selected.file;
      } else {
        const localUri = selected.uri;
        const filename =
          selected.fileName || localUri.split("/").pop() || "cover-art.jpg";
        const type = selected.mimeType || "image/jpeg";
        file = { uri: localUri, name: filename, type };
      }

      // --- Upload process ---
      setUploading(true);
      setUploadProgress(0);

      const uploaded = await uploadFile(file, (progress) =>
        setUploadProgress(progress)
      );

      const imageId = uploaded?.[0]?.id;
      if (imageId) {
        setValue("CoverArt", imageId, { shouldValidate: true });
        const fileInfo = await getUploadFileById(imageId);
        setPreviewUrl(fileInfo?.formats?.thumbnail?.url || fileInfo?.url);
        Alert.alert("✅ Success", "Cover art uploaded successfully.");
      }
    } catch (err: any) {
      console.error("❌ Upload failed:", err);

      Alert.alert(
        "Upload Error",
        err?.response?.data?.error?.message ||
          err?.message ||
          "Failed to upload image."
      );
    } finally {
      setUploading(false);
    }
  };

  // ✅ Clear image
  const handleClear = async () => {
    const coverArt = watch("CoverArt");
    console.log(coverArt)
    if (!coverArt) return;
    setUploading(true);
    try {
      await deleteUploadFileById(coverArt, (progress: number) =>
        setUploadProgress(progress)
      );
      setValue("CoverArt", null, { shouldValidate: true });
      setPreviewUrl(null);
      Alert.alert("Removed", "Cover art deleted successfully.");
    } catch (err) {
      console.error("Failed to delete file:", err);
      Alert.alert("Error", "Failed to remove cover art.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cover Art</Text>
      <Text style={styles.subtitle}>
        Upload your album or single cover art.
      </Text>

      <Controller
        control={control}
        name="CoverArt"
        rules={{ required: "Cover art is required." }}
        render={({ fieldState }) => (
          <View
            style={{
              padding: 24,
            }}
          >
            <TouchableOpacity
              style={[
                styles.uploadBox,
                (previewUrl || coverArtId) && { borderColor: Colors.primary },
              ]}
              onPress={handlePickImage}
              disabled={uploading}
            >
              {uploading ? (
                <View style={styles.uploading}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.progressText}>
                    Uploading... {uploadProgress}%
                  </Text>
                </View>
              ) : previewUrl ? (
                <View style={styles.previewContainer}>
                  <Image
                    source={{
                      uri: `${process.env.EXPO_PUBLIC_API_URL}${previewUrl}`,
                    }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClear}
                  >
                    <Text style={styles.clearText}>Clear Cover Art</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.uploadText}>Tap to select image</Text>
                  <Text style={styles.hintText}>
                    Supported: JPEG, PNG, TIFF (max 36MB)
                  </Text>
                  <Text style={styles.hintText}>
                    Recommended size: 3000 × 3000 pixels
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {fieldState.error && (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            )}
          </View>
        )}
      />

      <Text style={styles.warning}>
        ⚠️ If your cover art doesn’t meet requirements, your release may be
        rejected.
      </Text>
    </View>
  );
};

export default CoverArtStep;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  uploadBox: {
    width: "100%",
    height: 280,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  hintText: { fontSize: 12, color: "#777" },
  previewContainer: { alignItems: "center" },
  imagePreview: { width: 160, height: 160, borderRadius: 12, marginBottom: 12 },
  clearButton: {
    borderWidth: 1,
    borderColor: "#E53935",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearText: { color: "#E53935", fontWeight: "600" },
  errorText: {
    color: "#E53935",
    marginTop: 8,
    fontSize: 13,
    textAlign: "center",
  },
  warning: {
    fontSize: 12,
    color: "#D9534F",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  uploading: { alignItems: "center", justifyContent: "center" },
  progressText: { fontSize: 13, color: Colors.primary, marginTop: 8 },
});
