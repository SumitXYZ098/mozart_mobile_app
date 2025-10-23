import { useCalendarStore, usePublishTrackStore } from "@/stores/publishTrackStore";
import { useEffect } from "react";

export const useUserPublishTracks = () => {
  const { tracks, loading, error, fetchUserPublishTracks } =
    usePublishTrackStore();

  useEffect(() => {
    fetchUserPublishTracks();
  }, [fetchUserPublishTracks]);

  return { tracks, loading, error };
};

export const useTrackListByPublishedId = (pubId: number) => {
  const { trackList, loading, error, fetchTrackListByPublishedId } =
    usePublishTrackStore();

  useEffect(() => {
    if (pubId) {
      fetchTrackListByPublishedId(pubId);
    }
  }, [pubId, fetchTrackListByPublishedId]);

  return { trackList, loading, error };
};

export const usePublishTrackById = (pubId: number) => {
  const { currentTrack, loading, error, fetchPublishTrackById } =
    usePublishTrackStore();

  useEffect(() => {
    if (pubId) {
      fetchPublishTrackById(pubId);
    }
  }, [pubId, fetchPublishTrackById]);

  return { currentTrack, loading, error };
};

export const useCalendarEvents = () => {
  const { events, loading, error, fetchCalendarEvents } = useCalendarStore();

  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  return { events, loading, error };
};

export const usePublishReleases = (
  search: string = "",
  priority: string = ""
) => {
  const {
    releases,
    loading,
    error,
    fetchPublishReleases,
    updatePublishRelease,
  } = usePublishTrackStore();

  useEffect(() => {
    fetchPublishReleases(search, priority);
  }, [search, priority, fetchPublishReleases]);

  return {
    releases,
    loading,
    error,
    fetchPublishReleases,
    updatePublishRelease,
  };
};
