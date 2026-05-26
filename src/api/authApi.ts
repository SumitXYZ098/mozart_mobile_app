import axios from 'axios';
import { ENDPOINTS } from '@/api/endpoints';
import { LoginPayload, LoginResponse } from "./type";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    // Only send required fields to backend
    const { identifier, password } = payload;
    const response = await axios.post<LoginResponse>(ENDPOINTS.LOGIN, { identifier, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data.error?.message ?? "Login failed";
      console.error('Login API error:', msg);
      throw new Error(msg);
    }
    throw new Error("An unexpected error occurred");
  }
}



// Send OTP for forgot password
export const sendForgotOtp = async (email: string) => {
  const resp = await axios.post(ENDPOINTS.SEND_OTP, { email });
  return resp.data;
};

// Verify OTP for forgot password
export const verifyForgotOtp = async (email: string, otp: string) => {
  const resp = await axios.post(ENDPOINTS.VERIFY_OTP, { email, otp });
  return resp.data;
};

// Reset password after OTP verification
export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const resp = await axios.post(ENDPOINTS.RESET_PASSWORD, { email, otp, newPassword });
  return resp.data;
};

// Resend OTP for forgot password
export const resendForgotOtp = async (email: string) => {
  const resp = await axios.post(ENDPOINTS.RESEND_OTP, { email });
  return resp.data;
};
