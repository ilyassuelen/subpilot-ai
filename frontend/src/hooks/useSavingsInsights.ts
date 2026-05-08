import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSavingsInsights, refreshSavingsInsights } from "@/lib/api";
import type { SavingsInsightsSummary } from "@/lib/types";

export const savingsInsightKeys = {
  all: ["savings-insights"] as const,
  summary: () => [...savingsInsightKeys.all, "summary"] as const,
};

export function useSavingsInsights() {
  return useQuery<SavingsInsightsSummary, Error>({
    queryKey: savingsInsightKeys.summary(),
    queryFn: getSavingsInsights,
  });
}

export function useRefreshSavingsInsights() {
  const queryClient = useQueryClient();

  return useMutation<SavingsInsightsSummary, Error>({
    mutationFn: refreshSavingsInsights,
    onSuccess: (data) => {
      queryClient.setQueryData(savingsInsightKeys.summary(), data);
    },
  });
}
