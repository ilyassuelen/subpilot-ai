import { useMemo, useState } from "react";
import { FileText, Bell, BrainCircuit } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useActions } from "@/hooks/useActions";
import type { ActionLog } from "@/lib/types";

const iconMap: Record<string, typeof FileText> = {
  contract: FileText,
  reminder: Bell,
  cancellation: BrainCircuit,
};

const colorMap: Record<string, string> = {
  contract: "bg-primary",
  reminder: "bg-coral",
  cancellation: "bg-chart-4",
};

function formatRelativeDateTime(date: string) {
  const now = new Date();
  const value = new Date(date);
  const diffMs = now.getTime() - value.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function formatActionType(actionType: string) {
  if (!actionType) return "-";
  return actionType
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ActivityPage() {
  const [typeFilter, setTypeFilter] = useState("all");

  const {
    data: actions = [],
    isLoading,
    error,
  } = useActions();

  const filtered = useMemo(() => {
    return actions.filter((action) => {
      if (typeFilter === "all") return true;
      return action.entity_type === typeFilter;
    });
  }, [actions, typeFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[var(--font-display)] text-2xl font-bold">
          Activity
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A complete timeline of all actions and events.
        </p>
      </div>

      <div className="flex gap-2">
        {["all", "contract", "reminder", "cancellation"].map((value) => (
          <button
            key={value}
            onClick={() => setTypeFilter(value)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              typeFilter === value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {value === "all" ? "All" : `${value}s`}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load activity.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card p-10 text-center shadow-card">
          <h2 className="text-lg font-semibold">No activity found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Once actions happen in the app, they will appear here.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute bottom-0 left-5 top-0 w-px bg-border" />
          <div className="space-y-1">
            {filtered.map((action: ActionLog) => {
              const Icon = iconMap[action.entity_type] || FileText;
              const color = colorMap[action.entity_type] || "bg-muted-foreground";

              return (
                <div
                  key={action.id}
                  className="relative flex gap-4 rounded-xl py-3 pl-10 transition-colors hover:bg-muted/20"
                >
                  <div
                    className={`absolute left-3 top-5 flex h-5 w-5 items-center justify-center rounded-full ${color}`}
                  >
                    <Icon className="h-3 w-3 text-primary-foreground" />
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-semibold">
                      {formatActionType(action.action_type)}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {action.message}
                    </div>
                  </div>

                  <div className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeDateTime(action.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
