import { create } from "zustand";

interface LoadingState {
  loading: boolean;
  setLoading: (val: boolean) => void;
  uploadProgress: number;
  setUploadProgress: (val: number) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  loading: false,
  setLoading: (val) => set({ loading: val }),
  uploadProgress: 0,
  setUploadProgress: (val) => set({ uploadProgress: val }),
}));
