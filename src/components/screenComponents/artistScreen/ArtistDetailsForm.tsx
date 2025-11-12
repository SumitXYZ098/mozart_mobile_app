import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import RNHeicConverter from "react-native-heic-converter";
import { useForm, Controller } from "react-hook-form";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { useArtistListById } from "@/hooks/useArtistList";
import {
  deleteUploadFileById,
  getUploadFileById,
  uploadFile,
} from "@/api/uploadApi";
import { createArtist, updateArtistById } from "@/api/artistApi";
import { KeyboardAwareScrollView } from "@pietile-native-kit/keyboard-aware-scrollview";

interface ArtistDetailsFormProps {
  visible: boolean;
  onClose: () => void;
  artistId?: string | null;
  onRefresh: () => void;
}

const ArtistDetailsForm: React.FC<ArtistDetailsFormProps> = ({
  visible,
  onClose,
  artistId,
  onRefresh,
}) => {
  const { control, handleSubmit, setValue, reset, getValues } = useForm({
    defaultValues: {
      artistName: "",
      biography: "",
      appleMusicId: "",
      spotifyId: "",
      youtubeUsername: "",
      soundcloudPage: "",
      facebookPage: "",
      twitterUsername: "",
      websiteUrl: "",
      Profile_image: null,
    },
  });

  const { artist, loading } = useArtistListById(artistId || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // --- form populate from existing artist ---
  useEffect(() => {
    if (artistId && artist) {
      setValue("artistName", artist?.artistName ?? "");
      setValue("biography", artist?.biography ?? "");
      setValue("Profile_image", artist?.Profile_image?.id ?? (null as any));
      setValue("appleMusicId", artist?.appleMusicId ?? "");
      setValue("spotifyId", artist?.spotifyId ?? "");
      setValue("soundcloudPage", artist?.soundcloudPage ?? "");
      setValue("facebookPage", artist?.facebookPage ?? "");
      setValue("twitterUsername", artist?.twitterUsername ?? "");
      setValue("websiteUrl", artist?.websiteUrl ?? "");
      setValue("youtubeUsername", artist?.youtubeUsername ?? "");
      const fetchImageUrl = async () => {
        const savedImageId = getValues("Profile_image");
        if (savedImageId) {
          const imgUrl = await getUploadFileById(savedImageId);
          setPreviewUrl(imgUrl?.formats?.thumbnail?.url || imgUrl?.url);
        }
      };
      fetchImageUrl();
    } else {
      setValue("artistName", "");
      setValue("biography", "");
      setValue("Profile_image", null);
      setValue("appleMusicId", "");
      setValue("spotifyId", "");
      setValue("soundcloudPage", "");
      setValue("facebookPage", "");
      setValue("twitterUsername", "");
      setValue("websiteUrl", "");
      setValue("youtubeUsername", "");
      setPreviewUrl("");
    }
  }, [artistId, artist, setValue]);

  const handleSelectImage = async () => {
    try {
      // ✅ Request permission
      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos."
        );
        return;
      }

      // ✅ Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;

      const selected = result.assets[0];

      let localUri = selected.uri;
      let mimeType = selected.mimeType || "image/png";
      let fileName =
        selected.fileName || localUri.split("/").pop() || "profile-image.png";

      // ✅ Convert HEIC → PNG if necessary
      if (
        mimeType === "image/heic" ||
        mimeType === "image/heif" ||
        fileName.toLowerCase().endsWith(".heic")
      ) {
        try {
          const converted = await RNHeicConverter.convert({
            path: localUri,
            quality: 1,
            format: "PNG", // ✅ Convert to PNG
          });

          if (converted?.path) {
            console.log("✅ HEIC converted to PNG:", converted.path);
            localUri = converted.path;
            mimeType = "image/png";
            fileName = fileName.replace(/\.heic$/i, ".png");
          } else {
            console.warn("⚠️ HEIC conversion failed, using original file");
          }
        } catch (err) {
          console.warn("⚠️ HEIC conversion error:", err);
        }
      }

      // ✅ Prepare file for upload
      let file: any;
      if (Platform.OS === "web" && selected.file) {
        file = selected.file;
      } else {
        file = { uri: localUri, name: fileName, type: mimeType };
      }

      // --- Upload process ---
      setUploading(true);
      setUploadProgress(0);

      const uploaded = await uploadFile(file, (progress) =>
        setUploadProgress(progress)
      );

      const imageId = uploaded?.[0]?.id;
      
      if (imageId) {
        setValue("Profile_image", imageId, { shouldValidate: true });
        const fileInfo = await getUploadFileById(imageId);
        setPreviewUrl(fileInfo?.formats?.thumbnail?.url || fileInfo?.url);
        Alert.alert("✅ Success", "Profile image uploaded!");
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

  // Remove image
  const handleRemoveImage = async () => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const imageId = getValues("Profile_image");
      console.log(imageId, "Image id:");
      console.log(getValues("Profile_image"), "Image id get");
      if (imageId)
        await deleteUploadFileById(imageId, (progress) =>
          setUploadProgress(progress)
        );
      setPreviewUrl(null);
      setValue("Profile_image", null, { shouldValidate: true });
      Alert.alert("Removed", "Profile image deleted.");
    } catch {
      Alert.alert("Error", "Failed to delete image.");
    } finally {
      setUploading(false);
    }
  };

  // Submit handler
  const onSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      setUploadProgress(0);
      if (artistId) {
        await updateArtistById(Number(artistId), formData, (progress) =>
          setUploadProgress(progress)
        );
        Alert.alert("Success", "Artist updated successfully!");
      } else {
        await createArtist(formData, (progress) => setUploadProgress(progress));
        Alert.alert("Success", "Artist created successfully!");
      }

      onClose();
      reset();
      onRefresh();
    } catch (err) {
      Alert.alert(
        "Error",
        artistId ? "Failed to update artist." : "Failed to create artist."
      );
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  const handleOnClose = () => {
    if (onClose) {
      setPreviewUrl("");
      onClose();
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {artistId ? "Edit Artist" : "New Artist"}
              </Text>
              <Pressable onPress={handleOnClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={28} color="#b3b3b3" />
              </Pressable>
            </View>

            {loading ? (
              <ActivityIndicator color={Colors.primary} size="large" />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Basic Info */}
                <FormInput
                  control={control}
                  name="artistName"
                  label="Artist Name"
                  required
                />
                <FormInput
                  control={control}
                  name="biography"
                  label="Biography"
                  multiline
                  numberOfLines={2}
                />
                {/* Profile Image */}
                <Text style={styles.sectionTitle}>Profile Image</Text>
                <View style={styles.uploadContainer}>
                  {previewUrl && getValues("Profile_image") ? (
                    <View style={styles.previewContainer}>
                      <Image
                        source={{
                          uri: `${process.env.EXPO_PUBLIC_API_URL}${previewUrl}`,
                        }}
                        style={styles.uploadedImage}
                      />

                      {uploading && (
                        <View style={styles.progressContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              { width: `${uploadProgress}%` },
                            ]}
                          />
                          <Text style={styles.progressText}>
                            {Math.floor(uploadProgress)}%
                          </Text>
                        </View>
                      )}

                      <Pressable
                        onPress={handleRemoveImage}
                        style={styles.removeFileButton}
                      >
                        <Text style={styles.removeFileText}>Remove File</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      onPress={handleSelectImage}
                      style={styles.uploadBox}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <ActivityIndicator color={Colors.primary} />
                      ) : (
                        <View style={styles.uploadInner}>
                          <AntDesign
                            name="cloud-upload"
                            size={32}
                            color={Colors.primary}
                          />
                          <View>
                            <Text style={styles.uploadTitle}>
                              Select a file
                            </Text>
                            <Text style={styles.uploadSubtitle}>
                              JPG, PNG, or Image file size no more than 10MB
                            </Text>
                          </View>
                        </View>
                      )}
                    </Pressable>
                  )}
                </View>

                {/* Channels */}
                <Text style={styles.sectionTitle}>Music Channels</Text>
                <FormInput
                  control={control}
                  name="appleMusicId"
                  label="Apple Music ID"
                />
                <FormInput
                  control={control}
                  name="spotifyId"
                  label="Spotify ID"
                />
                <FormInput
                  control={control}
                  name="youtubeUsername"
                  label="YouTube Username"
                />
                <FormInput
                  control={control}
                  name="soundcloudPage"
                  label="SoundCloud Page"
                />

                {/* Social Media */}
                <Text style={styles.sectionTitle}>Social Media</Text>
                <FormInput
                  control={control}
                  name="facebookPage"
                  label="Facebook Page"
                />
                <FormInput
                  control={control}
                  name="twitterUsername"
                  label="X (Twitter)"
                />
                <FormInput
                  control={control}
                  name="websiteUrl"
                  label="Website URL"
                />
                {/* Submit */}
                <Pressable
                  disabled={submitting}
                  onPress={handleSubmit(onSubmit)}
                  style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>
                      {artistId ? "Update Artist" : "Create Artist"}
                    </Text>
                  )}
                </Pressable>
              </ScrollView>
            )}
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ArtistDetailsForm;

