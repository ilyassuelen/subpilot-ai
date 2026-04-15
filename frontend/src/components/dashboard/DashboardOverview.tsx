import { useMemo } from "react";
import {
  DollarSign,
  Calendar,
  AlertTriangle,
  FileText,
  Plus,
  BrainCircuit,
  Bell,
  BarChart3,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useContracts } from "@/hooks/useContracts";
import { useReminders } from "@/hooks/useReminders";
import { useActions } from "@/hooks/useActions";
import type { ActionLog, Contract } from "@/lib/types";

const actionColors: Record<string, string> = {
  contract: "bg-primary",
  reminder: "bg-coral",
  cancellation: "bg-success",
};

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

function formatMonthDay(date: string | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(date));
}

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

  return formatDate(date);
}

function mapActionTypeToColor(action: ActionLog) {
  if (action.entity_type === "contract") return actionColors.contract;
  if (action.entity_type === "reminder") return actionColors.reminder;
  if (action.entity_type === "cancellation") return actionColors.cancellation;
  return "bg-warning";
}

function buildMonthlyTrend(activeContracts: Contract[]) {
  const currentMonthlyTotal = activeContracts.reduce(
    (sum, contract) =>
      contract.billing_cycle === "monthly" ? sum + contract.monthly_cost : sum,
    0,
  );

  const multipliers = [
    0.78, 0.82, 0.8, 0.87, 0.85, 0.84, 0.9, 0.88, 0.94, 0.98, 1.02, 1,
  ];
  const months = [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
  ];

  const values = multipliers.map((multiplier) =>
    Math.max(0, Math.round(currentMonthlyTotal * multiplier)),
  );

  return {
    months,
    values,
    maxVal: Math.max(...values, 1),
  };
}

function buildAttentionIssue(contract: Contract) {
  switch (contract.urgency_status) {
    case "overdue":
      return "Cancellation deadline already passed";
    case "critical":
      return "Cancellation deadline approaching";
    case "warning":
      return "Review deadline soon";
    default:
      return "Review recommended";
  }
}

