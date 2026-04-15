import { useQuery } from "@tanstack/react-query";

import { getActionLogs, getActionLogsByEntity } from "@/lib/api";
import type { ActionLog } from "@/lib/types";

export const actionKeys = {
  all: ["actions"] as const,
  list: () => [...actionKeys.all, "list"] as const,
  byEntity: (entityType: string, entityId: number) =>
    [...actionKeys.all, "entity", entityType, entityId] as const,
};

export function useActions() {
  return useQuery<ActionLog[], Error>({
    queryKey: actionKeys.list(),
    queryFn: getActionLogs,
  });
}

export function useActionsByEntity(entityType: string, entityId: number) {
  return useQuery<ActionLog[], Error>({
    queryKey: actionKeys.byEntity(entityType, entityId),
    queryFn: () => getActionLogsByEntity(entityType, entityId),
    enabled: Boolean(entityType) && entityId > 0,
  });
}
