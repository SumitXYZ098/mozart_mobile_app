import { DraftData } from "@/api/type";
import { create } from "zustand";
import { getUserDrafts } from "@/api/draftApi"; // assuming you export this from your API file

interface DraftStore {
  draftId: number | null;
  draftData: DraftData | null;
  userDrafts: DraftData[]; // new
  loading: boolean; // new
  error: string | null;
  setDraftId: (id: number | null) => void;
  setDraftData: (data: DraftData | null) => void;
  setUserDrafts: (drafts: DraftData[]) => void; // new
  fetchUserDrafts: () => Promise<void>; // new
  setError: (error: string | null) => void;
  clearDraft: () => void;
}

export const useDraftStore = create<DraftStore>((set) => ({
  draftId: null,
  draftData: null,
  userDrafts: [],
  loading: false,
  error: null,

  setDraftId: (id) => set({ draftId: id }),
  setDraftData: (data) => set({ draftData: data }),
  setUserDrafts: (drafts) => set({ userDrafts: drafts }),
  setError: (error) => set({ error }),

  fetchUserDrafts: async () => {
    try {
      set({ loading: true, error: null });
      const drafts = await getUserDrafts();
      set({ userDrafts: drafts, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch drafts", loading: false });
    }
  },

  clearDraft: () =>
    set({
      draftId: null,
      draftData: null,
      userDrafts: [],
      error: null,
      loading: false,
    }),
}));
