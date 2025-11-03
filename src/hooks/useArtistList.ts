import { Artist } from "@/api/artistApi";
import { useArtistStore } from "@/stores/artistListStore";
import { useLoadingStore } from "@/stores/loadingStore";
import { useEffect } from "react";

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
  const { loading, uploadProgress } = useLoadingStore();

  useEffect(() => {
    if (artistId && artistId !== "") {
      fetchArtistById(Number(artistId));
    }
  }, [fetchArtistById, artistId]);

  return { artist, loading, error, uploadProgress };
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
