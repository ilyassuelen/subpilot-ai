def calculate_saving(
    current_price: float,
    alternatives: list[dict],
) -> tuple[float, dict | None]:
    """Calculate the best monthly saving from cheaper alternatives."""
    if not alternatives:
        return 0.0, None

    valid_alternatives = []

    for alternative in alternatives:
        try:
            price = float(alternative.get("price", 0))
        except (TypeError, ValueError):
            continue

        if price <= 0 or price >= current_price:
            continue

        valid_alternatives.append({**alternative, "price": price})

    if not valid_alternatives:
        return 0.0, None

    cheapest = min(valid_alternatives, key=lambda item: item["price"])
    saving = max(0.0, current_price - cheapest["price"])

    return round(saving, 2), cheapest
