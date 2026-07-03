import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/colors";
import { useAuthStore } from "@/stores/useAuthStore";
import { Controller, useForm } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import {
  uploadFile,
  deleteUploadFileById,
  getUploadFileById,
} from "@/api/uploadApi";
import { createIssue } from "@/api/issuesRaised";
import { useTicketStore } from "@/stores/ticketStore";

interface FormValues {
  title: string;
  category: string;
  description: string;
  status: string;
  user: number;
  attachment?: number | null;
}

const CATEGORIES = [
  { id: "technical_issue", label: "Technical Issue", icon: "construct-outline" },
  { id: "content_management", label: "Content Management", icon: "albums-outline" },
  { id: "arrange_meeting_call", label: "Arrange Meeting Call", icon: "call-outline" },
  { id: "quality_control_process", label: "Quality Control Process", icon: "shield-checkmark-outline" },
  { id: "copyright_claims", label: "Copyright Claims", icon: "alert-circle-outline" },
  { id: "invoices_payments", label: "Invoices & Payments", icon: "cash-outline" },
  { id: "terminate_my_contract", label: "Terminate My Contract", icon: "close-circle-outline" },
  { id: "general_question", label: "General Question", icon: "help-circle-outline" },
  { id: "other", label: "Other", icon: "ellipsis-horizontal-outline" },
];

