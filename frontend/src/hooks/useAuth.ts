import { useMutation, useQuery } from "@tanstack/react-query";

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
  return useMutation<TokenResponse, Error, LoginRequest>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setAccessToken(data.access_token);
    },
  });
}

export function useCurrentUser() {
  return useQuery<User, Error>({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const token = getAccessToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      return getCurrentUser(token);
    },
    enabled: !!getAccessToken(),
    retry: false,
  });
}

export function logout() {
  removeAccessToken();
}
