/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { login as loginUser } from "@/api/authApi";

export function useLogin() {
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: loginUser,

    onSuccess: async (data, variables) => {
      console.log("LOGIN SUCCESS DATA:", data);

      const userData = {
        id: data.user.id.toString(),
        email: data.user.email,
        username: data.user.username,
        name: `${data.user.firstName} ${data.user.lastName}`,
        phoneNumber: data.user.phoneNumber,
        token: data.jwt,

        // USE THIS DIRECTLY
        isVerified: data.user.confirmed,

        role: data.user.role,
        Profile_image: data.user.Profile_image,
        dob: data.user.dob,
        currency: data.user.currency,
        blocked: data.user.blocked,
      };

      setUser(userData, (variables as any)?.rememberMe);
    },

    onError: (error: unknown) => {
      console.warn("LOGIN ERROR:", error);

      const msg =
        error instanceof Error
          ? error.message
          : "Login failed";

      console.warn(msg);
    },
  });
}