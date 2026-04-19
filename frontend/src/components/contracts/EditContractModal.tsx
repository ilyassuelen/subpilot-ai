import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
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
import { useUpdateContract } from "@/hooks/useContracts";
import type { Contract, ContractCreateRequest } from "@/lib/types";

const editContractSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  provider_name: z.string().min(1, "Provider name is required").max(255),
  provider_email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Invalid email address",
    ),
  category: z.string().min(1, "Category is required").max(100),
  contract_type: z.enum(
    [
      "subscription",
      "contract",
      "internet_contract",
      "mobile_contract",
      "insurance",
    ],
    { message: "Contract type is required" },
  ),
  monthly_cost: z.coerce
    .number()
    .positive("Monthly cost must be greater than 0"),
  billing_cycle: z.enum(["weekly", "monthly", "quarterly", "yearly"], {
    message: "Billing cycle is required",
  }),
  currency: z.string().min(1, "Currency is required").max(10),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().or(z.literal("")),
  auto_renewal: z.boolean(),
  cancellation_notice_days: z.coerce
    .number()
    .min(0, "Cancellation notice days must be 0 or more"),
  status: z.enum(["active", "cancelled"], {
    message: "Status is required",
  }),
  notes: z.string().optional().or(z.literal("")),
});

type EditContractFormData = z.infer<typeof editContractSchema>;

type EditContractModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
};

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function EditContractModal({
  open,
  onOpenChange,
  contract,
}: EditContractModalProps) {
  const updateContractMutation = useUpdateContract();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditContractFormData>({
    resolver: zodResolver(editContractSchema),
    defaultValues: {
      title: "",
      provider_name: "",
      provider_email: "",
      category: "",
      contract_type: "subscription",
      monthly_cost: 0,
      billing_cycle: "monthly",
      currency: "EUR",
      start_date: "",
      end_date: "",
      auto_renewal: true,
      cancellation_notice_days: 30,
      status: "active",
      notes: "",
    },
  });

  useEffect(() => {
    if (!contract) return;

    reset({
      title: contract.title,
      provider_name: contract.provider_name,
      provider_email: contract.provider_email ?? "",
      category: contract.category,
      contract_type: contract.contract_type,
      monthly_cost: contract.monthly_cost,
      billing_cycle: contract.billing_cycle,
      currency: contract.currency,
      start_date: toDateInputValue(contract.start_date),
      end_date: toDateInputValue(contract.end_date),
      auto_renewal: contract.auto_renewal,
      cancellation_notice_days: contract.cancellation_notice_days,
      status: contract.status,
      notes: contract.notes ?? "",
    });
  }, [contract, reset]);

  const closeAndReset = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: EditContractFormData) => {
    if (!contract) return;

    const payload: ContractCreateRequest = {
      title: data.title.trim(),
      provider_name: data.provider_name.trim(),
      provider_email: data.provider_email?.trim()
        ? data.provider_email.trim()
        : null,
      category: data.category.trim(),
      contract_type: data.contract_type,
      monthly_cost: data.monthly_cost,
      billing_cycle: data.billing_cycle,
      currency: data.currency.trim().toUpperCase(),
      start_date: data.start_date,
      end_date: data.end_date?.trim() ? data.end_date : null,
      auto_renewal: data.auto_renewal,
      cancellation_notice_days: data.cancellation_notice_days,
      status: data.status,
      notes: data.notes?.trim() ? data.notes.trim() : null,
    };

    await updateContractMutation.mutateAsync({
      contractId: contract.id,
      payload,
    });

    closeAndReset();
  };

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
            <Save className="h-5 w-5 text-primary" />
            Edit Contract
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title" className="text-xs">
                Title
              </Label>
              <Input
                id="title"
                className="h-9 rounded-xl"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider_name" className="text-xs">
                Provider Name
              </Label>
              <Input
                id="provider_name"
                className="h-9 rounded-xl"
                {...register("provider_name")}
              />
              {errors.provider_name && (
                <p className="text-xs text-destructive">
                  {errors.provider_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider_email" className="text-xs">
                Provider Email
              </Label>
              <Input
                id="provider_email"
                type="email"
                className="h-9 rounded-xl"
                {...register("provider_email")}
              />
              {errors.provider_email && (
                <p className="text-xs text-destructive">
                  {errors.provider_email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs">
                Category
              </Label>
              <Input
                id="category"
                className="h-9 rounded-xl"
                {...register("category")}
              />
              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_type" className="text-xs">
                Contract Type
              </Label>
              <select
                id="contract_type"
                className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                {...register("contract_type")}
              >
                <option value="subscription">Subscription</option>
                <option value="contract">Contract</option>
                <option value="internet_contract">Internet Contract</option>
                <option value="mobile_contract">Mobile Contract</option>
                <option value="insurance">Insurance</option>
              </select>
              {errors.contract_type && (
                <p className="text-xs text-destructive">
                  {errors.contract_type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_cost" className="text-xs">
                Cost per Billing Cycle
              </Label>
              <Input
                id="monthly_cost"
                type="number"
                step="0.01"
                min="0"
                className="h-9 rounded-xl"
                {...register("monthly_cost")}
              />
              {errors.monthly_cost && (
                <p className="text-xs text-destructive">
                  {errors.monthly_cost.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_cycle" className="text-xs">
                Billing Cycle
              </Label>
              <select
                id="billing_cycle"
                className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                {...register("billing_cycle")}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              {errors.billing_cycle && (
                <p className="text-xs text-destructive">
                  {errors.billing_cycle.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-xs">
                Currency
              </Label>
              <Input
                id="currency"
                className="h-9 rounded-xl"
                {...register("currency")}
              />
              {errors.currency && (
                <p className="text-xs text-destructive">
                  {errors.currency.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs">
                Status
              </Label>
              <select
                id="status"
                className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                {...register("status")}
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {errors.status && (
                <p className="text-xs text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-xs">
                Start Date
              </Label>
              <Input
                id="start_date"
                type="date"
                className="h-9 rounded-xl"
                {...register("start_date")}
              />
              {errors.start_date && (
                <p className="text-xs text-destructive">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-xs">
                End Date
              </Label>
              <Input
                id="end_date"
                type="date"
                className="h-9 rounded-xl"
                {...register("end_date")}
              />
              {errors.end_date && (
                <p className="text-xs text-destructive">
                  {errors.end_date.message}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cancellation_notice_days" className="text-xs">
                Cancellation Notice Days
              </Label>
              <Input
                id="cancellation_notice_days"
                type="number"
                min="0"
                className="h-9 rounded-xl"
                {...register("cancellation_notice_days")}
              />
              {errors.cancellation_notice_days && (
                <p className="text-xs text-destructive">
                  {errors.cancellation_notice_days.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2 sm:col-span-2">
              <input
                id="auto_renewal"
                type="checkbox"
                className="h-4 w-4"
                {...register("auto_renewal")}
              />
              <Label htmlFor="auto_renewal" className="text-sm">
                Auto renewal enabled
              </Label>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes" className="text-xs">
                Notes
              </Label>
              <textarea
                id="notes"
                className="min-h-[96px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none"
                {...register("notes")}
              />
              {errors.notes && (
                <p className="text-xs text-destructive">{errors.notes.message}</p>
              )}
            </div>
          </div>

          {updateContractMutation.error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {updateContractMutation.error.message}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={closeAndReset}
              disabled={updateContractMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={updateContractMutation.isPending}
            >
              {updateContractMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
