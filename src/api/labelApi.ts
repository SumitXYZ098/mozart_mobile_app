import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import { useAuthStore } from "@/stores/useAuthStore";

export interface ILabel {
  id: number;
  label: string;
}

export const addLabels = async (label: string) => {
  const { user } = useAuthStore.getState();
  const response = await axios.post(ENDPOINTS.ADD_LABELS, { label }, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });
  return response.data; // Adjust according to your API (if returns full object)
};

export const getLabelsList = async (): Promise<{ data: ILabel[] }> => {
  const { user } = useAuthStore.getState();
  const response = await axios.get(ENDPOINTS.LABELS_LIST, {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  });
  return response.data;
};
