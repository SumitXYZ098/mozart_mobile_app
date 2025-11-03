import { IPagination, ITrack } from "@/api/trackApi";
import { create } from "zustand";

interface TrackStore {
  tracks: ITrack[]; // use transformed type
  pagination: IPagination | null;
  loading: boolean;
  error: string | null;
  setTracks: (tracks: ITrack[], pagination: IPagination) => void;
  addTrack: (track: ITrack) => void;
  updateTrack: (track: ITrack) => void;
  removeTrack: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTrackStore = create<TrackStore>((set) => ({
  tracks: [],
  pagination: null,
  loading: false,
  error: null,
  setTracks: (tracks, pagination) => set({ tracks, pagination }),
  addTrack: (track) => set((state) => ({ tracks: [...state.tracks, track] })),
  updateTrack: (track) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === track.id ? track : t)),
    })),
  removeTrack: (id) =>
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
