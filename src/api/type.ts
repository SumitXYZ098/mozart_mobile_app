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