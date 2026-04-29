import { useQuery } from "@tanstack/react-query";

import { getSavingsInsights } from "@/lib/api";
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
