import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import { User } from "./type";

// Minimal transformer to avoid importing the store and keep this file dependency-free
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

export const getUserDetail = async (
  userId: string,
  token: string
): Promise<User> => {
  const response = await axios.get(ENDPOINTS.USER_DETAIL_BY_ID(userId), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return transformUser(response.data);
};
