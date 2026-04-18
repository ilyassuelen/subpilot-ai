import { Loader2, Plus, Bell } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateReminder } from "@/hooks/useReminders";
import type { Contract, ReminderCreateRequest } from "@/lib/types";

function toLocalDateTimeInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function buildReminderMessage(contract: Contract, reminderType: string) {
  if (reminderType === "cancellation") {
    return `Reminder: '${contract.title}' reaches its cancellation deadline soon.`;
  }

  if (reminderType === "renewal") {
    return `Reminder: '${contract.title}' is renewing soon.`;
  }

  return "";
}

const createReminderSchema = z.object({
  contract_id: z.coerce.number().positive("Please select a contract"),
  reminder_type: z.string().min(1, "Reminder type is required").max(100),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(255, "Message must be at most 255 characters"),
  scheduled_for: z
    .string()
    .min(1, "Scheduled date is required")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Invalid scheduled date",
    })
    .refine((value) => new Date(value).getTime() > Date.now(), {
      message: "Scheduled date must be in the future",
    }),
  channel: z.string().min(1, "Channel is required").max(50),
});

type CreateReminderFormData = z.infer<typeof createReminderSchema>;

type CreateReminderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contracts: Contract[];
};

export function CreateReminderModal({
  open,
  onOpenChange,
  contracts,
}: CreateReminderModalProps) {
  const createReminderMutation = useCreateReminder();

  const activeContracts = useMemo(
    () => contracts.filter((contract) => contract.status === "active"),
    [contracts],
  );

  const defaultScheduledFor = useMemo(() => {
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    return toLocalDateTimeInputValue(nextHour);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateReminderFormData>({
    resolver: zodResolver(createReminderSchema),
    defaultValues: {
      contract_id: 0,
      reminder_type: "cancellation",
      message: "",
      scheduled_for: defaultScheduledFor,
      channel: "app",
    },
  });

  const selectedContractId = watch("contract_id");
  const selectedReminderType = watch("reminder_type");

  const selectedContract =
    selectedContractId > 0
      ? activeContracts.find(
          (contract) => contract.id === Number(selectedContractId),
        )
      : undefined;

  const closeAndReset = () => {
    reset({
      contract_id: 0,
      reminder_type: "cancellation",
      message: "",
      scheduled_for: defaultScheduledFor,
      channel: "app",
    });
    onOpenChange(false);
  };

  const handleReminderTypeChange = (value: string) => {
    setValue("reminder_type", value, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (!selectedContract) {
      if (value === "custom") {
        setValue("message", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      return;
    }

    if (value === "custom") {
      setValue("message", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }

    setValue("message", buildReminderMessage(selectedContract, value), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleContractChange = (contractId: number) => {
    const contract = activeContracts.find((item) => item.id === contractId);

    setValue("contract_id", contractId, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (!contract || selectedReminderType === "custom") {
      return;
    }

    setValue("message", buildReminderMessage(contract, selectedReminderType), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: CreateReminderFormData) => {
    const payload: ReminderCreateRequest = {
      contract_id: Number(data.contract_id),
      reminder_type: data.reminder_type.trim(),
      message: data.message.trim(),
      scheduled_for: new Date(data.scheduled_for).toISOString(),
      channel: data.channel.trim(),
    };

    await createReminderMutation.mutateAsync(payload);
    closeAndReset();
  };

  const isSubmitDisabled =
    createReminderMutation.isPending || activeContracts.length === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeAndReset();
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-[var(--font-display)]">
            <Bell className="h-5 w-5 text-primary" />
            Create Reminder
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="contract_id" className="text-xs">
                Contract
              </Label>
              <select
                id="contract_id"
                className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                value={selectedContractId || 0}
                onChange={(e) => handleContractChange(Number(e.target.value))}
              >
                <option value={0}>Select a contract</option>
                {activeContracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.title} — {contract.provider_name}
                  </option>
                ))}
              </select>
              {errors.contract_id && (
                <p className="text-xs text-destructive">
                  {errors.contract_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_type" className="text-xs">
                Reminder Type
              </Label>
              <select
                id="reminder_type"
                className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                value={selectedReminderType}
                onChange={(e) => handleReminderTypeChange(e.target.value)}
              >
                <option value="cancellation">Cancellation</option>
                <option value="renewal">Renewal</option>
                <option value="custom">Custom</option>
              </select>
              {errors.reminder_type && (
                <p className="text-xs text-destructive">
                  {errors.reminder_type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel" className="text-xs">
                Channel
              </Label>
              <select
                id="channel"
                className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                {...register("channel")}
              >
                <option value="app">App</option>
                <option value="email">Email</option>
              </select>
              {errors.channel && (
                <p className="text-xs text-destructive">
                  {errors.channel.message}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="scheduled_for" className="text-xs">
                Scheduled For
              </Label>
              <Input
                id="scheduled_for"
                type="datetime-local"
                className="h-9 rounded-xl"
                {...register("scheduled_for")}
              />
              {errors.scheduled_for && (
                <p className="text-xs text-destructive">
                  {errors.scheduled_for.message}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="message" className="text-xs">
                Message
              </Label>
              <textarea
                id="message"
                placeholder="Reminder message..."
                className="min-h-[110px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none"
                {...register("message")}
              />
              {errors.message && (
                <p className="text-xs text-destructive">
                  {errors.message.message}
                </p>
              )}
            </div>
          </div>

          {activeContracts.length === 0 && (
            <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
              No active contracts available. Create an active contract first.
            </div>
          )}

          {createReminderMutation.error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {createReminderMutation.error.message}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={closeAndReset}
              disabled={createReminderMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={isSubmitDisabled}
            >
              {createReminderMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Reminder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
