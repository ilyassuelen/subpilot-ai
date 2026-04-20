import { useMemo, useState } from "react";
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  Lightbulb,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useContracts } from "@/hooks/useContracts";
import {
  buildRecurringTrend,
  getNormalizedMonthlyCost,
} from "@/lib/contractAnalytics";

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

export function AnalyticsPage() {
  const [period, setPeriod] = useState("6M");
  const { data: contracts = [], isLoading } = useContracts();

  const active = useMemo(
    () => contracts.filter((contract) => contract.status === "active"),
    [contracts],
  );

  const cancelled = useMemo(
    () => contracts.filter((contract) => contract.status === "cancelled"),
    [contracts],
  );

  const recurringCost = useMemo(
    () =>
      active.reduce(
        (sum, contract) => sum + getNormalizedMonthlyCost(contract),
        0,
      ),
    [active],
  );

  const topServices = useMemo(() => {
    const total = active.reduce(
      (sum, contract) => sum + getNormalizedMonthlyCost(contract),
      0,
    );

    return [...active]
      .sort(
        (a, b) => getNormalizedMonthlyCost(b) - getNormalizedMonthlyCost(a),
      )
      .slice(0, 5)
      .map((contract) => ({
        name: contract.title,
        cost: formatCurrency(
          getNormalizedMonthlyCost(contract),
          contract.currency,
        ),
        pct:
          total > 0
            ? Math.round((getNormalizedMonthlyCost(contract) / total) * 100)
            : 0,
      }));
  }, [active]);

  const urgencyData = useMemo(() => {
    const counts: Record<string, number> = {
      overdue: 0,
      critical: 0,
      warning: 0,
      safe: 0,
      no_deadline: 0,
    };

    active.forEach((contract) => {
      if (counts[contract.urgency_status] !== undefined) {
        counts[contract.urgency_status]++;
      }
    });

    return [
      { label: "Overdue", count: counts.overdue, color: "bg-destructive" },
      { label: "Critical", count: counts.critical, color: "bg-coral" },
      { label: "Warning", count: counts.warning, color: "bg-warning" },
      { label: "Safe", count: counts.safe, color: "bg-success" },
      {
        label: "No Deadline",
        count: counts.no_deadline,
        color: "bg-muted-foreground",
      },
    ];
  }, [active]);

  const totalUrgency = useMemo(
    () => urgencyData.reduce((sum, urgency) => sum + urgency.count, 0),
    [urgencyData],
  );

  const insights = useMemo(() => {
    const highUrgent = active.filter((contract) =>
      ["overdue", "critical", "warning"].includes(contract.urgency_status),
    ).length;

    const categories: Record<string, number> = {};
    active.forEach((contract) => {
      categories[contract.category] =
        (categories[contract.category] || 0) +
        getNormalizedMonthlyCost(contract);
    });

    const topCategory = Object.entries(categories).sort(
      ([, a], [, b]) => b - a,
    )[0];

    const topCategoryPct =
      topCategory && recurringCost > 0
        ? Math.round((topCategory[1] / recurringCost) * 100)
        : 0;

    return [
      {
        text: `You have ${highUrgent} contract${highUrgent === 1 ? "" : "s"} that need${highUrgent === 1 ? "s" : ""} attention soon.`,
        type: "warning" as const,
      },
      {
        text: `Your current recurring spend is ${formatCurrency(recurringCost)}.`,
        type: "info" as const,
      },
      {
        text: topCategory
          ? `Your top spending category is ${topCategory[0]} with ${topCategoryPct}% of your recurring spend.`
          : "Add contracts to see insights.",
        type: "info" as const,
      },
      {
        text: `You currently have ${cancelled.length} cancelled contract${cancelled.length === 1 ? "" : "s"}.`,
        type: "success" as const,
      },
    ];
  }, [active, cancelled.length, recurringCost]);

  const monthsCount =
    period === "1M" ? 1 : period === "3M" ? 3 : period === "6M" ? 6 : 12;

  const recurringSpending = useMemo(() => {
    return buildRecurringTrend(active, monthsCount);
  }, [active, monthsCount]);

  const trendMin = useMemo(() => {
    return Math.min(...recurringSpending.points.map((point) => point.amount));
  }, [recurringSpending]);

  const trendRange = useMemo(() => {
    return Math.max(recurringSpending.maxAmount - trendMin, 1);
  }, [recurringSpending, trendMin]);

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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            icon: DollarSign,
            label: "Total Recurring",
            value: formatCurrency(recurringCost),
            change: "current",
            up: false,
            gradient: "bg-gradient-card-blue",
          },
          {
            icon: TrendingUp,
            label: "Projected",
            value: formatCurrency(recurringCost * 1.035),
            change: "+3.5%",
            up: true,
            gradient: "bg-gradient-card-coral",
          },
          {
            icon: Calendar,
            label: "Active",
            value: String(active.length),
            change: `${active.length} contracts`,
            up: false,
            gradient: "bg-gradient-card-green",
          },
          {
            icon: AlertTriangle,
            label: "Cancelled",
            value: String(cancelled.length),
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
              <span className="text-xs text-muted-foreground">
                {kpi.label}
              </span>
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

          <div className="flex h-56 items-end gap-4">
            {recurringSpending.points.map((point) => {
              const normalizedHeight =
                trendRange === 0 ? 1 : (point.amount - trendMin) / trendRange;

              const barHeight =
                point.amount > 0 ? 40 + normalizedHeight * 60 : 0;

              return (
                <div
                  key={point.label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs font-semibold">
                    {formatCurrency(point.amount)}
                  </span>

                  <div
                    className="relative w-full max-w-[56px] overflow-hidden rounded-t-lg"
                    style={{ height: `${barHeight}%` }}
                  >
                    <div className="absolute inset-0 rounded-t-lg bg-gradient-primary opacity-85" />
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
          <h3 className="mb-4 font-[var(--font-display)] font-bold">
            By Urgency
          </h3>
          <div className="space-y-4">
            {urgencyData.map((urgency) => (
              <div key={urgency.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{urgency.label}</span>
                  <span className="font-semibold">{urgency.count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${urgency.color}`}
                    style={{
                      width: `${
                        totalUrgency > 0
                          ? (urgency.count / totalUrgency) * 100
                          : 0
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
                      <span className="text-sm font-semibold">
                        {service.name}
                      </span>
                      <span className="text-sm font-bold">{service.cost}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${
                            (service.pct /
                              Math.max(
                                ...topServices.map((item) => item.pct),
                                1,
                              )) *
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
