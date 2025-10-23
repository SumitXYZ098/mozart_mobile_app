/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import { useAuthStore } from "@/stores/useAuthStore";

// Step 1
export const draftStep1 = async (
  payload: Partial<any>,
  onProgress?: (progress: number) => void
): Promise<{ data: { id: number } }> => {
  const { user } = useAuthStore.getState();
  const response = await axios.post(ENDPOINTS.DRAFTS_STEP1, payload, {
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

// Step 2
export const draftStep2 = async (
  draftId: number,
  payload: Partial<any>,
  onProgress?: (progress: number) => void
): Promise<{ data: any }> => {
  const { user } = useAuthStore.getState();
  const response = await axios.post(ENDPOINTS.DRAFTS_STEP2(draftId), payload, {
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

// Step 3
export const draftStep3 = async (
  draftId: number,
  payload: Partial<any>,
  onProgress?: (progress: number) => void
): Promise<{ data: any }> => {
  const { user } = useAuthStore.getState();
  const response = await axios.post(ENDPOINTS.DRAFTS_STEP3(draftId), payload, {
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

// Step 4
export const draftStep4 = async (
  draftId: number,
  payload: Partial<any>,
  onProgress?: (progress: number) => void
): Promise<{ data: any }> => {
  const { user } = useAuthStore.getState();
  const response = await axios.post(ENDPOINTS.DRAFTS_STEP4(draftId), payload, {
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

// Finish Step
export const draftFinish = async (
  draftId: number,
  payload: Partial<any>,
  onProgress?: (progress: number) => void
): Promise<{ data: any }> => {
  const { user } = useAuthStore.getState();
  const response = await axios.post(ENDPOINTS.DRAFTS_FINISH(draftId), payload, {
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

// Update Draft
export const updateDraft = async (
  releaseId: number,
  payload: Partial<any>,
  onProgress?: (progress: number) => void
): Promise<any> => {
  const { user } = useAuthStore.getState();
  const response = await axios.put(
    ENDPOINTS.UPDATE_DRAFTS(releaseId),
    { data: payload },
    {
      headers: { Authorization: `Bearer ${user?.token}` },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        if (onProgress) onProgress(percentCompleted);
      },
    }
  );
  return response.data.data;
};

// Delete Draft
export const deleteDraft = async (releaseId: number): Promise<void> => {
  const { user } = useAuthStore.getState();
  await axios.delete(ENDPOINTS.DELETE_DRAFTS(releaseId), {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
};

// Move Draft to Publish
export const publishDraft = async (draftId: number): Promise<any> => {
  const { user } = useAuthStore.getState();
  const response = await axios.post(
    ENDPOINTS.DRAFT_TO_PUBLISH(draftId),
    {},
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }
  );

  return response.data;
};

// User Draft release list
export const getUserDrafts = async () => {
  const { user } = useAuthStore.getState();
  if (user?.id) {
    const response = await axios.get(ENDPOINTS.USER_DRAFTS_STARTED(user?.id), {
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    return response.data;
  }
};

// Get Draft by Id
export const getDraftById = async (draftId: number): Promise<any> => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.DRAFT_BY_ID(draftId), {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });
  return response.data;
};
