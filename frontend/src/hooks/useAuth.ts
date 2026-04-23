import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  updateCurrentUser,
} from "@/lib/api";
import { getAccessToken, removeAccessToken, setAccessToken } from "@/lib/auth";
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
  UserUpdateRequest,
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
    onSuccess: (data) => {
      setAccessToken(data.access_token);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useCurrentUser() {
  const token =
    typeof window !== "undefined" ? getAccessToken() : null;

  return useQuery<User, Error>({
    queryKey: authKeys.me(),
    queryFn: getCurrentUser,
    enabled: !!token,
    retry: false,
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UserUpdateRequest>({
    mutationFn: updateCurrentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function logout() {
  removeAccessToken();
}
