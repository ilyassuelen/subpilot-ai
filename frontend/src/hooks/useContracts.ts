import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createContract, getContracts, updateContract } from "@/lib/api";
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

export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      payload,
    }: {
      contractId: number;
      payload: ContractCreateRequest;
    }) => updateContract(contractId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}
