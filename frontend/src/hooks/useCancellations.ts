import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getCancellations,
  generateCancellationDraft,
  approveCancellation,
  cancelCancellation,
  markCancellationSent,
  getCancellationEmailPreview,
} from "@/lib/api";

import type {
  Cancellation,
  EmailPreview,
  CancellationGenerateRequest,
} from "@/lib/types";

export const cancellationKeys = {
  all: ["cancellations"] as const,
  list: () => [...cancellationKeys.all, "list"] as const,
  detail: (id: number) => [...cancellationKeys.all, "detail", id] as const,
  emailPreview: (id: number) =>
    [...cancellationKeys.all, "email-preview", id] as const,
};

/* =========================
   Queries
   ========================= */

export function useCancellations() {
  return useQuery<Cancellation[], Error>({
    queryKey: cancellationKeys.list(),
    queryFn: getCancellations,
  });
}

export function useEmailPreview(id: number) {
  return useQuery<EmailPreview, Error>({
    queryKey: cancellationKeys.emailPreview(id),
    queryFn: () => getCancellationEmailPreview(id),
    enabled: id > 0,
  });
}

/* =========================
   Mutations
   ========================= */

export function useGenerateCancellation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      data,
    }: {
      contractId: number;
      data: CancellationGenerateRequest;
    }) => generateCancellationDraft(contractId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cancellationKeys.all });
    },
  });
}

export function useApproveCancellation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => approveCancellation(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cancellationKeys.all });
    },
  });
}

export function useCancelCancellation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelCancellation(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cancellationKeys.all });
    },
  });
}

export function useMarkCancellationSent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markCancellationSent(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cancellationKeys.all });
    },
  });
}
