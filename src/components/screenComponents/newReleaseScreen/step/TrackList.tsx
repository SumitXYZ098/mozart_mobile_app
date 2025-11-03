// TrackList.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { deleteUploadFileById, uploadFile } from "@/api/uploadApi";
import { Colors } from "@/theme/colors";
import { limitText } from "@/utils/utils";
import { useDeleteTrack, useUpdateTrack } from "@/hooks/useTrack";
import TrackEditModalExpo from "./TrackEditModal";

const TrackList = ({ draftFormData }: { draftFormData?: any }) => {
  const { control, setValue, getValues, watch } = useFormContext();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "TrackList",
  });

  const releaseType = watch("ReleaseType");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const primaryGenre =
    releaseType === "Single" ? getValues("PrimaryGenre") : "";
  const secondaryGenre =
    releaseType === "Single" ? getValues("SecondaryGenre") : "";
  const { mutate: updateTrack } = useUpdateTrack();
  const { mutate: deleteTrack } = useDeleteTrack();

  // ✅ Prefill TrackList with data from draft
  useEffect(() => {
    if (draftFormData?.data?.TrackList?.length) {
      setValue("TrackList", []);

      draftFormData.data.TrackList.forEach((track: any) => {
        append({
          TrackName: track.TrackName,
          PrimaryGenre: track.PrimaryGenre,
          SecondaryGenre: track.SecondaryGenre,
          RoleCredits: track.RoleCredits,
          LyricsAvailable: track.LyricsAvailable,
          AppropriateForAllAudiences: track.AppropriateForAllAudiences,
          ContainsExplicitContent: track.ContainsExplicitContent,
          CleanVersionAvailable: track.CleanVersionAvailable,
          ISRC: track.ISRC,
          ISWC: track.ISWC,
          RequestANewISRC: track.RequestANewISRC,
          TrackUpload: track.TrackUpload?.id,
          file: track.TrackUpload?.name,
          stepCompleted: true,
          currentStep: 1,
          trackId: track.id,
        });
      });
    }
  }, [draftFormData, append, setValue]);

  // ✅ Validate that selected file is correct format and size
  const validateAudioFile = (file: {
    name: string;
    type: string;
    size?: number;
  }) => {
    const allowedTypes = ["audio/wav", "audio/flac"];
    const maxSize = 100 * 1024 * 1024; // 100 MB (adjust if needed)

    // 1️⃣ Check file type
    if (!allowedTypes.includes(file.type)) {
      Alert.alert(
        "Invalid File Type",
        "Only WAV or FLAC audio files are allowed."
      );
      return false;
    }

    // 2️⃣ Check file size (if available)
    if (file.size && file.size > maxSize) {
      Alert.alert("File Too Large", "File size must be less than 100 MB.");
      return false;
    }

    return true;
  };

  // ✅ Upload and update the track audio file (React Native version)
  const handlePickAudio = async (
    index: number,
    onChange: (fileId: string | null) => void
  ) => {
    try {
      // 1️⃣ Pick audio file using DocumentPicker
      const res = await DocumentPicker.getDocumentAsync({
        type: ["audio/wav", "audio/flac"],
        copyToCacheDirectory: true,
      });

      if (res.canceled) return;

      const file = res.assets?.[0];
      if (!file) return;

      let fileToUpload: any;
      if (Platform.OS === "web" && file.file) {
        fileToUpload = file.file;
      } else {
        fileToUpload = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "audio/*",
        } as any;
      }

      // 2️⃣ Validate audio file (you can reuse validateAudioFile)
      // if (!validateAudioFile(mockFile)) {
      //   Alert.alert("Invalid file", "Please select a valid audio file.");
      //   return;
      // }

      // 3️⃣ Get existing fileId & trackId
      const existingFileId = getValues(`TrackList.${index}.TrackUpload`);
      const trackId = getValues(`TrackList.${index}.trackId`);

      // 4️⃣ Delete existing uploaded file if any
      if (existingFileId) {
        await deleteUploadFileById(existingFileId, (progress) =>
          setUploadProgress(progress)
        );
        setValue(`TrackList.${index}.TrackUpload`, null);
      }

      // 5️⃣ Upload the new file
      setUploading(true);
      setUploadProgress(0);

      const uploaded = await uploadFile(fileToUpload, (progress) =>
        setUploadProgress(progress)
      );
      const fileId = uploaded?.[0]?.id || null;

      // 6️⃣ Update backend track if exists
      if (trackId && fileId) {
        await updateTrack({
          trackId,
          payload: { TrackUpload: fileId },
        });
      }

      // 7️⃣ Update form state
      onChange(fileId);
      setValue(`TrackList.${index}.TrackUpload`, fileId);
      setValue(`TrackList.${index}.file`, file.name);

      // 8️⃣ Success message
      Alert.alert("Success", "Audio file uploaded successfully.");
    } catch (error: any) {
      console.error("Audio upload failed:", error);
      Alert.alert("Error", error?.message || "Failed to upload audio file.");
      onChange(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Add the one more track in album/Ep
  const handleAddTrack = () => {
    if (fields.length === 0) {
      // Clear any residual data first
      setValue("TrackList", []); // Reset field array
    }

    // Append new track
    append({
      TrackName: "Track Title",
      PrimaryGenre: primaryGenre,
      SecondaryGenre: secondaryGenre,
      RoleCredits: [
        { artistName: "", roleName: "Primary Artist" },
        { artistName: "", roleName: "Composer" },
        { artistName: "", roleName: "Lyricist" },
        { artistName: "", roleName: "Vocals" },
      ],
      LyricsAvailable: false,
      AppropriateForAllAudiences: true,
      ContainsExplicitContent: false,
      CleanVersionAvailable: false,
      ISRC: "",
      ISWC: "",
      RequestANewISRC: false,
      TrackUpload: null,
      file: null,
      stepCompleted: false,
      currentStep: 0,
      trackId: null,
      Status: "In-Progress",
    });
  };

  // ✅ delete track
  const handleDeleteTrack = async (index: number) => {
    const releaseId = getValues(`TrackList.${index}.trackId`);
    try {
      setUploading(true);
      setUploadProgress(0);
      if (releaseId) {
        await deleteTrack(releaseId);
        // console.log("Release Track delete successfully", releaseId);
        setUploadProgress(100);
      }
      remove(index);
    } catch (err) {
      console.error("Error deleting track:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Validation for Track metadata fields
  const validateTrackFields = (trackData: any, trackUpload: any) => {
    console.log(trackData, "Track Data");
    console.log(trackUpload, "Track Upload");
    const { TrackName, PrimaryGenre, RoleCredits, stepCompleted } = trackData;

    const allFieldsEmpty =
      !TrackName.trim() &&
      !PrimaryGenre.trim() &&
      RoleCredits.every(
        (role: { artistName: string; roleName: string }) =>
          !role.artistName.trim() && !role.roleName.trim()
      );

    if (allFieldsEmpty) {
      return "All fields are empty. Please fill the track details.";
    }

    if (!TrackName.trim()) return "Track Name is required";

    if (releaseType !== "Single" && !PrimaryGenre.trim()) {
      return "Primary Genre is required for non-single releases";
    }

    const hasValidRole = RoleCredits.some(
      (role: { artistName: string; roleName: string }) =>
        role.artistName.trim() && role.roleName.trim()
    );

    if (!hasValidRole) return "At least one valid Role Credit is required";

    if (!trackUpload) return "Track file upload is required";

    if (!stepCompleted) {
      return "Please complete the step before uploading";
    }
    return true;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text
        style={[
          styles.heading,
          { marginBottom: releaseType === "Single" ? 16 : 6 },
        ]}
      >
        Track List
      </Text>
      {releaseType !== "Single" && (
        <Text style={styles.subHeading}>Add all track of album</Text>
      )}

      {fields.length === 0 ? (
        <Text style={styles.noTrackText}>No tracks added yet.</Text>
      ) : (
        fields.map((track, index) => (
          <View key={track.id} style={styles.trackItem}>
            <View style={styles.trackHeader}>
              <Text style={styles.trackIndex}>
                {String(index + 1).padStart(2, "0")}
              </Text>
              <View style={styles.trackInfo}>
                <Text style={styles.trackName}>
                  {limitText(getValues(`TrackList.${index}.TrackName`)) ||
                    limitText(getValues(`TrackList.${index}.file`)) ||
                    "Track Title"}
                </Text>
                <Text style={styles.trackArtist}>
                  {getValues(`TrackList.${index}.RoleCredits.[0].artistName`) ||
                    "Artist Name"}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingIndex(index);
                  }}
                  style={styles.editButton}
                >
                  <FontAwesome6 name="edit" size={20} color={Colors.primary} />
                </TouchableOpacity>
                {releaseType !== "Single" && (
                  <TouchableOpacity
                    onPress={() => handleDeleteTrack(index)}
                    style={styles.deleteButton}
                  >
                    <FontAwesome6
                      name="trash-alt"
                      size={20}
                      color={Colors.error}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Controller
              control={control}
              name={`TrackList.${index}.TrackUpload`}
              rules={{
                validate: (value) => {
                  const trackData = getValues(`TrackList.${index}`);
                  return validateTrackFields(trackData, value);
                },
              }}
              render={({ field, fieldState }) => (
                <View>
                  {getValues(`TrackList.${index}.file`) ? (
                    <TouchableOpacity
                      style={styles.replaceButton}
                      onPress={() => handlePickAudio(index, field.onChange)}
                    >
                      <Ionicons name="repeat" size={18} color="#6739B7" />
                      <Text style={styles.replaceText}>Replace Audio</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => handlePickAudio(index, field.onChange)}
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={18}
                        color="#6739B7"
                      />
                      <Text style={styles.uploadText}>Upload Audio</Text>
                    </TouchableOpacity>
                  )}
                  {fieldState.error && (
                    <Text style={styles.errorText}>
                      {fieldState.error.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>
        ))
      )}

      {uploading && (
        <View style={styles.uploadingBox}>
          <ActivityIndicator size="small" color="#6739B7" />
          <Text style={styles.progressText}>
            Uploading... {uploadProgress}%
          </Text>
        </View>
      )}

      {/* Add Track Button */}
      {releaseType !== "Single" && (
        <TouchableOpacity
          style={styles.addTrackButton}
          onPress={handleAddTrack}
        >
          <Ionicons name="add-circle-outline" size={20} color="#6739B7" />
          <Text style={styles.addTrackText}>Add Track</Text>
        </TouchableOpacity>
      )}

      {/* Track Edit Modal */}
      {editingIndex !== null && (
        <TrackEditModalExpo
          visible={true}
          trackIndex={editingIndex}
          onClose={(
            trackIndex,
            updatedTrack,
            currentStep,
            trackId,
            formData
          ) => {
            if (updatedTrack)
              update(trackIndex, {
                updatedTrack,
                ...formData,
                trackId,
                currentStep,
              });
            setEditingIndex(null);
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {},
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray,
    marginBottom: 12,
  },
  addTrackButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#EDE4FA",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  addTrackText: {
    marginLeft: 6,
    color: "#6739B7",
    fontWeight: "600",
  },
  noTrackText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
  trackItem: {
    backgroundColor: "#F8F8F8",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    justifyContent: "center",
  },
  trackHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackIndex: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6739B7",
    marginRight: 10,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontWeight: "600",
    color: "#222",
  },
  trackArtist: {
    fontSize: 12,
    color: "#777",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#6739B7",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    alignSelf: "center",
  },
  uploadText: {
    color: "#6739B7",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
  },
  replaceButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    alignSelf: "center",
  },
  replaceText: {
    color: "#6739B7",
    marginLeft: 6,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {},
  uploadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  progressText: {
    marginLeft: 8,
    color: "#6739B7",
  },
  errorText: {
    color: "#E53935",
    marginTop: 8,
    fontSize: 13,
    textAlign: "center",
  },
});

export default TrackList;
