from app.models.contract import Contract


def calculate_monthly_cost(contract: Contract) -> float:
    """Normalize contract cost to a monthly amount."""
    amount = float(contract.monthly_cost or 0)

    if contract.billing_cycle == "weekly":
        return round(amount * 4.33, 2)

    if contract.billing_cycle == "quarterly":
        return round(amount / 3, 2)

    if contract.billing_cycle == "yearly":
        return round(amount / 12, 2)

    return round(amount, 2)


def calculate_saving(
    current_price: float,
    alternatives: list[dict],
) -> tuple[float, dict | None]:
    """Calculate the best monthly saving from valid cheaper alternatives."""
    valid_alternatives = []

    for alternative in alternatives:
        try:
            price = float(alternative.get("price", 0))
        except (TypeError, ValueError):
            continue

        if price <= 0 or price >= current_price:
            continue

        valid_alternatives.append({**alternative, "price": round(price, 2)})

    if not valid_alternatives:
        return 0.0, None

    def sort_key(item: dict) -> tuple[int, float]:
        recommendation_type = item.get("recommendation_type")

        type_priority = 0 if recommendation_type == "equivalent_alternative" else 1

        return type_priority, item["price"]

    best_option = min(valid_alternatives, key=sort_key)
    saving = round(current_price - best_option["price"], 2)

    return saving, best_option
