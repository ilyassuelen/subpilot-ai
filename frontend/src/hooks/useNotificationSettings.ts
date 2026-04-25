import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotificationSettings,
  updateNotificationSettings,
} from "@/lib/api";

import type {
  NotificationSettings,
  NotificationSettingsUpdateRequest,
} from "@/lib/types";

export const notificationSettingsKeys = {
  all: ["notification-settings"] as const,
  detail: () => [...notificationSettingsKeys.all, "detail"] as const,
};

export function useNotificationSettings() {
  return useQuery<NotificationSettings, Error>({
    queryKey: notificationSettingsKeys.detail(),
    queryFn: getNotificationSettings,
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation<
    NotificationSettings,
    Error,
    NotificationSettingsUpdateRequest
  >({
    mutationFn: updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationSettingsKeys.all,
      });
    },
  });
}
