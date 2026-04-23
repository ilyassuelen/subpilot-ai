import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getCurrentUser, loginUser, registerUser } from "@/lib/api";
import { getAccessToken, removeAccessToken, setAccessToken } from "@/lib/auth";
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from "@/lib/types";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useRegister() {
  return useMutation<User, Error, RegisterRequest>({
    mutationFn: registerUser,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<TokenResponse, Error, LoginRequest>({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      setAccessToken(data.access_token);
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useCurrentUser() {
  const token = getAccessToken();

  return useQuery<User, Error>({
    queryKey: authKeys.me(),
    queryFn: getCurrentUser,
    enabled: !!token,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    removeAccessToken();
    queryClient.removeQueries({ queryKey: authKeys.me() });
  };
}
