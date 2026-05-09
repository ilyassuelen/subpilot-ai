import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateContract } from "@/hooks/useContracts";
import type { Contract, ContractCreateRequest } from "@/lib/types";

const comparisonAttributeSchema = z.object({
  label: z.string().min(1, "Detail is required"),
  value: z.string().min(1, "Value is required"),
  unit: z.string().optional().or(z.literal("")),
});

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
  plan_name: z.string().optional().or(z.literal("")),
  category: z.string().min(1, "Category is required").max(100),
  contract_type: z.enum(
    ["subscription", "contract", "internet_contract", "mobile_contract", "insurance"],
    { message: "Contract type is required" },
  ),
  monthly_cost: z.coerce.number().positive("Monthly cost must be greater than 0"),
  billing_cycle: z.enum(["weekly", "monthly", "quarterly", "yearly"], {
    message: "Billing cycle is required",
  }),
  currency: z.string().min(1, "Currency is required").max(10),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().or(z.literal("")),
  auto_renewal: z.boolean(),
  cancellation_notice_days: z.coerce.number().min(0, "Cancellation notice days must be 0 or more"),
  status: z.enum(["active", "cancelled"], { message: "Status is required" }),
  notes: z.string().optional().or(z.literal("")),
  comparison_attributes: z.array(comparisonAttributeSchema).default([]),
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

function normalizeComparisonAttributes(attributes: EditContractFormData["comparison_attributes"]) {
  return attributes
    .map((attribute) => ({
      label: attribute.label.trim(),
      value: attribute.value.trim(),
      unit: attribute.unit?.trim() ? attribute.unit.trim() : null,
    }))
    .filter((attribute) => attribute.label && attribute.value);
}

export function EditContractModal({ open, onOpenChange, contract }: EditContractModalProps) {
  const updateContractMutation = useUpdateContract();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditContractFormData>({
    resolver: zodResolver(editContractSchema),
    defaultValues: {
      title: "",
      provider_name: "",
      provider_email: "",
      plan_name: "",
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
      comparison_attributes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "comparison_attributes" });

  useEffect(() => {
    if (!contract) return;

    reset({
      title: contract.title,
      provider_name: contract.provider_name,
      provider_email: contract.provider_email ?? "",
      plan_name: contract.plan_name ?? "",
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
      comparison_attributes: contract.comparison_attributes ?? [],
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
      provider_email: data.provider_email?.trim() ? data.provider_email.trim() : null,
      plan_name: data.plan_name?.trim() ? data.plan_name.trim() : null,
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
      comparison_attributes: normalizeComparisonAttributes(data.comparison_attributes),
    };

    await updateContractMutation.mutateAsync({ contractId: contract.id, payload });
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
            <Save className="h-5 w-5 text-primary" /> Edit Contract
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-title" className="text-xs">Title</Label>
              <Input id="edit-title" className="h-9 rounded-xl" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-provider_name" className="text-xs">Provider</Label>
              <Input id="edit-provider_name" className="h-9 rounded-xl" {...register("provider_name")} />
              {errors.provider_name && <p className="text-xs text-destructive">{errors.provider_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-plan_name" className="text-xs">Plan / Tariff</Label>
              <Input id="edit-plan_name" className="h-9 rounded-xl" {...register("plan_name")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-provider_email" className="text-xs">Provider Email</Label>
              <Input id="edit-provider_email" type="email" className="h-9 rounded-xl" {...register("provider_email")} />
              {errors.provider_email && <p className="text-xs text-destructive">{errors.provider_email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-xs">Category</Label>
              <Input id="edit-category" className="h-9 rounded-xl" {...register("category")} />
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contract_type" className="text-xs">Contract Type</Label>
              <select id="edit-contract_type" className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register("contract_type")}>
                <option value="subscription">Subscription</option>
                <option value="contract">Contract</option>
                <option value="internet_contract">Internet Contract</option>
                <option value="mobile_contract">Mobile Contract</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-monthly_cost" className="text-xs">Cost</Label>
              <Input id="edit-monthly_cost" type="number" step="0.01" className="h-9 rounded-xl" {...register("monthly_cost")} />
              {errors.monthly_cost && <p className="text-xs text-destructive">{errors.monthly_cost.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-billing_cycle" className="text-xs">Billing Cycle</Label>
              <select id="edit-billing_cycle" className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register("billing_cycle")}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-currency" className="text-xs">Currency</Label>
              <Input id="edit-currency" className="h-9 rounded-xl" {...register("currency")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-start_date" className="text-xs">Start Date</Label>
              <Input id="edit-start_date" type="date" className="h-9 rounded-xl" {...register("start_date")} />
              {errors.start_date && <p className="text-xs text-destructive">{errors.start_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-end_date" className="text-xs">End Date</Label>
              <Input id="edit-end_date" type="date" className="h-9 rounded-xl" {...register("end_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cancellation_notice_days" className="text-xs">Notice Days</Label>
              <Input id="edit-cancellation_notice_days" type="number" className="h-9 rounded-xl" {...register("cancellation_notice_days")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status" className="text-xs">Status</Label>
              <select id="edit-status" className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm" {...register("status")}>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input id="edit-auto_renewal" type="checkbox" className="h-4 w-4" {...register("auto_renewal")} />
              <Label htmlFor="edit-auto_renewal" className="text-xs">Auto renewal</Label>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Important details for AI savings</h3>
                <p className="text-xs text-muted-foreground">Add details the agent should preserve, like bandwidth, data volume, yearly usage, storage or seats.</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => append({ label: "", value: "", unit: "" })}>
                <Plus className="h-4 w-4" /> Add Detail
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="text-xs text-muted-foreground">No details added yet.</p>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                    <Input placeholder="Detail, e.g. Bandwidth" className="h-9 rounded-xl" {...register(`comparison_attributes.${index}.label`)} />
                    <Input placeholder="Value, e.g. 250" className="h-9 rounded-xl" {...register(`comparison_attributes.${index}.value`)} />
                    <Input placeholder="Unit, e.g. Mbit/s" className="h-9 rounded-xl" {...register(`comparison_attributes.${index}.unit`)} />
                    <Button type="button" size="icon" variant="ghost" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="text-xs">Notes</Label>
            <Textarea id="edit-notes" placeholder="Optional notes" className="min-h-20 rounded-xl" {...register("notes")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeAndReset}>Cancel</Button>
            <Button type="submit" disabled={updateContractMutation.isPending}>
              {updateContractMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
