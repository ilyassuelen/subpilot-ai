import type { Contract } from "@/lib/types";

export function getNormalizedMonthlyCost(contract: Contract) {
  if (contract.billing_cycle === "weekly") {
    return (contract.monthly_cost * 52) / 12;
  }

  if (contract.billing_cycle === "monthly") {
    return contract.monthly_cost;
  }

  if (contract.billing_cycle === "quarterly") {
    return contract.monthly_cost / 3;
  }

  if (contract.billing_cycle === "yearly") {
    return contract.monthly_cost / 12;
  }

  return contract.monthly_cost;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isContractActiveInMonth(contract: Contract, monthDate: Date) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  const contractStart = new Date(contract.start_date);
  const contractEnd = contract.end_date ? new Date(contract.end_date) : null;

  if (contractStart > monthEnd) {
    return false;
  }

  if (contractEnd && contractEnd < monthStart) {
    return false;
  }

  return contract.status === "active";
}

export function buildRecurringTrend(
  activeContracts: Contract[],
  monthsCount: number,
) {
  const now = new Date();

  const points = Array.from({ length: monthsCount }).map((_, index) => {
    const monthDate = addMonths(now, index);

    const label = new Intl.DateTimeFormat("en-US", {
      month: "short",
    }).format(monthDate);

    const amount = activeContracts.reduce((sum, contract) => {
      if (!isContractActiveInMonth(contract, monthDate)) {
        return sum;
      }

      return sum + getNormalizedMonthlyCost(contract);
    }, 0);

    return {
      label,
      amount: Number(amount.toFixed(2)),
    };
  });

  const maxAmount = Math.max(...points.map((point) => point.amount), 1);

  return {
    points,
    maxAmount,
  };
}
