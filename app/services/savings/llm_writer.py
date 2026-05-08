from app.models.contract import Contract


def generate_text(
    contract: Contract,
    contract_profile: dict,
    best_option: dict,
    saving: float,
    current_monthly_cost: float,
) -> str:
    """Generate deterministic recommendation text from validated data only."""
    _ = contract_profile

    provider = best_option.get("provider") or "the provider"
    plan = best_option.get("plan") or "the alternative plan"
    price = float(best_option.get("price") or 0)
    currency = best_option.get("currency") or contract.currency
    recommendation_type = best_option.get("recommendation_type")
    tradeoff = best_option.get("tradeoff") or "Please review the tradeoffs before switching."
    source_name = best_option.get("source_name") or "the listed source"

    if recommendation_type == "downgrade_option":
        return (
            f"You could review the {plan} plan from {provider}, which costs "
            f"{price:.2f} {currency} per month instead of your current "
            f"{current_monthly_cost:.2f} {currency}. This could save you "
            f"{saving:.2f} {currency} per month. This is a downgrade option: "
            f"{tradeoff} Source: {source_name}. Please verify the current price, "
            f"availability and conditions before switching."
        )

    return (
        f"You could compare your current contract with {plan} from {provider}, "
        f"which costs {price:.2f} {currency} per month instead of your current "
        f"{current_monthly_cost:.2f} {currency}. This could save you "
        f"{saving:.2f} {currency} per month. Source: {source_name}. Please verify "
        f"the current price, availability, contract duration and conditions before switching."
    )
