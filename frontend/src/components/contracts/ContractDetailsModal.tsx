import { BrainCircuit, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Contract } from "@/lib/types";

function formatCurrency(
  amount: number,
  currency: string = "EUR",
  locale: string = "de-DE",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: string | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

type ContractDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  onGenerateCancellation: () => void;
  onAddReminder: () => void;
};

export function ContractDetailsModal({
  open,
  onOpenChange,
  contract,
  onGenerateCancellation,
  onAddReminder,
}: ContractDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {contract && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 font-[var(--font-display)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground">
                  {contract.provider_name[0]}
                </div>
                {contract.title}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Provider", contract.provider_name],
                  ["Category", contract.category],
                  [
                    "Cost per Billing Cycle",
                    formatCurrency(contract.monthly_cost, contract.currency),
                  ],
                  ["Billing", contract.billing_cycle],
                  ["Start Date", formatDate(contract.start_date)],
                  ["End Date", formatDate(contract.end_date)],
                  ["Cancel Deadline", formatDate(contract.cancellation_deadline)],
                  ["Status", contract.status],
                  ["Urgency", contract.urgency_status],
                  ["Auto Renewal", contract.auto_renewal ? "Yes" : "No"],
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

              <div className="flex gap-2">
                <Button
                  variant="hero"
                  size="sm"
                  className="flex-1"
                  onClick={onGenerateCancellation}
                >
                  <BrainCircuit className="h-4 w-4" />
                  Generate Cancellation
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={onAddReminder}
                >
                  <Bell className="h-4 w-4" />
                  Add Reminder
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
