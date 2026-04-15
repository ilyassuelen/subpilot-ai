import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createContract, getContracts } from "@/lib/api";
import type { Contract, ContractCreateRequest } from "@/lib/types";

export const contractKeys = {
  all: ["contracts"] as const,
  list: () => [...contractKeys.all, "list"] as const,
};

export function useContracts() {
  return useQuery<Contract[], Error>({
    queryKey: contractKeys.list(),
    queryFn: getContracts,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ContractCreateRequest) => createContract(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}
