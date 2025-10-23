import { DraftData } from "@/api/type";
import { create } from "zustand";

interface DraftStore {
  draftId: number | null;
  draftData: DraftData | null;
  error: string | null;
  setDraftId: (id: number | null) => void;
  setDraftData: (data: DraftData | null) => void;
  setError: (error: string | null) => void;
  clearDraft: () => void;
}

export const useDraftStore = create<DraftStore>((set) => ({
  draftId: null,
  draftData: null,
  error: null,
  setDraftId: (id) => set({ draftId: id }),
  setDraftData: (data) => set({ draftData: data }),
  setError: (error) => set({ error }),
  clearDraft: () => set({ draftId: null, draftData: null, error: null }),
}));