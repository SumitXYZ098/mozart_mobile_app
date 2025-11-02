import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import { useAuthStore } from "@/stores/useAuthStore";
import { Platform } from "react-native";


/**
 * Upload file to Strapi with progress tracking
 * Supports Android, iOS, and Web
 */
export const uploadFile = async (
  file: { uri: string; name: string; type: string },
  onProgress: (progress: number) => void
) => {
  const { user } = useAuthStore.getState();
  const formData = new FormData();

  let fileToUpload: any;

  if (Platform.OS === "web" && file.uri.startsWith("data:")) {
    const res = await fetch(file.uri);
    const blob = await res.blob();
    fileToUpload = new File([blob], file.name, { type: file.type });
  } else {
    fileToUpload = {
      uri: file.uri,
      name: file.name,
      type: file.type,
    };
  }

  formData.append("files", fileToUpload);

  const response = await axios.post(ENDPOINTS.UPLOAD_FILES, formData, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      onProgress(percentCompleted);
    },
  });

  return response.data;
};


// Get files by Id
export const getUploadFileById = async (
  fileId: number,
  onProgress?: (progress: number) => void
) => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.UPLOAD_FILES_BY_ID(fileId), {
    headers: { Authorization: `Bearer ${user?.token}` },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      if (onProgress) onProgress(percentCompleted);
    },
  });
  return response.data;
};

// Delete files by Id
export const deleteUploadFileById = async (
  fileId: number,
  onProgress: (progress: number) => void
) => {
  const { user } = useAuthStore.getState();
  const response = await axios.delete(ENDPOINTS.UPLOAD_FILES_BY_ID(fileId), {
    headers: { Authorization: `Bearer ${user?.token}` },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      onProgress(percentCompleted);
    },
  });
  return response.data;
};
