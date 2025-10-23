export interface ICoverArtFormats {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface ICoverArtAttributes {
  id: number;
  name?: string;
  url: string;
  width?: number;
  height?: number;
  formats?: {
    large?: ICoverArtFormats;
    medium?: ICoverArtFormats;
    small?: ICoverArtFormats;
    thumbnail?: ICoverArtFormats;
  };
}
export interface User {
  id?: string;
  name?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  token?: string;
  isVerified?: boolean;
  role?: any;
  Profile_image?: ICoverArtAttributes;
  currency?: string;
  dob?: string;
  blocked?: boolean;
  artist_details_count?: number;
  distribute_drafts_count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    role: { role: string };
    currency: string;
    Profile_image: ICoverArtAttributes;
    dob: string;
  };
}

export interface CreateUserPlayLoad {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
}

export interface RoleCredit {
  artistName: string;
  roleName: string;
}

export interface Track {
  id?: number;
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
  TrackUpload: string | null; // Assuming this is a file URL or null
  file: File | null;
  stepCompleted: boolean;
  currentStep: number;
  Status: string; // Adjust based on your backend
}

export interface DraftData {
  ReleaseTitle: string;
  ReleaseType: string;
  Version: string;
  LanguageOfTheTitles: string;
  PrimaryGenre: string;
  SecondaryGenre: string;
  AddLabel: string;
  ReferenceNumber: string;
  Priority: string; // Adjust if more options exist
  TimeZoneOfReference: string;
  Countries: string[];
  MusicStores: string[];
  ReleaseTime: string; // Format: "HH:mm"
  OriginalReleaseDate: string; // Format: "YYYY-MM-DD"
  DigitalReleaseDate: string; // Format: "YYYY-MM-DD"
  CopyrightholderName: string;
  CopyrightYear: number;
  PhonogramRightsHolderName: string;
  PhonogramRightsHolderYear: number;
  PriceCategory: string; // Adjust options as needed
  CoverArt: string | null; // URL of cover art or null
  TrackList: Track[];
}

export interface RoleCredit {
  roleName: string;
  artistName: string;
}

export interface PublishedTrack {
  id: number;
  trackName: string;
  primaryGenre: string;
  secondaryGenre: string;
  roleCredits: RoleCredit[];
  status: string;
  isrc: string;
  iswc: string;
  explicit_lyrics: boolean;
  audioUrl: string;
}

export interface CoverArtFormat {
  url: string;
  width: number;
  height: number;
}

export interface CoverArt {
  id: number;
  name: string;
  url: string;
  formats: {
    thumbnail?: CoverArtFormat;
    small?: CoverArtFormat;
    medium?: CoverArtFormat;
    large?: CoverArtFormat;
  };
}

export interface UserDetail {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  currency: string;
  dob: string;
  blocked: boolean;
}

export interface IPublishRelease {
  id: number;
  releaseTitle: string;
  releaseType: string;
  version: string;
  label: string;
  primaryGenre: string;
  secondaryGenre: string;
  priority: string;
  status: string;
  publishedAt: string;
  digitalReleaseDate: string;
  original_release: string;
  language: string;
  price_category: string;
  c_year: string;
  c_line: string;
  p_year: string;
  p_line: string;
  coverArt?: CoverArt;
  tracks: PublishedTrack[];
  user: UserDetail;
}

export interface ICoverArtFormats {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface ICoverArtAttributes {
  id: number;
  name?: string;
  url: string;
  width?: number;
  height?: number;
  formats?: {
    large?: ICoverArtFormats;
    medium?: ICoverArtFormats;
    small?: ICoverArtFormats;
    thumbnail?: ICoverArtFormats;
  };
}
export interface IReleasePayload {
  ReleaseType: string;
  ReleaseTitle: string;
  Version: string;
  LanguageOfTheTitles: string;
  PrimaryGenre: string;
  SecondaryGenre: string;
  AddLabel: string;
  ReferenceNumber: string;
  Priority: string;
  TimeZoneOfReference: string;
  OriginalReleaseDate: string; // ISO string
  Countries: string[];
  MusicStores: string[];
  ReleaseTime: string;
  DigitalReleaseDate: string;
  CopyrightholderName: number;
  CopyrightYear: number;
  PhonogramRightsHolderName: string;
  PhonogramRightsHolderYear: number;
  PriceCategory: string;
  CoverArt: string;
  TrackList: number[];
}

export interface IReleaseAttributes {
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  ReleaseType: string;
  ReleaseTitle: string;
  Version: string;
  LanguageOfTheTitles: string;
  PrimaryGenre: string;
  SecondaryGenre: string;
  AddLabel: string;
  ReferenceNumber: string;
  Priority: string;
  TimeZoneOfReference: string;
  OriginalReleaseDate: string; // ISO string
  Countries: string[];
  MusicStores: string[];
  ReleaseTime: string;
  DigitalReleaseDate: string;
  CopyrightholderName: number;
  CopyrightYear: number;
  PhonogramRightsHolderName: string;
  PhonogramRightsHolderYear: number;
  PriceCategory: string;
  CoverArt: ICoverArtAttributes;
  TrackList: any[]; // attach tracks by ID
}

export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  status: string;
  releaseType?: string;
  tracks?: string[];
};