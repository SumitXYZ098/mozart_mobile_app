/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDraftStore } from "@/stores/draftStore";
import { DraftData } from "@/api/type";
import {
  deleteDraft,
  draftFinish,
  draftStep1,
  draftStep2,
  draftStep3,
  draftStep4,
  getDraftById,
  getUserDrafts,
  publishDraft,
  updateDraft,
} from "@/api/draftApi";

const isNotFoundError = (err: any) => {
  if (!err) return false;
  const status = err.response?.status ?? err.status ?? err.response?.data?.error?.status;
  if (status === 404) return true;
  const msg = err.message ?? err.response?.data?.error?.message;
  if (typeof msg === "string") {
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("404") || lowerMsg.includes("not found")) {
      return true;
    }
  }
  return false;
};

export function useDraftFlow() {
  const { draftId, setDraftId, setError, clearDraft } = useDraftStore();
  const queryClient = useQueryClient();

  const step1Mutation = useMutation({
    mutationFn: (payload: Partial<DraftData>) => {
      return draftStep1(payload);
    },
    onSuccess: (data: { data: { id: number } }) => {
      setDraftId(data.data.id);
    },
    onError: (error: any) => setError(error.message || "Step 1 failed"),
  });

  const step2Mutation = useMutation({
    mutationFn: (payload: Partial<DraftData>) => {
      if (!draftId) throw new Error("Draft ID is missing");
      return draftStep2(draftId, payload);
    },
    onError: (error: any) => setError(error.message || "Step 2 failed"),
  });

  const step3Mutation = useMutation({
    mutationFn: (payload: Partial<DraftData>) => {
      if (!draftId) throw new Error("Draft ID is missing");
      return draftStep3(draftId, payload);
    },
    onError: (error: any) => setError(error.message || "Step 3 failed"),
  });

  const step4Mutation = useMutation({
    mutationFn: (payload: Partial<DraftData>) => {
      if (!draftId) throw new Error("Draft ID is missing");
      return draftStep4(draftId, payload);
    },
    onError: (error: any) => setError(error.message || "Step 4 failed"),
  });

  const finishMutation = useMutation({
    mutationFn: (payload: Partial<DraftData>) => {
      if (!draftId) throw new Error("Draft ID is missing");
      return draftFinish(draftId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDrafts"] });
      queryClient.invalidateQueries({ queryKey: ["draft", draftId] });
    },
    onError: (error: any) => setError(error.message || "Finish step failed"),
  });

  // ✅ Update Draft with proper ReleaseCredits format for Strapi
  const updateDraftMutation = useMutation({
    mutationFn: (payload: Partial<DraftData>) => {
      if (!draftId) throw new Error("Draft ID is missing");
      // Ensure ReleaseCredits are sent in Strapi's nested format
      if (payload.ReleaseCredits && Array.isArray(payload.ReleaseCredits)) {
        payload = {
          ...payload,
          ReleaseCredits: { data: payload.ReleaseCredits  },
        } as any;
      }
      return updateDraft(draftId, payload);
    },
    onSuccess: (data: any) => {
      console.log("Draft updated successfully", JSON.stringify(data, null, 2));
      queryClient.invalidateQueries({ queryKey: ["userDrafts"] });
      queryClient.invalidateQueries({ queryKey: ["draft", draftId] });
    },
    onError: (error: any) => setError(error.message || "Failed to update draft"),
  });

  const deleteDraftMutation = useMutation({
    mutationFn: async () => {
      if (!draftId) throw new Error("Draft ID is missing");
      try {
        await deleteDraft(draftId);
      } catch (error: any) {
        if (isNotFoundError(error)) {
          console.log("Draft already deleted on server (404), proceeding.");
          return;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDrafts"] });
      // console.log("Draft deleted successfully");
      clearDraft();
    },
    onError: (error: any) =>
      setError(error.message || "Failed to delete draft"),
  });

  return {
    step1Mutation,
    step2Mutation,
    step3Mutation,
    step4Mutation,
    finishMutation,
    updateDraftMutation,
    deleteDraftMutation,
    draftId,
    clearDraft,
  };
}

export function usePublishDraft() {
  const { draftId, setError } = useDraftStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!draftId) throw new Error("Draft ID is missing");
      return publishDraft(draftId);
    },
    onSuccess: (data: any) => {
      console.log("Draft published successfully", JSON.stringify(data, null, 2));
      queryClient.invalidateQueries({ queryKey: ["userDrafts"] });
    },
    onError: (error: any) => {
      console.error("Publish draft failed", error);
      setError(error.message || "Failed to publish draft");
    },
  });
}

export function useUserDrafts() {
  const { setUserDrafts } = useDraftStore();

  return useQuery<DraftData[], Error>({
    queryKey: ["userDrafts"],
    queryFn: async () => {
      const data = await getUserDrafts();
      setUserDrafts(data);
      return data;
    },
  });
}

export function useGetDraftById() {
  const { draftId } = useDraftStore();

  return useQuery<DraftData, Error>({
    queryKey: ["draft", draftId],
    queryFn: async () => {
      if (!draftId) throw new Error("Draft ID is missing");
      return await getDraftById(draftId);
    },
    enabled: !!draftId,
  });
}
