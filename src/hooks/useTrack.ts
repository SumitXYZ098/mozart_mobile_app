/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteTrack,
  getTrackById,
  getTrackList,
  postNewTrack,
  updateTrackById,
  type IPagination,
  type ITrack,
  type ITrackAttributes,
  type ITrackPayload,
} from "@/api/trackApi";
import React from "react";
import { useTrackStore } from "@/stores/trackStore";
import { useDraftStore } from "@/stores/draftStore";

export function useTrackList(releaseId: number) {
  const { setTracks, setError } = useTrackStore();

  const query = useQuery<{ tracks: ITrack[]; pagination: IPagination }, Error>({
    queryKey: ["tracks", releaseId],
    queryFn: () => getTrackList(releaseId),
  });

  React.useEffect(() => {
    if (query.data) {
      setTracks(query.data.tracks, query.data.pagination);
    }
    if (query.error) {
      setError(query.error.message || "Failed to fetch tracks");
    }
  }, [query.data, query.error, setTracks, setError]);

  return query;
}

export function useTrack(trackId: number) {
  return useQuery<ITrack, Error>({
    queryKey: ["track", trackId],
    queryFn: () => getTrackById(trackId),
  });
}

export function useCreateTrack() {
  const { addTrack, setError } = useTrackStore();
  const queryClient = useQueryClient();
  const { draftId } = useDraftStore();
  return useMutation({
    mutationFn: (payload: Partial<ITrackPayload>) => {
      return postNewTrack(payload, draftId);
    },
    onSuccess: (data) => {
      addTrack(data);
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
    },
    onError: (error: any) =>
      setError(error.message || "Failed to create track"),
  });
}

export function useUpdateTrack() {
  const { updateTrack, setError } = useTrackStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      trackId,
      payload,
    }: {
      trackId: number;
      payload: Partial<ITrackAttributes>;
    }) => updateTrackById(trackId, payload),
    onSuccess: (data) => {
      updateTrack(data);
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
    },
    onError: (error: any) =>
      setError(error.message || "Failed to update track"),
  });
}

export function useDeleteTrack() {
  const { removeTrack, setError } = useTrackStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackId: number) => deleteTrack(trackId),
    onSuccess: (_, trackId) => {
      removeTrack(trackId);
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
    },
    onError: (error: any) =>
      setError(error.message || "Failed to delete track"),
  });
}
