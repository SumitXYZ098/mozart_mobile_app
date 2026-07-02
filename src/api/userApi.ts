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

export const submitBankDetails = async (payload: any): Promise<any> => {
  const { user } = useAuthStore.getState();
  const response = await axios.post(
    ENDPOINTS.BANK_DETAILS,
    { data: payload },
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }
  );
  return response.data;
};

export const getBankDetails = async (): Promise<any> => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.BANK_DETAILS, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });
  
  const respData = response.data;
  if (respData && respData.data) {
    if (Array.isArray(respData.data)) {
      if (respData.data.length > 0) {
        const item = respData.data[0];
        return item.attributes ? { ...item.attributes, id: item.id } : item;
      }
      return null;
    } else {
      const item = respData.data;
      return item.attributes ? { ...item.attributes, id: item.id } : item;
    }
  }
  return respData;
};

export const getAllBankDetails = async (): Promise<any[]> => {
  const { user } = useAuthStore.getState();
  if (!user || !user.id) return [];
  
  const response = await axios.get(
    `${ENDPOINTS.BANK_DETAILS}?populate=user&populate=users_permissions_user`,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }
  );
  
  const respData = response.data;
  if (respData && respData.data) {
    let rawList = [];
    if (Array.isArray(respData.data)) {
      rawList = respData.data.map((item: any) => 
        item.attributes ? { ...item.attributes, id: item.id, user: item.attributes.user, users_permissions_user: item.attributes.users_permissions_user } : item
      );
    } else {
      const item = respData.data;
      rawList = [item.attributes ? { ...item.attributes, id: item.id, user: item.attributes.user, users_permissions_user: item.attributes.users_permissions_user } : item];
    }

    // Filter by user relation id
    return rawList.filter((item: any) => {
      const relId = item.user?.data?.id || item.user?.id || 
                    item.users_permissions_user?.data?.id || item.users_permissions_user?.id;
      if (relId !== undefined && relId !== null) {
        return String(relId) === String(user.id);
      }
      return true;
    });
  }
  return [];
};
export const updateBankDetails = async (id: number, payload: any): Promise<any> => {
  const { user } = useAuthStore.getState();
  try {
    const response = await axios.put(
      ENDPOINTS.BANK_DETAILS_BY_ID(id),
      { data: payload },
      {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.warn("PUT with ID failed, checking status for fallback...", error);
    if (error.response?.status === 405) {
      return submitBankDetails(payload);
    }
    try {
      const response = await axios.put(
        ENDPOINTS.BANK_DETAILS,
        { data: payload },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      return response.data;
    } catch (fallbackError: any) {
      if (fallbackError.response?.status === 405) {
        return submitBankDetails(payload);
      }
      throw fallbackError;
    }
  }
};

export const deleteBankDetails = async (id?: number): Promise<any> => {
  const { user } = useAuthStore.getState();
  
  if (id) {
    try {
      const response = await axios.delete(
        ENDPOINTS.BANK_DETAILS_BY_ID(id),
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.warn("DELETE with ID failed, trying singular DELETE fallback...", error);
    }
  }

  const response = await axios.delete(
    ENDPOINTS.BANK_DETAILS,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }
  );
  return response.data;
};

export const getBillingCards = async (): Promise<any[]> => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.BILLING_CARDS, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });
  
  const respData = response.data;
  if (respData && respData.data) {
    return respData.data.map((item: any) => {
      const attrs = item.attributes || {};
      const expiryMonth = attrs.expiry_month || attrs.expiryMonth || "";
      const expiryYear = String(attrs.expiry_year || attrs.expiryYear || "");
      const yearShort = expiryYear.length === 4 ? expiryYear.slice(-2) : expiryYear;
      const expiryDate = expiryMonth && yearShort ? `${expiryMonth}/${yearShort}` : "";

      return {
        id: String(item.id),
        cardHolder: attrs.card_holder_name || attrs.cardHolderName || attrs.card_holder || attrs.cardHolder || "",
        cardNumber: attrs.card_number || attrs.cardNumber || "",
        expiryDate,
        cvv: attrs.cvv || "",
        enableAutopay: attrs.enable_autopay ?? attrs.enableAutopay ?? true,
        isPrimary: attrs.is_primary ?? attrs.isPrimary ?? false,
      };
    });
  }
  return [];
};

export const submitBillingCard = async (payload: any): Promise<any> => {
  const { user } = useAuthStore.getState();
  const response = await axios.post(
    ENDPOINTS.BILLING_CARDS,
    { data: payload },
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }
  );
  return response.data;
};

export const updateBillingCard = async (id: string | number, payload: any): Promise<any> => {
  const { user } = useAuthStore.getState();
  try {
    const response = await axios.put(
      ENDPOINTS.BILLING_CARD_BY_ID(Number(id)),
      { data: payload },
      {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.warn("PUT billing card with ID failed, trying singular PUT fallback...", error);
    const response = await axios.put(
      ENDPOINTS.BILLING_CARDS,
      { data: payload },
      {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }
    );
    return response.data;
  }
};

export const deleteBillingCard = async (id: string | number): Promise<any> => {
  const { user } = useAuthStore.getState();
  try {
    const response = await axios.delete(
      ENDPOINTS.BILLING_CARD_BY_ID(Number(id)),
      {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.warn("DELETE billing card with ID failed, trying singular DELETE fallback...", error);
    const response = await axios.delete(
      ENDPOINTS.BILLING_CARDS,
      {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }
    );
    return response.data;
  }
};

// moved to userPublicApi.ts to avoid store import cycle
