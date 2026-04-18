import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Plus,
  Check,
  Clock,
  AlertTriangle,
  Calendar,
  Mail,
  Edit,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateReminderModal } from "@/components/reminders/CreateReminderModal";
import {
  useReminders,
  useUpdateReminderStatuses,
  useGenerateContractReminders,
  useMarkReminderAsSent,
} from "@/hooks/useReminders";
import { useContracts } from "@/hooks/useContracts";
import type { Contract, Reminder } from "@/lib/types";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  sent: "bg-success/10 text-success",
  missed: "bg-destructive/10 text-destructive",
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  sent: Check,
  missed: AlertTriangle,
};

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatChannel(channel: string) {
  if (!channel) return "-";
  return channel.charAt(0).toUpperCase() + channel.slice(1);
}

function formatReminderType(type: string) {
  if (!type) return "-";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function RemindersPage() {
  const [filter, setFilter] = useState("all");
  const [detailReminder, setDetailReminder] = useState<Reminder | null>(null);
  const [createReminderOpen, setCreateReminderOpen] = useState(false);

  const {
    data: reminders = [],
    isLoading,
    error,
  } = useReminders();

  const {
    data: contracts = [],
    isLoading: contractsLoading,
  } = useContracts();

  const updateStatusesMutation = useUpdateReminderStatuses();
  const generateContractRemindersMutation = useGenerateContractReminders();
  const markReminderAsSentMutation = useMarkReminderAsSent();

  useEffect(() => {
    updateStatusesMutation.mutate();
  }, []);

  const contractMap = useMemo(() => {
    return new Map<number, Contract>(
      contracts.map((contract) => [contract.id, contract]),
    );
  }, [contracts]);

  const filtered = useMemo(() => {
    return reminders.filter((reminder) => {
      if (filter === "all") return true;
      return reminder.status === filter;
    });
  }, [reminders, filter]);

  const loading = isLoading || contractsLoading;
  const relatedDetailContract = detailReminder
    ? contractMap.get(detailReminder.contract_id)
    : null;

  const handleRegenerate = async (contractId: number) => {
    await generateContractRemindersMutation.mutateAsync(contractId);
  };

  const handleMarkAsSent = async (reminderId: number) => {
    await markReminderAsSentMutation.mutateAsync(reminderId);
    if (detailReminder?.id === reminderId) {
      setDetailReminder(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold">
            Reminders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay ahead of your renewal dates and deadlines.
          </p>
        </div>

        <Button
          variant="hero"
          size="sm"
          onClick={() => setCreateReminderOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create Reminder
        </Button>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "sent", "missed"].map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load reminders.
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card p-10 text-center shadow-card">
          <h2 className="text-lg font-semibold">No reminders found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create or generate reminders to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((reminder) => {
            const StatusIcon = statusIcons[reminder.status] ?? Clock;
            const relatedContract = contractMap.get(reminder.contract_id);

            return (
              <div
                key={reminder.id}
                className="rounded-2xl border border-border/50 bg-card p-5 shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <div className="font-[var(--font-display)] font-semibold">
                        {relatedContract?.title ??
                          `Contract #${reminder.contract_id}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatReminderType(reminder.reminder_type)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDateTime(reminder.scheduled_for)}
                      </div>
                      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {formatChannel(reminder.channel)}
                      </div>
                    </div>

                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusColors[reminder.status] ??
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {reminder.status}
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={() => setDetailReminder(reminder)}
                        className="cursor-pointer rounded-lg p-1.5 hover:bg-muted"
                      >
                        <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>

                      <button
                        onClick={() => handleMarkAsSent(reminder.id)}
                        disabled={
                          reminder.status === "sent" ||
                          markReminderAsSentMutation.isPending
                        }
                        className="cursor-pointer rounded-lg p-1.5 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>

                      <button
                        onClick={() => handleRegenerate(reminder.contract_id)}
                        disabled={generateContractRemindersMutation.isPending}
                        className="cursor-pointer rounded-lg p-1.5 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>

                {relatedContract && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-1">
                      Provider: {relatedContract.provider_name}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-1">
                      Category: {relatedContract.category}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-1">
                      Status: {relatedContract.status}
                    </span>
                  </div>
                )}

                <div className="mt-3 rounded-xl border border-border/50 bg-muted/30 p-3 text-sm text-muted-foreground">
                  {reminder.message}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!detailReminder}
        onOpenChange={(open) => !open && setDetailReminder(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {detailReminder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 font-[var(--font-display)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  Reminder Details
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    [
                      "Contract",
                      relatedDetailContract?.title ??
                        `Contract #${detailReminder.contract_id}`,
                    ],
                    ["Type", formatReminderType(detailReminder.reminder_type)],
                    ["Scheduled For", formatDateTime(detailReminder.scheduled_for)],
                    ["Channel", formatChannel(detailReminder.channel)],
                    ["Status", detailReminder.status],
                    ["Provider", relatedDetailContract?.provider_name ?? "-"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-muted/40 p-3">
                      <div className="text-[10px] text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-0.5 text-sm font-semibold capitalize">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                  <div className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Message
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {detailReminder.message}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDetailReminder(null)}
                  >
                    Close
                  </Button>

                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={() => handleRegenerate(detailReminder.contract_id)}
                    disabled={generateContractRemindersMutation.isPending}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CreateReminderModal
        open={createReminderOpen}
        onOpenChange={setCreateReminderOpen}
        contracts={contracts}
      />
    </div>
  );
}
