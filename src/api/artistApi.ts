/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import { ICoverArtAttributes } from "./type";
import { useAuthStore } from "@/stores/useAuthStore";

export interface Artist {
  artistName: string;
  id: number;
  roleName: string;
  appleMusicId?: string;
  spotifyId?: string;
  youtubeUsername?: string;
  soundcloudPage?: string;
  facebookPage?: string;
  twitterUsername?: string;
  websiteUrl?: string;
  biography?: string;
  trackCount: number;
  Profile_image?: ICoverArtAttributes;
  itsVerified: boolean;
  requiredVerification?: boolean | null;
}

interface AllArtistResponse {
  id: number;
  artistName: string;
  roleName: string;
  appleMusicId: string | null;
  spotifyId: string | null;
  youtubeUsername: string | null;
  soundcloudPage: string | null;
  facebookPage: string | null;
  twitterUsername: string | null;
  websiteUrl: string | null;
  biography: string | null;
  itsVerified: boolean;
  requiredVerification?: boolean | null;
  Profile_image?: ICoverArtAttributes | null;
  owner?: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
  trackCount: number;
}

export interface AllArtistTransformed {
  id: number;
  name: string;
  role: string;
  verified: boolean;
  requiredVerification?: boolean | null;
  profileImage: string | null;
  trackCount: number;
  appleMusicId?: string | null;
  spotifyId?: string | null;
  youtubeUsername?: string | null;
  soundcloudPage?: string | null;
  facebookPage?: string | null;
  twitterUsername?: string | null;
  websiteUrl?: string | null;
  biography?: string | null;
  owner?: {
    id: number;
    fullName: string;
  } | null;
}

export const transformAllArtist = (
  data: AllArtistResponse
): AllArtistTransformed => {
  return {
    id: data.id,
    name: data.artistName,
    role: data.roleName,
    verified: data.itsVerified,
    profileImage: data.Profile_image?.formats?.thumbnail
      ? data?.Profile_image?.formats?.thumbnail?.url
      : data?.Profile_image?.formats?.small?.url || null,
    trackCount: data.trackCount,
    appleMusicId: data.appleMusicId,
    spotifyId: data.spotifyId,
    youtubeUsername: data.youtubeUsername,
    soundcloudPage: data.soundcloudPage,
    facebookPage: data.facebookPage,
    twitterUsername: data.twitterUsername,
    websiteUrl: data.websiteUrl,
    biography: data.biography,
    requiredVerification: data.requiredVerification,
    owner: data.owner
      ? {
          id: data.owner.id,
          fullName: `${data.owner.firstName} ${data.owner.lastName}`,
        }
      : null,
  };
};

// Raw response type from API
export interface ArtistResponse {
  id: number;
  artistName: string;
  roleName: string;
  appleMusicId: string | null;
  spotifyId: string | null;
  youtubeUsername: string | null;
  soundcloudPage: string | null;
  facebookPage: string | null;
  twitterUsername: string | null;
  websiteUrl: string | null;
  biography: string | null;
  itsVerified: boolean;
  requiredVerification?: boolean | null; // only in getArtistList
  Profile_image?: ICoverArtAttributes | null;
  trackCount: number;
  createdAt: string;
  updatedAt: string;
}

// After transformation
export interface ArtistTransformed {
  id: number;
  name: string;
  role: string;
  verified: boolean;
  requiredVerification?: boolean; // keep optional
  profileImage: string | null;
  trackCount: number;
  appleMusicId?: string | null;
  spotifyId?: string | null;
  youtubeUsername?: string | null;
  soundcloudPage?: string | null;
  facebookPage?: string | null;
  twitterUsername?: string | null;
  websiteUrl?: string | null;
  biography?: string | null;
}

export const transformArtist = (data: ArtistResponse): ArtistTransformed => {
  return {
    id: data.id,
    name: data.artistName,
    role: data.roleName,
    verified: data.itsVerified,
    requiredVerification: data.requiredVerification ?? false,
    profileImage: data.Profile_image?.formats?.thumbnail
      ? data?.Profile_image?.formats?.thumbnail?.url
      : data?.Profile_image?.formats?.small?.url || null,
    trackCount: data.trackCount,
    appleMusicId: data.appleMusicId,
    spotifyId: data.spotifyId,
    youtubeUsername: data.youtubeUsername,
    soundcloudPage: data.soundcloudPage,
    facebookPage: data.facebookPage,
    twitterUsername: data.twitterUsername,
    websiteUrl: data.websiteUrl,
    biography: data.biography,
  };
};

export const getAllArtists = async (
  search: string,
  onProgress?: (progress: number) => void
): Promise<AllArtistTransformed[]> => {
  const { user } = useAuthStore.getState();

  const response = await axios.get<AllArtistResponse[]>(
    ENDPOINTS.All_ARTIST(search),
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        if (onProgress) onProgress(percentCompleted);
      },
    }
  );

  return response.data.map(transformAllArtist);
};

export const getArtistList = async (
  search: string,
  onProgress?: (progress: number) => void
): Promise<ArtistTransformed[]> => {
  const { user } = useAuthStore.getState();

  const response = await axios.get<ArtistResponse[]>(
    ENDPOINTS.ARTIST_LIST(search),
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        if (onProgress) onProgress(percentCompleted);
      },
    }
  );

  return response.data.map(transformArtist);
};

export const getArtistById = async (
  artistId: number,
  onProgress: (progress: number) => void
): Promise<Artist | null> => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.ARTIST_BY_ID(artistId), {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
    onDownloadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      if (onProgress) onProgress(percentCompleted);
    },
  });
  return response.data;
};

export const createArtist = async (
  payload: Partial<any>,
  onProgress: (progress: number) => void
) => {
  const { user } = useAuthStore.getState();
  const response = await axios.post(
    ENDPOINTS.ADD_NEW_ARTIST,
    { data: payload },
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        if (onProgress) onProgress(percentCompleted);
      },
    }
  );
  return response.data;
};

export const updateArtistById = async (
  artistId: number,
  payload: Partial<any>,
  onProgress: (progress: number) => void
) => {
  const { user } = useAuthStore.getState();
  const response = await axios.put(ENDPOINTS.ARTIST_BY_ID(artistId), payload, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      if (onProgress) onProgress(percentCompleted);
    },
  });
  return response.data;
};
