/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { checkEmailStatus } from "@/api/userApi";
import { login as loginUser } from "@/api/authApi";

export function useLogin() {
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data, variables) => {
      const status = await checkEmailStatus(data.user.email);
      const userData = {
        id: data.user.id.toString(),
        email: data.user.email,
        username: data.user.username,
        name: `${data.user.firstName} ${data.user.lastName}`,
        phoneNumber: data.user.phoneNumber,
        token: data.jwt,
        isVerified: status.isVerified ?? status.verified ?? false,
        role: data.user.role,
        Profile_image: data.user.Profile_image,
        dob: data.user.dob,
        currency: data.user.currency,
        blocked: data.user.blocked,
      };

      // Store in Zustand + local/session storage
      setUser(userData, (variables as any)?.rememberMe);
    },
  });
}