const FormInput = ({
  control,
  name,
  label,
  required,
  multiline,
  numberOfLines,
}: any) => (
  <Controller
    control={control}
    name={name}
    rules={required ? { required: `${label} is required` } : {}}
    render={({ field: { onChange, value } }) => (
      <View style={{ marginTop: 12 }}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input]}
          placeholder={label}
          value={value || ""}
          onChangeText={onChange}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
    )}
  />
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  dialog: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    color: Colors.black,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  imageContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadContainer: {
    alignItems: "center",
    marginTop: 12,
  },

  uploadBox: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderStyle: "dashed",
    borderRadius: 10,
    width: "100%",
    padding: 10,
    backgroundColor: Colors.secondary,
  },

  uploadInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    marginRight: 10,
  },

  uploadTitle: {
    fontSize: 12,
    color: Colors.black,
    fontFamily: "Poppins_400Regular",
  },

  uploadSubtitle: {
    fontSize: 10,
    color: Colors.gray,
    fontFamily: "Poppins_400Regular",
  },

  uploadedImage: {
    width: 70,
    height: 60,
    borderRadius: 10,
    marginVertical: 8,
  },

  previewContainer: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    borderRadius: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  removeFileButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.bgRed,
  },

  removeFileText: {
    fontSize: 13,
    color: Colors.red,
    fontFamily: "Poppins_400Regular",
  },

  progressContainer: {
    width: "80%",
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 4,
    marginTop: 8,
    overflow: "hidden",
    alignItems: "center",
  },

  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
  },

  progressText: {
    position: "absolute",
    top: -18,
    fontSize: 12,
    color: "#555",
  },
  uploadText: {
    color: Colors.gray,
  },

  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
