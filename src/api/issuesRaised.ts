/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import { useAuthStore } from "@/stores/useAuthStore";

// type
export interface IIssuePayload {
  title: string;
  category: string;
  description: string;
  status: string;
  user: number;
  attachment?: number | null;
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
  category?: string;
  ticketNumber?: string;
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
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export const createIssue = async (
  payload: IIssuePayload,
  onProgress: (progress: number) => void
): Promise<IIssueResponse> => {
  const { user } = useAuthStore.getState();

  const flatPayload = {
    title: payload.title,
    category: payload.category,
    description: payload.description,
    attachments: payload.attachment ? [payload.attachment] : [],
  };

  const response = await axios.post(
    ENDPOINTS.RAISE_TICKET,
    flatPayload,
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
  const response = await axios.get(ENDPOINTS.MY_TICKETS, {
    headers: { Authorization: `Bearer ${user?.token}` },
  });
  return response.data;
};

export const getTicketRaisedById = async (ticketId: number) => {
  const { user } = useAuthStore.getState();
  const url = ENDPOINTS.TICKET_DETAILS(ticketId);
  console.log(`[getTicketRaisedById] Requesting ticket details from: ${url}`);
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    console.log(`[getTicketRaisedById] Success response data:`, JSON.stringify(response.data));
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error(`[getTicketRaisedById] Error fetching URL: ${url}`, error.message);
    throw error;
  }
};

export const transformTicket = (item: any): Ticket => {
  const attrs = item.attributes || item;

  // Extract attachments URL cleanly
  let attachmentUrl: string | null = null;
  const rawAttachment = attrs.attachments?.[0] || attrs.attachment?.data || attrs.attachment;
  if (rawAttachment) {
    const rawUrl = rawAttachment.attributes?.url || rawAttachment.url;
    if (rawUrl) {
      if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
        attachmentUrl = rawUrl;
      } else {
        attachmentUrl = `${process.env.EXPO_PUBLIC_API_URL}${rawUrl}`;
      }
    }
  }

  return {
    id: item.id.toString(),
    title: attrs.title,
    category: attrs.category,
    ticketNumber: attrs.ticketNumber,
    description: attrs.description,
    status: attrs.status,
    is_read: attrs.is_read ?? false,
    createdAt: attrs.createdAt,
    updatedAt: attrs.updatedAt,
    attachment: attachmentUrl,

    user: attrs.user
      ? {
          id: attrs.user.id,
          name: `${attrs.user.firstName || ""} ${attrs.user.lastName || ""}`.trim() || attrs.user.username || "",
          email: attrs.user.email,
          phone: attrs.user.phoneNumber,
          profileImage: attrs.user.Profile_image
            ? `${process.env.EXPO_PUBLIC_API_URL}${
                attrs.user.Profile_image.formats?.thumbnail?.url ||
                attrs.user.Profile_image.url
              }`
            : null,
        }
      : null,

    assignedTo: attrs.assignedTo
      ? {
          id: attrs.assignedTo.id,
          name: `${attrs.assignedTo.firstName || ""} ${attrs.assignedTo.lastName || ""}`.trim() || attrs.assignedTo.username || "Support Agent",
          email: attrs.assignedTo.email,
        }
      : null,
  };
};

export interface TicketMessage {
  id: string;
  message: string;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    email: string;
    profileImage?: string | null;
  } | null;
  attachment?: string | null;
}

export const getTicketMessages = async (ticketId: number): Promise<TicketMessage[]> => {
  const { user } = useAuthStore.getState();
  try {
    const response = await axios.get(
      ENDPOINTS.TICKET_DETAILS(ticketId),
      {
        headers: { Authorization: `Bearer ${user?.token}` },
      }
    );
    
    const ticketData = response.data?.data || response.data;
    const rawMessages = ticketData?.messages || [];
    return rawMessages.map((item: any) => {
      const senderObj = item.sender;
      
      let attachmentUrl: string | null = null;
      if (item.attachment) {
        const rawUrl = item.attachment.url || item.attachment;
        if (rawUrl) {
          if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
            attachmentUrl = rawUrl;
          } else {
            attachmentUrl = `${process.env.EXPO_PUBLIC_API_URL}${rawUrl}`;
          }
        }
      }

      return {
        id: item.id.toString(),
        message: item.message || item.content || "",
        createdAt: item.createdAt || new Date().toISOString(),
        sender: senderObj
          ? {
              id: senderObj.id,
              name: `${senderObj.firstName || ""} ${senderObj.lastName || ""}`.trim() || senderObj.username || "Support",
              email: senderObj.email || "",
            }
          : null,
        attachment: attachmentUrl,
      };
    });
  } catch (error) {
    console.error("Error fetching ticket messages:", error);
    return [];
  }
};

export const sendTicketMessage = async (
  ticketId: number,
  message: string,
  attachmentId?: number | null
): Promise<any> => {
  const { user } = useAuthStore.getState();
  const payload = {
    message,
    attachment: attachmentId || null,
  };
  const response = await axios.post(
    ENDPOINTS.REPLY_TO_TICKET(ticketId),
    payload,
    {
      headers: { Authorization: `Bearer ${user?.token}` },
    }
  );
  return response.data;
};
