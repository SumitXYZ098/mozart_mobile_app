import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import { LoginPayload, LoginResponse } from "./type";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await axios.post<LoginResponse>(ENDPOINTS.LOGIN, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.response?.data.error.message);
      throw new Error(error.response?.data.error.message);
    }
    throw new Error("An unexpected error occurred");
  }
}
