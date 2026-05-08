from app.models.contract import Contract


MIN_MONTHLY_SAVING = 2.0
MIN_SAVING_RATIO = 0.05


def calculate_monthly_cost(contract: Contract) -> float:
    """Normalize contract cost to monthly cost."""
    amount = float(contract.monthly_cost or 0)

    if amount <= 0:
        return 0.0

    billing_cycle = (contract.billing_cycle or "monthly").lower()

    if billing_cycle == "yearly":
        return round(amount / 12, 2)

    if billing_cycle == "quarterly":
        return round(amount / 3, 2)

    if billing_cycle == "weekly":
        return round(amount * 4.345, 2)

    return round(amount, 2)


def is_meaningful_saving(current_price: float, saving: float) -> bool:
    """Reject savings that are too small to be useful."""
    if current_price <= 0:
        return False

    if saving < MIN_MONTHLY_SAVING:
        return False

    saving_ratio = saving / current_price

    return saving_ratio >= MIN_SAVING_RATIO


def calculate_saving(
    current_price: float,
    alternatives: list[dict],
) -> tuple[float, dict | None]:
    """Find the best valid alternative with meaningful monthly savings."""
    best_saving = 0.0
    best_option = None

    for alternative in alternatives:
        try:
            alternative_price = float(alternative.get("price", 0))
        except (TypeError, ValueError):
            continue

        if alternative_price <= 0:
            continue

        saving = round(current_price - alternative_price, 2)

        if not is_meaningful_saving(current_price, saving):
            continue

        if saving > best_saving:
            best_saving = saving
            best_option = alternative

    return round(best_saving, 2), best_option
