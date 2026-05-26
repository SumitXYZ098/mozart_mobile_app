import { useMutation } from '@tanstack/react-query';
import { sendForgotOtp, verifyForgotOtp, resetPassword, resendForgotOtp } from '@/api/authApi';

// Send OTP to email for password reset
export const useSendForgotOtp = () =>
  useMutation({ mutationFn: (email: string) => sendForgotOtp(email) });

// Verify OTP entered by user
export const useVerifyForgotOtp = () =>
  useMutation({ mutationFn: ({ email, otp }: { email: string; otp: string }) => verifyForgotOtp(email, otp) });

// Reset password after OTP verification
export const useResetPassword = () =>
  useMutation({ mutationFn: ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) =>
    resetPassword(email, otp, newPassword)
  });

// Resend OTP if needed
export const useResendForgotOtp = () =>
  useMutation({ mutationFn: (email: string) => resendForgotOtp(email) });
