/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import { CreateUserPlayLoad, User } from "./type";
import { useAuthStore } from "@/stores/useAuthStore";

export const createUser = async (payload: CreateUserPlayLoad) => {
  const response = await axios.post(ENDPOINTS.REGISTER, payload);
  return response.data;
};

export const checkEmailExists = async (email: string) => {
  const response = await axios.get(ENDPOINTS.CHECK_EMAIL(email));
  return response.data;
};

export const sendVerificationEmail = async (email: string) => {
  const response = await axios.post(ENDPOINTS.EMAIL_VERIFICATION, {
    email,
  });
  return response.data;
};

export const verifyEmailWithOtp = async (email: string, otp: string) => {
  const response = await axios.post(ENDPOINTS.EMAIL_VERIFIED, {
    email,
    otp,
  });
  return response.data;
};

export const checkEmailStatus = async (email: string) => {
  const response = await axios.get(ENDPOINTS.EMAIL_STATUS(email));
  return response.data;
};

// transformData
const transformUser = (u: any): User => ({
  id: u.id,
  username: u.username,
  email: u.email,
  phoneNumber: u.phoneNumber,
  currency: u.currency,
  dob: u.dob,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
  Profile_image: u.Profile_image,
  blocked: u.blocked,
  artist_details_count: u.artist_details_count ?? 0,
  distribute_drafts_count: u.distribute_drafts_count ?? 0,
  name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
});

export const transformUsersList = (resp: any): User[] => {
  return resp?.map(transformUser) ?? [];
};

export const getUsersList = async (): Promise<User[]> => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.USER_LIST, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });
  return transformUsersList(response.data);
};

export const getUserClientsDetail = async (userId: string): Promise<User> => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.USER_CLIENTS_BY_ID(userId), {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });

  return transformUser(response.data);
};

export const updateUserClientsDetail = async (
  userId: string,
  currentlyBlocked: boolean
): Promise<User> => {
  const { user } = useAuthStore.getState();
  const response = await axios.put(
    ENDPOINTS.USER_DETAIL_BY_ID(userId),
    { blocked: !currentlyBlocked },
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }
  );

  return transformUser(response.data);
};

// moved to userPublicApi.ts to avoid store import cycle
