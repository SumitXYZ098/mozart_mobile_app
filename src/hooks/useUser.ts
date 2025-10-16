import { CreateUserPlayLoad, User } from "@/api/type";
import { checkEmailStatus, createUser, getUsersList, sendVerificationEmail } from "@/api/userApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMutation, useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import React from "react";

export const useCreateUser = () => {
  const { setUser } = useAuthStore();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPlayLoad) => {
      return createUser(payload);
    },
    onSuccess: async (data) => {
      const status = await checkEmailStatus(data.user.email);
      if (status.verified) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          token: data.jwt,
          name: `${data.user.firstName} ${data.user.lastName}`,
          phoneNumber: data.user.phoneNumber,
          isVerified: status.verified,
          role: data.user.role,
        });
        queryClient.invalidateQueries({ queryKey: ["usersList"] });
      }
    },
  });
};

export function useSendEmailVerification() {
  return useMutation({
    mutationFn: sendVerificationEmail,
  });
}

// User List
export function useUsersList(): UseQueryResult<User[], Error> {
  const { setUsersList, setError } = useAuthStore();

  const query = useQuery<User[], Error>({
    queryKey: ["usersList"],
    queryFn: getUsersList,
  });

  React.useEffect(() => {
    if (query.data) {
      setUsersList(query.data); // store setter
    }
    if (query.error) {
      setError?.(query.error.message || "Failed to fetch usersList");
    }
  }, [query.data, query.error, setUsersList, setError]);

  return query;
}
