import { ILabel } from "@/api/labelApi";
import { create } from "zustand";


interface LabelsStore {
  labels: ILabel[];
  loading: boolean;
  error: string | null;
  setLabels: (labels: ILabel[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLabelsStore = create<LabelsStore>((set) => ({
  labels: [],
  loading: false,
  error: null,
  setLabels: (labels) => set({ labels }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
