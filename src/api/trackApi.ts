/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import { useAuthStore } from "@/stores/useAuthStore";

/* ---------------- Types ---------------- */
export interface IRoleCredit {
  artistName: string;
  RoleType: string;
}

export interface ITrackUploadAttributes {
  data: {
    id: number;
    attributes: {
      name: string;
      alternativeText: string | null;
      caption: string | null;
      width: number | null;
      height: number | null;
      formats: Record<string, unknown> | null;
      hash: string;
      ext: string;
      mime: string;
      size: number;
      url: string;
      previewUrl: string | null;
      provider: string;
      provider_metadata: Record<string, unknown> | null;
      createdAt: string; // ISO timestamp
      updatedAt: string; // ISO timestamp
    };
  };
}

export interface ITrackPayload {
  TrackName: string;
  PrimaryGenre: string;
  SecondaryGenre: string;
  RoleCredits: IRoleCredit[];
  LyricsAvailable: boolean;
  AppropriateForAllAudiences: boolean;
  ContainsExplicitContent: boolean;
  CleanVersionAvailable: boolean;
  ISRC: string | null;
  RequestANewISRC: boolean;
  ISWC: string | null;
  DraftRelease: number;
  PublishedRelease: string;
  TrackUpload: string;
}

export interface ITrackAttributes {
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  TrackName: string;
  PrimaryGenre: string;
  SecondaryGenre: string;
  RoleCredits: IRoleCredit[];
  LyricsAvailable: boolean;
  AppropriateForAllAudiences: boolean;
  ContainsExplicitContent: boolean;
  CleanVersionAvailable: boolean;
  ISRC: string | null;
  ISWC: string | null;
  RequestANewISRC: boolean;
  PhonogramRightsHolderName: string | null;
  PhonogramRightsHolderYear: number | null;
  ReferenceNumber: string | null;
  Identifiers: Record<string, any> | null;
  DraftRelease: number;
  TrackUpload: ITrackUploadAttributes;
}

export interface ITrackResponse {
  id: number;
  attributes: ITrackAttributes;
}

export interface IPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface ITrackListResponse {
  data: ITrackResponse[];
  meta: { pagination: IPagination };
}

export interface ITrack {
  id: number;
  TrackName: string;
  PrimaryGenre: string;
  SecondaryGenre: string;
  RoleCredits: IRoleCredit[];
  LyricsAvailable: boolean;
  AppropriateForAllAudiences: boolean;
  ContainsExplicitContent: boolean;
  CleanVersionAvailable: boolean;
  ISRC: string | null;
  ISWC: string | null;
  DraftRelease: number | null;
  RequestANewISRC: boolean;
  TrackUploadUrl: string | null; // direct file URL
}

/* ---------------- API Functions ---------------- */

// Add new track (with audio upload + release relation)
export const postNewTrack = async (
  payload: Partial<ITrackPayload>,
  draftId: number | null
) => {
  const { user } = useAuthStore.getState();
  const trackPayload: Partial<ITrackPayload> = {
    ...payload,
    DraftRelease: draftId || 0,
  };

  const response = await axios.post(
    ENDPOINTS.ADD_NEW_TRACK,
    { data: trackPayload }, // ✅ wrap in { data }
    { headers: { Authorization: `Bearer ${user?.token}` } }
  );

  return response.data.data;
};

// Get tracks for a release
export const getTrackList = async (releaseId: number) => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.TRACK_LIST(releaseId), {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

// Get track by ID
export const getTrackById = async (trackId: number) => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.GET_TRACK_BY_ID(trackId), {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data.data;
};

// Update track
export const updateTrackById = async (
  trackId: number,
  payload: Partial<ITrackAttributes>
) => {
  const { user } = useAuthStore.getState();
  const response = await axios.put(
    ENDPOINTS.UPDATE_TRACK_BY_ID(trackId),
    { data: payload },
    { headers: { Authorization: `Bearer ${user?.token}` } }
  );
  return response.data.data;
};

// Delete track
export const deleteTrack = async (trackId: number) => {
  const { user } = useAuthStore.getState();
  const response = await axios.delete(ENDPOINTS.DELETE_TRACK(trackId), {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};




