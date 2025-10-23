/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { IPublishRelease } from "./type";
import { useAuthStore } from "@/stores/useAuthStore";
import { ENDPOINTS } from "./endpoints";

/* ---------------- Transform Helpers ---------------- */
export const transformPublishRelease = (item: any): IPublishRelease => {
  const attr = item.attributes;

  return {
    id: item.id,
    releaseTitle: attr.ReleaseTitle,
    releaseType: attr.ReleaseType,
    version: attr.Version,
    label: attr.AddLabel,
    primaryGenre: attr.PrimaryGenre,
    secondaryGenre: attr.SecondaryGenre,
    priority: attr.Priority,
    status: attr.Status,
    publishedAt: attr.publishedAt,
    language: attr.LanguageOfTheTitles,
    digitalReleaseDate: attr.DigitalReleaseDate,
    price_category: attr.PriceCategory,
    original_release: attr.OriginalReleaseDate,
    c_year: attr.CopyrightYear,
    c_line: attr.CopyrightholderName,
    p_year: attr.PhonogramRightsHolderYear,
    p_line: attr.PhonogramRightsHolderName,
    coverArt: attr.CoverArt?.data
      ? {
          id: attr.CoverArt.data.id,
          name: attr.CoverArt.data.attributes.name,
          url: attr.CoverArt.data.attributes.url,
          formats: attr.CoverArt.data.attributes.formats,
        }
      : undefined,
    tracks:
      attr.TrackList?.data?.map((t: any) => ({
        id: t.id,
        trackName: t.attributes.TrackName,
        primaryGenre: t.attributes.PrimaryGenre,
        secondaryGenre: t.attributes.SecondaryGenre,
        status: t.attributes.Status,
        isrc: t.attributes.ISRC,
        iswc: t.attributes.ISWC,
        roleCredits: t.attributes.RoleCredits,
        explicit_lyrics: t.attributes.LyricsAvailable,
        audioUrl: t.attributes.TrackUpload.data?.attributes.url,
      })) || [],
    user: {
      id: attr.UserDetail?.data?.id,
      username: attr.UserDetail?.data?.attributes?.username,
      email: attr.UserDetail?.data?.attributes?.email,
      firstName: attr.UserDetail?.data?.attributes?.firstName,
      lastName: attr.UserDetail?.data?.attributes?.lastName,
      phoneNumber: attr.UserDetail?.data?.attributes?.phoneNumber,
      currency: attr.UserDetail?.data?.attributes?.currency,
      dob: attr.UserDetail?.data?.attributes?.dob,
      blocked: attr.UserDetail?.data?.attributes?.blocked,
    },
  };
};

/* ---------------- API Functions ---------------- */

// User Publish Track
export const getUserPublishTrack = async () => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.USER_PUBLISH_TRACK, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });
  return response.data;
};

// Track List By Published ID
export const getTrackListByPublishedId = async (pubId: number) => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.TRACK_LIST_BY_PUBLISHED(pubId), {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

// Publish Track by ID
export const publishTrackById = async (pubId: number) => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.PUBLISH_LIST_BY_ID(pubId), {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

// Get Calendar Events
export const getCalenderEvents = async () => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.GET_CALENDAR_EVENTS, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

// Get Standard Publish list
export const getStandardPublishList = async () => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.PUBLISH_STANDARD, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

// Get Standard Publish list
export const getPriorityPublishList = async () => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.PUBLISH_PRIORITY, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

// Publish Release List
export const getPublishReleaseList = async (
  search: string = "",
  priority: string = ""
): Promise<IPublishRelease[]> => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(
    ENDPOINTS.GET_PUBLISH_LIST(search, priority),
    {
      headers: { Authorization: `Bearer ${user?.token}` },
    }
  );

  return response.data.map(transformPublishRelease);
};

// Update Publish Release
export const updatePublishRelease = async (
  pubId: number,
  payload: Partial<any>
) => {
  const { user } = useAuthStore.getState();
  const response = await axios.put(
    ENDPOINTS.PUBLISH_LIST_BY_ID(pubId),
    {data: payload },
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }
  );
  return response.data;
};
