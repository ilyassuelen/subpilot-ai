import {
  ArrowRight,
  BrainCircuit,
  PiggyBank,
  Sparkles,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSavingsInsights } from "@/hooks/useSavingsInsights";
import type { SavingsInsight } from "@/lib/types";

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

function getPriorityClasses(priority: string) {
  if (priority === "high") return "bg-destructive/10 text-destructive";
  if (priority === "medium") return "bg-warning/10 text-warning";
  return "bg-primary/10 text-primary";
}

function getActionLabel(action: string) {
  switch (action) {
    case "generate_cancellation_draft":
      return "Generate Cancellation Draft";
    case "compare_alternatives":
      return "Compare Alternatives";
    case "renegotiate_contract":
      return "Review / Renegotiate";
    default:
      return "Review Contract";
  }
}

function getActionTarget(action: string) {
  if (action === "generate_cancellation_draft") {
    return "/dashboard/cancellations";
  }

  return "/dashboard/contracts";
}

function getInsightIcon(type: string) {
  if (type === "upcoming_cancellation_window") return AlertTriangle;
  if (type === "cost_optimization") return TrendingDown;
  return BrainCircuit;
}

export function SavingsPage() {
  const { data, isLoading, error } = useSavingsInsights();

  const insights: SavingsInsight[] = data?.insights ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Savings Agent
          </div>

          <h1 className="font-[var(--font-display)] text-2xl font-bold">
            AI Savings Recommendations
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            SubPilot analyzes your active contracts and identifies opportunities
            to reduce recurring costs, review expensive plans, or take action
            before cancellation windows close.
          </p>
        </div>

        <Button variant="hero" size="sm" asChild>
          <Link to="/dashboard/contracts">
            Review Contracts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load savings recommendations.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-card">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <PiggyBank className="h-4 w-4 text-primary" />
            Potential Monthly Saving
          </div>

          {isLoading ? (
            <Skeleton className="h-9 w-28" />
          ) : (
            <div className="font-[var(--font-display)] text-3xl font-bold text-primary">
              {formatCurrency(data?.estimated_monthly_saving ?? 0)}
            </div>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            Estimated by the Smart Savings Agent
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-card">
          <div className="mb-2 text-xs text-muted-foreground">
            Current Monthly Cost
          </div>

          {isLoading ? (
            <Skeleton className="h-9 w-28" />
          ) : (
            <div className="font-[var(--font-display)] text-3xl font-bold">
              {formatCurrency(data?.total_monthly_cost ?? 0)}
            </div>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            Across your active contracts
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-card">
          <div className="mb-2 text-xs text-muted-foreground">
            Recommendations
          </div>

          {isLoading ? (
            <Skeleton className="h-9 w-20" />
          ) : (
            <div className="font-[var(--font-display)] text-3xl font-bold">
              {data?.insight_count ?? 0}
            </div>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            AI-generated actions to review
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card p-10 text-center shadow-card">
          <h2 className="text-lg font-semibold">
            No savings recommendations yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Add more active contracts or subscriptions so the Smart Savings
            Agent can analyze your recurring costs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = getInsightIcon(insight.type);

            return (
              <div
                key={`${insight.contract_id}-${insight.title}`}
                className="rounded-2xl border border-border/50 bg-card p-6 shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="font-[var(--font-display)] text-lg font-bold">
                          {insight.title}
                        </h2>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getPriorityClasses(
                            insight.priority,
                          )}`}
                        >
                          {insight.priority}
                        </span>
                      </div>

                      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {insight.message}
                      </p>
                    </div>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <div className="text-xs text-muted-foreground">
                      Potential saving
                    </div>
                    <div className="font-[var(--font-display)] text-xl font-bold text-primary">
                      {formatCurrency(insight.estimated_monthly_saving)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      per month
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
                  <div className="text-sm font-semibold text-primary sm:hidden">
                    {formatCurrency(insight.estimated_monthly_saving)} / month
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Action type: {insight.action.replaceAll("_", " ")}
                  </div>

                  <Button size="sm" variant="outline" asChild>
                    <Link to={getActionTarget(insight.action)}>
                      {getActionLabel(insight.action)}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
