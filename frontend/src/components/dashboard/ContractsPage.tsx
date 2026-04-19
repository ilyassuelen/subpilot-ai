import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Grid3X3,
  List,
  Eye,
  Edit,
  BrainCircuit,
  Bell,
  Trash2,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AddContractModal } from "@/components/contracts/AddContractModal";
import { EditContractModal } from "@/components/contracts/EditContractModal";
import { useContracts, useDeleteContract } from "@/hooks/useContracts";
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

function getUrgencyBadgeClass(urgency: string) {
  switch (urgency) {
    case "overdue":
      return "bg-destructive/10 text-destructive";
    case "critical":
      return "bg-coral/10 text-coral";
    case "warning":
      return "bg-warning/10 text-warning";
    case "safe":
      return "bg-success/10 text-success";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "active":
      return "bg-success/10 text-success";
    case "cancelled":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function ContractsPage() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [filter, setFilter] = useState<"all" | "active" | "cancelled">("all");
  const [search, setSearch] = useState("");
  const [detailContract, setDetailContract] = useState<Contract | null>(null);
  const [editContract, setEditContract] = useState<Contract | null>(null);
  const [deleteContractTarget, setDeleteContractTarget] =
    useState<Contract | null>(null);
  const [addContractOpen, setAddContractOpen] = useState(false);

  const { data: contracts = [], isLoading, error } = useContracts();
  const deleteContractMutation = useDeleteContract();

  const filtered = useMemo(() => {
    return contracts.filter((contract) => {
      if (filter === "active" && contract.status !== "active") return false;
      if (filter === "cancelled" && contract.status !== "cancelled")
        return false;

      if (search) {
        const query = search.toLowerCase();
        const matchesTitle = contract.title.toLowerCase().includes(query);
        const matchesProvider = contract.provider_name
          .toLowerCase()
          .includes(query);
        const matchesCategory = contract.category.toLowerCase().includes(query);

        if (!matchesTitle && !matchesProvider && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [contracts, filter, search]);

  const handleGenerateCancellation = () => {
    if (detailContract) {
      setDetailContract(null);
    }
    navigate({ to: "/dashboard/cancellations" });
  };

  const handleAddReminder = () => {
    if (detailContract) {
      setDetailContract(null);
    }
    navigate({ to: "/dashboard/reminders" });
  };

  const handleDeleteContract = async () => {
    if (!deleteContractTarget) return;

    await deleteContractMutation.mutateAsync(deleteContractTarget.id);

    if (detailContract?.id === deleteContractTarget.id) {
      setDetailContract(null);
    }

    if (editContract?.id === deleteContractTarget.id) {
      setEditContract(null);
    }

    setDeleteContractTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold">
            Contracts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {contracts.length} total contracts
          </p>
        </div>

        <Button
          variant="hero"
          size="sm"
          onClick={() => setAddContractOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Contract
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            className="h-9 rounded-xl pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {(["all", "active", "cancelled"] as const).map((value) => (
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

          <div className="ml-2 flex overflow-hidden rounded-lg border border-border">
            <button
              onClick={() => setViewMode("list")}
              className={`cursor-pointer p-1.5 ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`cursor-pointer p-1.5 ${
                viewMode === "card"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load contracts.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card p-10 text-center shadow-card">
          <h2 className="text-lg font-semibold">No contracts found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your filters or add a new contract.
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Contract
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    End Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Deadline
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contract) => (
                  <tr
                    key={contract.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-xs font-bold text-primary-foreground">
                          {contract.provider_name[0]}
                        </div>
                        <div>
                          <div className="font-semibold">{contract.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {contract.provider_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {contract.category}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(contract.monthly_cost, contract.currency)}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(contract.end_date)}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(contract.cancellation_deadline)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                          contract.status,
                        )}`}
                      >
                        {contract.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setDetailContract(contract)}
                          className="cursor-pointer rounded-lg p-1.5 hover:bg-muted"
                        >
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>

                        <button
                          onClick={() => setEditContract(contract)}
                          className="cursor-pointer rounded-lg p-1.5 hover:bg-muted"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>

                        <button
                          onClick={() => setDeleteContractTarget(contract)}
                          className="cursor-pointer rounded-lg p-1.5 hover:bg-muted"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>

                        <button
                          onClick={handleGenerateCancellation}
                          className="cursor-pointer rounded-lg p-1.5 hover:bg-muted"
                        >
                          <BrainCircuit className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((contract) => (
            <div
              key={contract.id}
              className="cursor-pointer rounded-2xl border border-border/50 bg-card p-5 shadow-card transition-all hover:shadow-card-hover"
              onClick={() => setDetailContract(contract)}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground">
                    {contract.provider_name[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{contract.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {contract.provider_name}
                    </div>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getUrgencyBadgeClass(
                    contract.urgency_status,
                  )}`}
                >
                  {contract.urgency_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-muted/40 p-2">
                  <span className="text-muted-foreground">Cost</span>
                  <div className="mt-0.5 font-semibold">
                    {formatCurrency(contract.monthly_cost, contract.currency)}/
                    {contract.billing_cycle === "monthly"
                      ? "mo"
                      : contract.billing_cycle}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 p-2">
                  <span className="text-muted-foreground">Deadline</span>
                  <div className="mt-0.5 font-semibold">
                    {formatDate(contract.cancellation_deadline)}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 flex-1 text-xs"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate({ to: "/dashboard/cancellations" });
                  }}
                >
                  <BrainCircuit className="h-3 w-3" />
                  Cancel
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 flex-1 text-xs"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate({ to: "/dashboard/reminders" });
                  }}
                >
                  <Bell className="h-3 w-3" />
                  Remind
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={(event) => {
                    event.stopPropagation();
                    setDeleteContractTarget(contract);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!detailContract}
        onOpenChange={(open) => !open && setDetailContract(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {detailContract && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 font-[var(--font-display)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground">
                    {detailContract.provider_name[0]}
                  </div>
                  {detailContract.title}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Provider", detailContract.provider_name],
                    ["Category", detailContract.category],
                    [
                      "Cost per Billing Cycle",
                      formatCurrency(
                        detailContract.monthly_cost,
                        detailContract.currency,
                      ),
                    ],
                    ["Billing", detailContract.billing_cycle],
                    ["Start Date", formatDate(detailContract.start_date)],
                    ["End Date", formatDate(detailContract.end_date)],
                    [
                      "Cancel Deadline",
                      formatDate(detailContract.cancellation_deadline),
                    ],
                    ["Status", detailContract.status],
                    ["Urgency", detailContract.urgency_status],
                    [
                      "Auto Renewal",
                      detailContract.auto_renewal ? "Yes" : "No",
                    ],
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
                    onClick={handleGenerateCancellation}
                  >
                    <BrainCircuit className="h-4 w-4" />
                    Generate Cancellation
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleAddReminder}
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

      <Dialog
        open={!!deleteContractTarget}
        onOpenChange={(open) => !open && setDeleteContractTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          {deleteContractTarget && (
            <>
              <DialogHeader>
                <DialogTitle>Delete Contract</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    {deleteContractTarget.title}
                  </span>
                  ?
                </p>

                <p className="text-sm text-muted-foreground">
                  This will also permanently remove all related reminders and
                  cancellation drafts.
                </p>

                {deleteContractMutation.error && (
                  <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                    {deleteContractMutation.error.message}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDeleteContractTarget(null)}
                    disabled={deleteContractMutation.isPending}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeleteContract}
                    disabled={deleteContractMutation.isPending}
                  >
                    {deleteContractMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <EditContractModal
        open={!!editContract}
        onOpenChange={(open) => !open && setEditContract(null)}
        contract={editContract}
      />

      <AddContractModal
        open={addContractOpen}
        onOpenChange={setAddContractOpen}
      />
    </div>
  );
}
