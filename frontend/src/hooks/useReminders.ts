import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createReminder,
  getReminders,
  getRemindersByContract,
  updateReminderStatuses,
  generateContractReminders,
  markReminderAsSent,
} from "@/lib/api";
import type { Reminder, ReminderCreateRequest, ReminderGenerateResponse } from "@/lib/types";

export const reminderKeys = {
  all: ["reminders"] as const,
  list: () => [...reminderKeys.all, "list"] as const,
  byContract: (contractId: number) =>
    [...reminderKeys.all, "contract", contractId] as const,
};

export function useReminders() {
  return useQuery<Reminder[], Error>({
    queryKey: reminderKeys.list(),
    queryFn: getReminders,
  });
}

export function useRemindersByContract(contractId: number) {
  return useQuery<Reminder[], Error>({
    queryKey: reminderKeys.byContract(contractId),
    queryFn: () => getRemindersByContract(contractId),
    enabled: contractId > 0,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReminderCreateRequest) => createReminder(payload),
    onSuccess: (createdReminder) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
      queryClient.invalidateQueries({
        queryKey: reminderKeys.byContract(createdReminder.contract_id),
      });
    },
  });
}

export function useUpdateReminderStatuses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReminderStatuses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}

export function useGenerateContractReminders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: number): Promise<ReminderGenerateResponse> =>
      generateContractReminders(contractId),
    onSuccess: (_, contractId) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
      queryClient.invalidateQueries({
        queryKey: reminderKeys.byContract(contractId),
      });
    },
  });
}

export function useMarkReminderAsSent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminderId: number) => markReminderAsSent(reminderId),
    onSuccess: (updatedReminder) => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
      queryClient.invalidateQueries({
        queryKey: reminderKeys.byContract(updatedReminder.contract_id),
      });
    },
  });
}
