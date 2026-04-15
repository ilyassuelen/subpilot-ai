import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createReminder,
  getReminders,
  getRemindersByContract,
} from "@/lib/api";
import type { Reminder, ReminderCreateRequest } from "@/lib/types";

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
