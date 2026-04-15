import { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  Lightbulb,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useContracts } from "@/hooks/useContracts";
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

function getPeriodMultiplier(period: string) {
  switch (period) {
    case "1M":
      return 1;
    case "3M":
      return 3;
    case "6M":
      return 6;
    case "1Y":
      return 12;
    default:
      return 6;
  }
}

function buildTrendData(monthlyCost: number, period: string) {
  const labelsMap: Record<string, string[]> = {
    "1M": ["W1", "W2", "W3", "W4"],
    "3M": ["Jan", "Feb", "Mar"],
    "6M": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    "1Y": ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
  };

  const multipliersMap: Record<string, number[]> = {
    "1M": [0.9, 0.96, 1.02, 1],
    "3M": [0.88, 0.94, 1],
    "6M": [0.82, 0.88, 0.85, 0.91, 0.96, 1],
    "1Y": [0.72, 0.76, 0.8, 0.83, 0.86, 0.9, 0.88, 0.92, 0.95, 0.97, 0.99, 1],
  };

  const labels = labelsMap[period] ?? labelsMap["6M"];
  const multipliers = multipliersMap[period] ?? multipliersMap["6M"];

  const values = multipliers.map((multiplier) =>
    Math.max(0, Math.round(monthlyCost * multiplier)),
  );

  return labels.map((label, index) => ({
    label,
    amount: values[index],
  }));
}

