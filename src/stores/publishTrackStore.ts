/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCalenderEvents, getPublishReleaseList, getTrackListByPublishedId, getUserPublishTrack, publishTrackById, updatePublishRelease } from "@/api/publishApi";
import { CalendarEvent, CoverArt, IPublishRelease, RoleCredit } from "@/api/type";
import { create } from "zustand";

// Types

interface TrackUpload {
  id: number;
  name: string;
  url: string;
  ext: string;
  mime: string;
  createdAt?: string;
}

interface Track {
  id: number;
  TrackName: string;
  PrimaryGenre: string;
  SecondaryGenre: string;
  RoleCredits: RoleCredit[];
  LyricsAvailable: boolean;
  AppropriateForAllAudiences: boolean;
  ContainsExplicitContent: boolean;
  CleanVersionAvailable: boolean;
  ISRC: string;
  ISWC: string;
  RequestANewISRC: boolean;
  Status: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  TrackUpload?: TrackUpload;
}

interface PublishTrack {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  ReleaseTitle: string;
  ReleaseType: string;
  Version: string;
  PrimaryGenre: string;
  SecondaryGenre: string | null;
  AddLabel: string;
  Priority: string;
  ReleaseTime: string;
  OriginalReleaseDate: string;
  DigitalReleaseDate: string;
  PhonogramRightsHolderName: string;
  PhonogramRightsHolderYear: number;
  CopyrightholderName: string;
  ReferenceNumber: string;
  CopyrightYear: number;
  Status: string | null;
  Countries: string[];
  MusicStores: string[];
  TrackList: Track[];
  CoverArt: CoverArt;
}

interface PublishTrackState {
  tracks: PublishTrack[];
  trackList: Track[];
  currentTrack: PublishTrack | null;
  releases: IPublishRelease[]; // NEW
  loading: boolean;
  error: string | null;

  fetchUserPublishTracks: () => Promise<void>;
  fetchTrackListByPublishedId: (pubId: number) => Promise<void>;
  fetchPublishTrackById: (pubId: number) => Promise<void>;
  fetchPublishReleases: (search?: string, priority?: string) => Promise<void>; // NEW
  updatePublishRelease: (pubId: number, payload: Partial<any>) => Promise<void>;
}

export const usePublishTrackStore = create<PublishTrackState>((set, get) => ({
  tracks: [],
  trackList: [],
  currentTrack: null,
  releases: [],
  loading: false,
  error: null,

  // Fetch all user publish tracks
  fetchUserPublishTracks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getUserPublishTrack();
      set({ tracks: response.data, loading: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch published tracks",
        loading: false,
      });
    }
  },

  // Fetch Track List by Published ID
  fetchTrackListByPublishedId: async (pubId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await getTrackListByPublishedId(pubId);
      set({ trackList: response.data, loading: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch track list",
        loading: false,
      });
    }
  },

  // Fetch single publish track by ID
  fetchPublishTrackById: async (pubId: number) => {
    set({ loading: true, error: null, currentTrack: null });
    try {
      const response = await publishTrackById(pubId);
      set({ currentTrack: response.data, loading: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch publish track",
        loading: false,
      });
    }
  },

  // Fetch publish releases (NEW)
  fetchPublishReleases: async (search = "", priority = "") => {
    set({ loading: true, error: null });
    try {
      const releases = await getPublishReleaseList(search, priority);
      set({ releases, loading: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch publish releases",
        loading: false,
      });
    }
  },

  // 🔹 NEW: Update publish release (e.g. to add reference number)
  updatePublishRelease: async (pubId: number, payload: Partial<any>) => {
    set({ loading: true, error: null });
    try {
      const updated = await updatePublishRelease(pubId, payload);

      // Replace updated item in state
      const { releases } = get();
      const updatedReleases = releases.map((r) =>
        r.id === pubId ? { ...r, ...updated } : r
      );

      set({ releases: updatedReleases, loading: false });
      return updated;
    } catch (err: any) {
      set({
        error: err.message || "Failed to update publish release",
        loading: false,
      });
      throw err;
    }
  },

  updateMultipleReleases: async (ids: number[], payload: Partial<any>) => {
  const { updatePublishRelease } = get();
  const promises = ids.map((id) => updatePublishRelease(id, payload));
  await Promise.all(promises);
},
}));

// Calendar Store
type CalendarStore = {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  fetchCalendarEvents: () => Promise<void>;
};

export const useCalendarStore = create<CalendarStore>((set) => ({
  events: [],
  loading: false,
  error: null,

  fetchCalendarEvents: async () => {
    set({ loading: true, error: null });

    try {
      const response = await getCalenderEvents();

      const mapped = response.data ? mapCalendarEvents(response.data) : [];

      set({ events: mapped, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));

// Mapper function
const mapCalendarEvents = (data: any[]): CalendarEvent[] => {
  return data.map((item) => ({
    title: item.ReleaseTitle,
    start: new Date(item.start),
    end: new Date(item.end),
    status: item.Status,
    releaseType: item.ReleaseType,
  }));
};
