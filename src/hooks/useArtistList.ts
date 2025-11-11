import { Artist } from "@/api/artistApi";
import { useArtistStore } from "@/stores/artistListStore";
import { useLoadingStore } from "@/stores/loadingStore";
import { useCallback, useEffect } from "react";

export const useArtistList = (search: string = "") => {
  const { artists, error, fetchArtists, refetchTrigger, loading } =
    useArtistStore();

  useEffect(() => {
    fetchArtists(search);
  }, [fetchArtists, refetchTrigger, search]);

  return { artists, loading, error, fetchArtists };
};

export const useArtistListById = (artistId: string) => {
  const { artist, error, fetchArtistById } = useArtistStore();
  const { loading, setLoading, uploadProgress, setUploadProgress } =
    useLoadingStore();

  const refetch = useCallback(async () => {
    if (!artistId) return;
    try {
      setLoading(true);
      setUploadProgress(0);
      await fetchArtistById(Number(artistId));
    } catch (err) {
      console.error("❌ Error fetching artist by ID:", err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }, [artistId, fetchArtistById, setLoading, setUploadProgress]);

  // Automatically fetch on mount or artistId change
  useEffect(() => {
    if (artistId && artistId !== "") {
      refetch();
    }
  }, [artistId, refetch]);

  return { artist, loading, error, uploadProgress, refetch };
};
export const useCreateArtist = () => {
  const { createArtist, error } = useArtistStore();
  const { loading, uploadProgress } = useLoadingStore();

  const handleCreate = async (payload: Partial<Artist>) => {
    return await createArtist(payload);
  };

  return { createArtist: handleCreate, loading, error, uploadProgress };
};

export const useUpdateArtist = () => {
  const { updateArtist, error } = useArtistStore();
  const { loading, uploadProgress } = useLoadingStore();

  const handleUpdate = async (artistId: number, payload: Partial<Artist>) => {
    return await updateArtist(artistId, payload);
  };

  return { updateArtist: handleUpdate, loading, error, uploadProgress };
};

export const useAllArtistsList = (search: string = "") => {
  const { allArtists, error, fetchAllArtists, refetchTrigger, loading } =
    useArtistStore();

  useEffect(() => {
    fetchAllArtists(search);
  }, [refetchTrigger, fetchAllArtists, search]);

  return { allArtists, loading, error, fetchAllArtists };
};
