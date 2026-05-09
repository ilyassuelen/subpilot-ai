from datetime import date, timedelta

from app.models.contract import Contract


def calculate_monthly_cost(contract: Contract) -> float:
    """Normalize a contract's cost to a monthly amount."""
    amount = float(contract.monthly_cost or 0)

    if amount <= 0:
        return 0.0

    billing_cycle = (contract.billing_cycle or "monthly").lower()

    if billing_cycle == "weekly":
        return round(amount * 4.345, 2)

    if billing_cycle == "quarterly":
        return round(amount / 3, 2)

    if billing_cycle == "yearly":
        return round(amount / 12, 2)

    return round(amount, 2)


def calculate_cancellation_deadline(contract: Contract) -> date | None:
    """Calculate the cancellation deadline for a contract."""
    if not contract.end_date:
        return None

    notice_days = int(contract.cancellation_notice_days or 0)
    return contract.end_date - timedelta(days=notice_days)


def calculate_days_until_deadline(contract: Contract) -> int | None:
    """Calculate days until the cancellation deadline."""
    deadline = calculate_cancellation_deadline(contract)

    if not deadline:
        return None

    return (deadline - date.today()).days


def estimate_review_saving(monthly_cost: float) -> float:
    """Estimate a conservative optimization potential for plan reviews.

    This is intentionally not a market price claim. It is a planning estimate
    used to rank contracts that are worth reviewing.
    """
    if monthly_cost < 10:
        return 0.0

    estimated = monthly_cost * 0.15
    return round(min(max(estimated, 2.0), 20.0), 2)