export function AnalyticsPage() {
  const [period, setPeriod] = useState("6M");

  const { data: contracts = [], isLoading, error } = useContracts();

  const activeContracts = useMemo(
    () => contracts.filter((contract) => contract.status === "active"),
    [contracts],
  );

  const cancelledContracts = useMemo(
    () => contracts.filter((contract) => contract.status === "cancelled"),
    [contracts],
  );

  const monthlyCost = useMemo(() => {
    return activeContracts.reduce((sum, contract) => {
      if (contract.billing_cycle === "monthly") {
        return sum + contract.monthly_cost;
      }
      return sum;
    }, 0);
  }, [activeContracts]);

  const projectedCost = useMemo(() => {
    const multiplier = getPeriodMultiplier(period);
    return monthlyCost * multiplier;
  }, [monthlyCost, period]);

  const topServices = useMemo(() => {
    const total = activeContracts.reduce((sum, contract) => {
      if (contract.billing_cycle === "monthly") {
        return sum + contract.monthly_cost;
      }
      return sum;
    }, 0);

    return [...activeContracts]
      .sort((a, b) => b.monthly_cost - a.monthly_cost)
      .slice(0, 5)
      .map((contract) => ({
        name: contract.title,
        cost: formatCurrency(contract.monthly_cost, contract.currency),
        pct: total > 0 ? Math.round((contract.monthly_cost / total) * 100) : 0,
      }));
  }, [activeContracts]);

  const urgencyData = useMemo(() => {
    const counts: Record<string, number> = {
      overdue: 0,
      critical: 0,
      warning: 0,
      safe: 0,
      no_deadline: 0,
    };

    activeContracts.forEach((contract) => {
      if (counts[contract.urgency_status] !== undefined) {
        counts[contract.urgency_status] += 1;
      }
    });

    return [
      { label: "Overdue", count: counts.overdue, color: "bg-destructive" },
      { label: "Critical", count: counts.critical, color: "bg-coral" },
      { label: "Warning", count: counts.warning, color: "bg-warning" },
      { label: "Safe", count: counts.safe, color: "bg-success" },
      { label: "No Deadline", count: counts.no_deadline, color: "bg-muted-foreground" },
    ];
  }, [activeContracts]);

  const totalUrgency = useMemo(
    () => urgencyData.reduce((sum, item) => sum + item.count, 0),
    [urgencyData],
  );

  const insights = useMemo(() => {
    const urgentContracts = activeContracts.filter((contract) =>
      ["overdue", "critical", "warning"].includes(contract.urgency_status),
    ).length;

    const categories: Record<string, number> = {};
    activeContracts.forEach((contract) => {
      const value = contract.billing_cycle === "monthly" ? contract.monthly_cost : 0;
      categories[contract.category] = (categories[contract.category] || 0) + value;
    });

    const topCategory = Object.entries(categories).sort(([, a], [, b]) => b - a)[0];
    const topCategoryPct =
      topCategory && monthlyCost > 0
        ? Math.round((topCategory[1] / monthlyCost) * 100)
        : 0;

    return [
      {
        text:
          urgentContracts > 0
            ? `You have ${urgentContracts} contract${urgentContracts === 1 ? "" : "s"} that need attention soon.`
            : "No urgent contracts need attention right now.",
        type: "warning" as const,
      },
      {
        text: `Your current monthly recurring spend is ${formatCurrency(monthlyCost, "EUR")}.`,
        type: "info" as const,
      },
      {
        text: topCategory
          ? `Your top spending category is ${topCategory[0]} with ${topCategoryPct}% of your monthly spend.`
          : "Add more contracts to unlock category insights.",
        type: "info" as const,
      },
      {
        text: `You currently have ${cancelledContracts.length} cancelled contract${cancelledContracts.length === 1 ? "" : "s"}.`,
        type: "success" as const,
      },
    ];
  }, [activeContracts, cancelledContracts.length, monthlyCost]);

  const spendingTrend = useMemo(
    () => buildTrendData(monthlyCost, period),
    [monthlyCost, period],
  );

  const maxSpend = Math.max(...spendingTrend.map((item) => item.amount), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Deep insights into your subscription spending.
          </p>
        </div>

        <div className="flex gap-1">
          {["1M", "3M", "6M", "1Y"].map((value) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                period === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load analytics data.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            icon: DollarSign,
            label: "Total Monthly",
            value: formatCurrency(monthlyCost, "EUR"),
            change: "current",
            up: false,
            gradient: "bg-gradient-card-blue",
          },
          {
            icon: TrendingUp,
            label: "Projected",
            value: formatCurrency(projectedCost, "EUR"),
            change: `${period} outlook`,
            up: true,
            gradient: "bg-gradient-card-coral",
          },
          {
            icon: Calendar,
            label: "Active",
            value: String(activeContracts.length),
            change: `${activeContracts.length} contracts`,
            up: false,
            gradient: "bg-gradient-card-green",
          },
          {
            icon: AlertTriangle,
            label: "Cancelled",
            value: String(cancelledContracts.length),
            change: "overall",
            up: false,
            gradient: "bg-gradient-card-yellow",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`${kpi.gradient} rounded-2xl border border-border/30 p-5`}
          >
            <kpi.icon className="mb-2 h-5 w-5 text-muted-foreground" />

            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="font-[var(--font-display)] text-2xl font-bold">
                {kpi.value}
              </div>
            )}

            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <span
                className={`flex items-center gap-0.5 text-xs ${
                  kpi.up ? "text-coral" : "text-muted-foreground"
                }`}
              >
                {kpi.up && <ArrowUpRight className="h-3 w-3" />}
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card lg:col-span-2">
          <h3 className="mb-6 font-[var(--font-display)] font-bold">
            Spending Trend
          </h3>

          <div className="flex h-48 items-end gap-4">
            {spendingTrend.map((item) => (
              <div
                key={item.label}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <span className="text-xs font-semibold">{item.amount}€</span>
                <div
                  className="relative w-full overflow-hidden rounded-t-lg"
                  style={{ height: `${(item.amount / maxSpend) * 100}%` }}
                >
                  <div className="absolute inset-0 rounded-t-lg bg-gradient-primary opacity-80" />
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
          <h3 className="mb-4 font-[var(--font-display)] font-bold">
            By Urgency
          </h3>

          <div className="space-y-4">
            {urgencyData.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{
                      width: `${
                        totalUrgency > 0 ? (item.count / totalUrgency) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
          <h3 className="mb-4 font-[var(--font-display)] font-bold">
            Most Expensive Services
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : topServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active services available.
            </p>
          ) : (
            <div className="space-y-3">
              {topServices.map((service, index) => (
                <div key={service.name} className="flex items-center gap-3">
                  <span className="w-4 text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-xs font-bold text-primary-foreground">
                    {service.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold">{service.name}</span>
                      <span className="text-sm font-bold">{service.cost}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${
                            (service.pct /
                              Math.max(...topServices.map((item) => item.pct), 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
          <h3 className="mb-4 flex items-center gap-2 font-[var(--font-display)] font-bold">
            <Lightbulb className="h-4 w-4 text-warning" />
            Smart Insights
          </h3>

          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`rounded-xl border border-border/50 p-3 text-sm ${
                  insight.type === "warning"
                    ? "bg-warning/5"
                    : insight.type === "success"
                      ? "bg-success/5"
                      : "bg-primary/5"
                }`}
              >
                {insight.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
