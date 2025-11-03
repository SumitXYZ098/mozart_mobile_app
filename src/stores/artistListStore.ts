/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import {
  createArtist,
  getAllArtists,
  getArtistById,
  getArtistList,
  updateArtistById,
  type Artist,
  type ArtistTransformed,
  type AllArtistTransformed,
} from "@/api/artistApi";
import { useLoadingStore } from "./loadingStore";

interface ArtistState {
  artists: ArtistTransformed[];
  allArtists: AllArtistTransformed[];
  artist: Artist | null;
  error: string | null;
  refetchTrigger: number;
  loading: boolean;

  fetchArtists: (search?: string) => Promise<void>;
  fetchArtistById: (artistId: number) => Promise<void>;
  fetchAllArtists: (search?: string) => Promise<void>;
  createArtist: (payload: Partial<Artist>) => Promise<Artist | null>;
  updateArtist: (
    artistId: number,
    payload: Partial<Artist>
  ) => Promise<Artist | null>;
}

export const useArtistStore = create<ArtistState>((set) => ({
  artists: [],
  allArtists: [],
  artist: null,
  error: null,
  refetchTrigger: 0,
  loading: false,

  fetchArtists: async (search: string = "") => {
    set({ loading: true, error: null });
    try {
      const results = await getArtistList(search);
      set({ artists: results, error: null, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch artists",
        loading: false,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchArtistById: async (artistId: number) => {
    const { setLoading, setUploadProgress } = useLoadingStore.getState();
    setLoading(true);

    try {
      const response = await getArtistById(artistId, (progress) =>
        setUploadProgress(progress)
      );
      set({ artist: response, error: null });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch artist" });
    } finally {
      setLoading(false);
    }
  },

  fetchAllArtists: async (search: string = "") => {
    set({ loading: true, error: null });
    try {
      const results = await getAllArtists(search);
      set({ allArtists: results, error: null, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch all artists",
        loading: false,
      });
    } finally {
      set({ loading: false });
    }
  },

  createArtist: async (payload: Partial<Artist>) => {
    const { setLoading, setUploadProgress } = useLoadingStore.getState();
    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await createArtist(payload, (progress) =>
        setUploadProgress(progress)
      );
      set((state) => ({
        artists: [...state.artists, response],
        refetchTrigger: state.refetchTrigger + 1,
      }));
      return response;
    } catch (error: any) {
      set({ error: error.message || "Failed to create artist" });
      return null;
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  },

  updateArtist: async (artistId: number, payload: Partial<Artist>) => {
    const { setLoading, setUploadProgress } = useLoadingStore.getState();
    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await updateArtistById(artistId, payload, (progress) =>
        setUploadProgress(progress)
      );
      set((state) => ({
        artists: state.artists.map((artist) =>
          artist.id === artistId ? { ...artist, ...response } : artist
        ),
        artist: response,
        refetchTrigger: state.refetchTrigger + 1,
      }));
      return response;
    } catch (error: any) {
      set({ error: error.message || "Failed to update artist" });
      return null;
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  },
}));
