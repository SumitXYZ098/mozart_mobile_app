// TrackList.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Animated,
  Easing,
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
      console.log("Prefilling TrackList with draft data:", draftFormData.data.TrackList);

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

  // ✅ Auto-fill TrackList RoleCredits with ReleaseCredits from step 1
  const releaseCredits = watch("ReleaseCredits");

  useEffect(() => {
    if (!releaseCredits || !releaseCredits.length) return;

    // Only sync if there is actually some artist name filled in step 1
    const hasReleaseArtist = releaseCredits.some(
      (rc: any) => rc.artistName && rc.artistName.trim()
    );
    if (!hasReleaseArtist) return;

    const currentTracks = getValues("TrackList") || [];
    let updated = false;

    const newTracks = currentTracks.map((track: any) => {
      const roles = track.RoleCredits || [];
      const hasAnyArtistFilled = roles.some(
        (rc: any) => rc.artistName && rc.artistName.trim()
      );

      if (!hasAnyArtistFilled) {
        const newRoleCredits = releaseCredits.map((rc: any) => ({
          artistName: rc.artistName || "",
          roleName: rc.roleName || "",
        }));
        updated = true;
        return {
          ...track,
          RoleCredits: newRoleCredits,
        };
      }
      return track;
    });

    if (updated) {
      setValue("TrackList", newTracks);
    }
  }, [releaseCredits, setValue, getValues]);

  // ✅ Validate that selected file is correct format and size
  // ✅ Validate that selected file is correct format and size
  const validateAudioFile = (file: {
    name: string;
    mimeType?: string;
    size?: number;
  }) => {
    const fileName = file.name.toLowerCase();
    const isWavOrFlac = fileName.endsWith(".wav") || fileName.endsWith(".flac");
    const maxSize = 100 * 1024 * 1024; // 100 MB

    // 1️⃣ Check file type / extension
    if (!isWavOrFlac) {
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
    let uploadSuccess = false;
    try {
      // 1️⃣ Pick audio file using DocumentPicker
      const res = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === "android" ? ["audio/*"] : ["audio/wav", "audio/flac"],
        copyToCacheDirectory: true,
      });

      if (res.canceled) return;

      const file = res.assets?.[0];
      if (!file) return;

      // 2️⃣ Validate file type and size
      if (!validateAudioFile(file)) {
        return;
      }

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
      setUploadProgress(1);

      // Simulated progress: smoothly goes 1% → 95% while upload runs
      let simProgress = 1;
      const progressTimer = setInterval(() => {
        if (simProgress < 30) {
          simProgress += Math.floor(Math.random() * 5) + 3;
        } else if (simProgress < 70) {
          simProgress += Math.floor(Math.random() * 3) + 1;
        } else if (simProgress < 95) {
          simProgress += 1;
        }
        if (simProgress > 95) simProgress = 95;
        setUploadProgress(simProgress);
      }, 200);

      let uploaded;
      try {
        uploaded = await uploadFile(fileToUpload, (realProgress) => {
          // Use real progress if it's ahead of the simulation
          if (realProgress > simProgress) {
            simProgress = realProgress;
            setUploadProgress(realProgress);
          }
        });
      } finally {
        clearInterval(progressTimer);
      }
      setUploadProgress(100);

      const fileId = uploaded?.id || null;

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
      uploadSuccess = true;
    } catch (error: any) {
      console.error("Audio upload failed:", error);
      Alert.alert("Error", error?.message || "Failed to upload audio file.");
      onChange(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (uploadSuccess) {
        setTimeout(() => {
          setEditingIndex(index);
        }, 150);
      }
    }
  };

  const handleAddTrack = () => {
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

    // if (!stepCompleted) {
    //   return "Please complete the step before uploading";
    // }
    return true;
  };

  return (
    <View style={styles.container}>
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
                  disabled={!getValues(`TrackList.${index}.file`)}
                >
                  <FontAwesome6
                    name="edit"
                    size={20}
                    color={
                      !getValues(`TrackList.${index}.file`)
                        ? Colors.gray
                        : Colors.primary
                    }
                  />
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
                      <Ionicons
                        name="repeat"
                        size={18}
                        color={uploading ? Colors.gray : Colors.primary}
                      />
                      <Text
                        style={[
                          styles.replaceText,
                          { color: uploading ? Colors.gray : Colors.primary },
                        ]}
                      >
                        Replace Audio
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.uploadButton,
                        {
                          borderColor: uploading ? Colors.gray : Colors.primary,
                        },
                      ]}
                      onPress={() => handlePickAudio(index, field.onChange)}
                      disabled={uploading}
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={18}
                        color={uploading ? Colors.gray : Colors.primary}
                      />
                      <Text
                        style={[
                          styles.uploadText,
                          { color: uploading ? Colors.gray : Colors.primary },
                        ]}
                      >
                        Upload Audio
                      </Text>
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
        <MusicalLoader progress={uploadProgress} />
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
            stepCompleted,
            currentStep,
            trackId,
            formData
          ) => {
            if (stepCompleted)
              update(trackIndex, {
                ...formData,
                stepCompleted,
                trackId,
                currentStep,
              });
            setEditingIndex(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 40 },
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
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    alignSelf: "center",
  },
  uploadText: {
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

const MusicalLoader = ({ progress }: { progress: number }) => {
  const scale1 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.6)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animateRipple = (scale: Animated.Value, opacity: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 2.5,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    animateRipple(scale1, opacity1, 0);
    animateRipple(scale2, opacity2, 1000);

    return () => {
      scale1.stopAnimation();
      opacity1.stopAnimation();
      scale2.stopAnimation();
      opacity2.stopAnimation();
    };
  }, [scale1, opacity1, scale2, opacity2]);

  const title = progress > 0 ? "Uploading your music..." : "Processing request...";

  return (
    <View style={loaderStyles.container}>
      <View style={loaderStyles.rippleContainer}>
        {/* Ripple 1 */}
        <Animated.View
          style={[
            loaderStyles.ripple,
            {
              transform: [{ scale: scale1 }],
              opacity: opacity1,
            },
          ]}
        />
        {/* Ripple 2 */}
        <Animated.View
          style={[
            loaderStyles.ripple,
            {
              transform: [{ scale: scale2 }],
              opacity: opacity2,
            },
          ]}
        />
        {/* Center Music Badge */}
        <View style={loaderStyles.centerBadge}>
          <Ionicons name="musical-notes" size={22} color="#FFFFFF" />
        </View>
      </View>

      <Text style={loaderStyles.title}>{title}</Text>
      {progress > 0 && <Text style={loaderStyles.progressText}>{progress}%</Text>}

      {/* Progress Bar */}
      {progress > 0 && (
        <View style={loaderStyles.progressTrack}>
          <View style={[loaderStyles.progressBar, { width: `${progress}%` }]} />
        </View>
      )}
    </View>
  );
};

const loaderStyles = StyleSheet.create({
  container: {
    backgroundColor: "#F9F6FC",
    borderWidth: 1,
    borderColor: "#EADCF7",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginVertical: 15,
    // Soft shadow
    shadowColor: "#6739B7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  rippleContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 16,
  },
  ripple: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(103, 57, 183, 0.2)",
  },
  centerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#6739B7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A4A4A",
    fontFamily: "Poppins_500Medium",
    marginBottom: 4,
  },
  progressText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6739B7",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  progressTrack: {
    width: "85%",
    height: 6,
    backgroundColor: "#EEE8FF",
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6739B7",
    borderRadius: 3,
  },
});

export default TrackList;