export default function RaiseTicketScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { fetchTickets } = useTicketStore();

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {
      title: "",
      category: "quality_control_process",
      description: "",
      status: "open",
      user: Number(user?.id),
      attachment: null,
    },
  });

  // ✅ Image picker
  const handlePickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission Required", "Please allow access to your photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;

      const selected = result.assets[0];
      let file: any;
      if (Platform.OS === "web" && selected.file) {
        file = selected.file;
      } else {
        const localUri = selected.uri;
        const filename = selected.fileName || localUri.split("/").pop() || "cover-art.jpg";
        const type = selected.mimeType || "image/jpeg";
        file = { uri: localUri, name: filename, type };
      }

      setUploading(true);
      setUploadProgress(0);

      // Smooth progress simulation
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        if (progressValue < 90) {
          progressValue += Math.floor(Math.random() * 8) + 4;
          if (progressValue > 90) progressValue = 90;
          setUploadProgress(progressValue);
        }
      }, 70);

      try {
        const uploaded = await uploadFile(file, () => {});
        clearInterval(progressInterval);
        
        let remaining = progressValue;
        const finalizeInterval = setInterval(() => {
          if (remaining < 100) {
            remaining += 2;
            if (remaining >= 100) {
              remaining = 100;
              clearInterval(finalizeInterval);
              setTimeout(async () => {
                const imageId = uploaded?.[0]?.id;
                if (imageId) {
                  setValue("attachment", imageId, { shouldValidate: true });
                  const fileInfo = await getUploadFileById(imageId);
                  setSelectedImage(fileInfo?.formats?.thumbnail?.url || fileInfo?.url);
                  Alert.alert("✅ Success", "Attachment uploaded successfully.");
                }
                setUploading(false);
              }, 100);
            }
            setUploadProgress(remaining);
          }
        }, 10);
      } catch (err: any) {
        clearInterval(progressInterval);
        setUploading(false);
        throw err;
      }
    } catch (err: any) {
      console.error("❌ Upload failed:", err);
      Alert.alert("Upload Error", err?.message || "Failed to upload image.");
    }
  };

  // ✅ Clear image
  const handleClear = async () => {
    const attachment = watch("attachment");
    if (!attachment) return;
    setUploading(true);
    try {
      await deleteUploadFileById(attachment, (progress: number) =>
        setUploadProgress(progress)
      );
      setValue("attachment", null, { shouldValidate: true });
      setSelectedImage(null);
      Alert.alert("Removed", "Attachment deleted successfully.");
    } catch (err) {
      console.error("Failed to delete file:", err);
      Alert.alert("Error", "Failed to remove cover art.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      await createIssue(data, (progress) => setUploadProgress(progress));
      reset();
      setSelectedImage(null);
      Alert.alert("✅ Success", "Ticket submitted successfully.");
      fetchTickets();
      navigation.goBack();
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert("Error", "Ticket submission failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raise Ticket</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Write a descriptive title</Text>
            <Controller
              name="title"
              control={control}
              rules={{
                required: "Title is required",
                minLength: {
                  value: 4,
                  message: "Title must be at least 4 characters",
                },
              }}
              render={({ field, fieldState }) => (
                <>
                  <TextInput
                    placeholder="Subject title..."
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholderTextColor={Colors.gray}
                    style={[
                      styles.input,
                      { borderColor: fieldState.error ? "#EF4444" : "#E5E7EB" },
                    ]}
                  />
                  {fieldState.error && (
                    <Text style={styles.errorText}>{fieldState.error.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          {/* Category Selector Cards */}
          <View style={styles.section}>
            <Text style={styles.label}>Choose category</Text>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <View style={styles.categoryContainer}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = field.value === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        activeOpacity={0.7}
                        onPress={() => field.onChange(cat.id)}
                        style={[
                          styles.catPill,
                          isSelected ? styles.catPillActive : styles.catPillInactive,
                        ]}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={18}
                          color={isSelected ? Colors.white : Colors.primary}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.catLabel,
                            isSelected ? styles.catLabelActive : styles.catLabelInactive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Explain the problem</Text>
            <Controller
              name="description"
              control={control}
              rules={{
                required: "Description is required",
                minLength: {
                  value: 4,
                  message: "Description must be at least 4 characters",
                },
              }}
              render={({ field, fieldState }) => (
                <>
                  <TextInput
                    placeholder="Describe your issue with as much detail as possible..."
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholderTextColor={Colors.gray}
                    multiline
                    style={[
                      styles.input,
                      styles.textArea,
                      { borderColor: fieldState.error ? "#EF4444" : "#E5E7EB" },
                    ]}
                  />
                  {fieldState.error && (
                    <Text style={styles.errorText}>{fieldState.error.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          {/* Attachment */}
          <View style={styles.section}>
            <Text style={styles.label}>Upload Attachment (Optional)</Text>
            <Controller
              control={control}
              name="attachment"
              render={() => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePickImage}
                  style={[
                    styles.uploadBox,
                    selectedImage ? styles.activeBorder : styles.inactiveBorder,
                  ]}
                  disabled={uploading}
                >
                  <View style={styles.inner}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={24}
                      color={Colors.primary}
                    />
                    <Text style={styles.text}>
                      Tap to <Text style={styles.highlight}>Browse</Text> or choose a file
                    </Text>

                    {uploading ? (
                      <View style={styles.uploading}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.progressText}>
                          Uploading... {uploadProgress}%
                        </Text>
                      </View>
                    ) : selectedImage ? (
                      <>
                        <Image
                          source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${selectedImage}` }}
                          style={styles.preview}
                          resizeMode="cover"
                        />
                        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                          <Text style={styles.clearText}>Clear Cover Art</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text style={styles.subText}>
                        Supported formats: JPEG, PNG, TIFF (Max. 6MB)
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit(onSubmit, (errors) => console.log("Validation Errors:", errors))}
            activeOpacity={0.8}
            disabled={uploading}
          >
            <Text style={styles.submitBtnText}>Submit Support Ticket</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
  section: {
    gap: 6,
  },
  label: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 140,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  catPillInactive: {
    borderColor: "#E5E7EB",
    backgroundColor: Colors.white,
  },
  catPillActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  catLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  catLabelInactive: {
    color: "#4B5563",
  },
  catLabelActive: {
    color: Colors.white,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  inactiveBorder: {
    borderColor: "#E5E7EB",
  },
  activeBorder: {
    borderColor: Colors.primary,
  },
  inner: {
    alignItems: "center",
    width: "100%",
  },
  text: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 8,
    marginBottom: 4,
  },
  highlight: {
    color: Colors.primary,
    fontWeight: "600",
  },
  subText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginTop: 12,
  },
  clearButton: {
    marginTop: 8,
    padding: 6,
  },
  clearText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
  },
  progressText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
    color: Colors.primary,
  },
  uploading: {
    alignItems: "center",
    marginTop: 10,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
