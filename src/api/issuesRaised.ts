/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import { useAuthStore } from "@/stores/useAuthStore";

// type
export interface IIssuePayload {
  title: string;
  description: string;
  status: string;
  user: number;
  attachment?: number;
}

export interface IIssueResponse {
  id: number;
  attributes: {
    title: string;
    description: string;
    status: string;
  };
}

// types/ticket.ts
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  is_read: boolean;
  createdAt: string;
  updatedAt: string;
  attachment?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    profileImage?: string | null;
  } | null;
}

export const createIssue = async (
  payload: IIssuePayload,
  onProgress: (progress: number) => void
): Promise<IIssueResponse> => {
  const { user } = useAuthStore.getState();

  const response = await axios.post(
    ENDPOINTS.TICKET_RAISED,
    { data: payload },
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        onProgress(percentCompleted);
      },
    }
  );

  return response.data.data;
};

export const getTicketRaised = async () => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.TICKET_RAISED, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

export const getTicketRaisedById = async (ticketId: number) => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.TICKET_RAISED_BY_ID(ticketId), {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

export const transformTicket = (item: any): Ticket => {
  return {
    id: item.id.toString(),
    title: item.title,
    description: item.description,
    status: item.status,
    is_read: item.is_read ?? false,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,

    attachment: item.attachment
      ? `${process.env.EXPO_PUBLIC_API_URL}${item.attachment.url}`
      : null,

    user: item.user
      ? {
          id: item.user.id,
          name: `${item.user.firstName} ${item.user.lastName}`.trim(),
          email: item.user.email,
          phone: item.user.phoneNumber,
          profileImage: item.user.Profile_image
            ? `${process.env.EXPO_PUBLIC_API_URL}${
                item.user.Profile_image.formats?.thumbnail?.url ||
                item.user.Profile_image.url
              }`
            : null,
        }
      : null,
  };
};