export function DashboardOverview() {
  const {
    data: contracts = [],
    isLoading: loadingContracts,
    error: contractsError,
  } = useContracts();

  const {
    data: reminders = [],
    isLoading: loadingReminders,
  } = useReminders();

  const {
    data: actions = [],
    isLoading: loadingActions,
  } = useActions();

  const isLoading = loadingContracts || loadingReminders || loadingActions;

  const activeContracts = useMemo(
    () => contracts.filter((contract) => contract.status === "active"),
    [contracts],
  );

  const kpis = useMemo(() => {
    const monthlyCost = activeContracts.reduce(
      (sum, contract) =>
        contract.billing_cycle === "monthly" ? sum + contract.monthly_cost : sum,
      0,
    );

    const upcomingRenewals = activeContracts.filter(
      (contract) => contract.end_date || contract.cancellation_deadline,
    ).length;

    const criticalDeadlines = activeContracts.filter((contract) =>
      ["critical", "overdue"].includes(contract.urgency_status),
    ).length;

    return [
      {
        icon: FileText,
        label: "Active Contracts",
        value: String(activeContracts.length),
        change: `${contracts.length} total`,
        gradient: "bg-gradient-card-blue",
      },
      {
        icon: DollarSign,
        label: "Monthly Cost",
        value: formatCurrency(monthlyCost, "EUR"),
        change: "current",
        gradient: "bg-gradient-card-coral",
      },
      {
        icon: Calendar,
        label: "Upcoming Renewals",
        value: String(upcomingRenewals),
        change: `${reminders.length} reminders`,
        gradient: "bg-gradient-card-green",
      },
      {
        icon: AlertTriangle,
        label: "Critical Deadlines",
        value: String(criticalDeadlines),
        change: criticalDeadlines > 0 ? "Action needed" : "All clear",
        gradient: "bg-gradient-card-yellow",
      },
    ];
  }, [activeContracts, contracts.length, reminders.length]);

  const upcomingCharges = useMemo(() => {
    return activeContracts
      .filter((contract) => contract.end_date || contract.cancellation_deadline)
      .sort((a, b) => {
        const dateA = new Date(
          a.cancellation_deadline ?? a.end_date ?? "9999-12-31",
        ).getTime();
        const dateB = new Date(
          b.cancellation_deadline ?? b.end_date ?? "9999-12-31",
        ).getTime();
        return dateA - dateB;
      })
      .slice(0, 5)
      .map((contract) => ({
        name: contract.title,
        date: formatMonthDay(contract.end_date ?? contract.cancellation_deadline),
        amount: formatCurrency(contract.monthly_cost, contract.currency),
        urgent: ["critical", "overdue"].includes(contract.urgency_status),
      }));
  }, [activeContracts]);

  const categories = useMemo(() => {
    const total = activeContracts.reduce(
      (sum, contract) =>
        contract.billing_cycle === "monthly" ? sum + contract.monthly_cost : sum,
      0,
    );

    const grouped: Record<string, number> = {};
    activeContracts.forEach((contract) => {
      const value =
        contract.billing_cycle === "monthly" ? contract.monthly_cost : 0;
      grouped[contract.category] = (grouped[contract.category] || 0) + value;
    });

    const colorMap: Record<string, string> = {
      Streaming: "bg-primary",
      Software: "bg-chart-4",
      Telecom: "bg-coral",
      Fitness: "bg-success",
      Handy: "bg-coral",
      Sport: "bg-success",
    };

    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .map(([name, cost]) => ({
        name,
        pct: total > 0 ? Math.round((cost / total) * 100) : 0,
        color: colorMap[name] || "bg-warning",
      }));
  }, [activeContracts]);

  const attentionContracts = useMemo(() => {
    return activeContracts
      .filter((contract) =>
        ["overdue", "critical", "warning"].includes(contract.urgency_status),
      )
      .slice(0, 3)
      .map((contract) => ({
        name: contract.title,
        issue: buildAttentionIssue(contract),
        urgency: contract.urgency_status,
      }));
  }, [activeContracts]);

  const recentActions = useMemo(() => actions.slice(0, 4), [actions]);

  const trend = useMemo(
    () => buildMonthlyTrend(activeContracts),
    [activeContracts],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back! Here&apos;s your subscription summary.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/dashboard/cancellations">
            <Button variant="outline" size="sm">
              <BrainCircuit className="h-4 w-4" />
              Generate Cancellation
            </Button>
          </Link>

          <Button variant="hero" size="sm" asChild>
            <Link to="/dashboard/contracts">
              <Plus className="h-4 w-4" />
              Add Contract
            </Link>
          </Button>
        </div>
      </div>

      {contractsError && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load dashboard data.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`${kpi.gradient} rounded-2xl border border-border/30 p-5`}
          >
            <div className="mb-3 flex items-center justify-between">
              <kpi.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {kpi.change}
              </span>
            </div>

            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="font-[var(--font-display)] text-2xl font-bold">
                {kpi.value}
              </div>
            )}

            <div className="mt-1 text-xs text-muted-foreground">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card lg:col-span-2">
          <h3 className="mb-4 font-[var(--font-display)] font-bold">
            Monthly Cost Trend
          </h3>

          <div className="flex h-36 items-end gap-2">
            {trend.values.map((value, index) => (
              <div
                key={trend.months[index]}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div
                  className="relative w-full overflow-hidden rounded-t-md"
                  style={{ height: `${(value / trend.maxVal) * 100}%` }}
                >
                  <div className="absolute inset-0 rounded-t-md bg-gradient-primary opacity-75" />
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {trend.months[index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
          <h3 className="mb-4 font-[var(--font-display)] font-bold">
            By Category
          </h3>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-full" />
              ))
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No category data available.
              </p>
            ) : (
              categories.map((category) => (
                <div key={category.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{category.name}</span>
                    <span className="text-muted-foreground">{category.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${category.color}`}
                      style={{ width: `${category.pct}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
          <h3 className="mb-4 font-[var(--font-display)] font-bold">
            Upcoming Charges
          </h3>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))
            ) : upcomingCharges.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming charges available.
              </p>
            ) : (
              upcomingCharges.map((charge) => (
                <div
                  key={`${charge.name}-${charge.date}`}
                  className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5 transition-colors hover:bg-muted/60"
                >
                  <div>
                    <div className="text-sm font-semibold">{charge.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {charge.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{charge.amount}</span>
                    {charge.urgent && (
                      <span className="h-2 w-2 rounded-full bg-coral" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
          <h3 className="mb-4 font-[var(--font-display)] font-bold">
            Recent Activity
          </h3>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))
            ) : recentActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity available.
              </p>
            ) : (
              recentActions.map((action) => (
                <div key={action.id} className="flex gap-3">
                  <div
                    className={`mt-2 h-2 w-2 shrink-0 rounded-full ${mapActionTypeToColor(
                      action,
                    )}`}
                  />
                  <div>
                    <div className="text-sm font-semibold capitalize">
                      {action.action_type}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {action.message}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {formatRelativeDateTime(action.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
          <h3 className="mb-4 font-[var(--font-display)] font-bold">
            ⚠️ Needs Attention
          </h3>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
              ))
            ) : attentionContracts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No urgent contracts right now.
              </p>
            ) : (
              attentionContracts.map((contract) => (
                <div
                  key={contract.name}
                  className="rounded-xl border border-border/50 bg-muted/30 p-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold">{contract.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        contract.urgency === "overdue" ||
                        contract.urgency === "critical"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {contract.urgency}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contract.issue}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/dashboard/reminders">
                <Bell className="h-3 w-3" />
                Reminders
              </Link>
            </Button>

            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/dashboard/analytics">
                <BarChart3 className="h-3 w-3" />
                Analytics
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
