from collections import defaultdict

from app.models.contract import Contract
from app.services.savings.savings_calculator import (
    calculate_days_until_deadline,
    calculate_monthly_cost,
    estimate_review_saving,
)


def normalize_text(value: str | None) -> str:
    """Normalize text for grouping and comparisons."""
    return (value or "").strip().lower()


def contract_label(contract: Contract) -> str:
    """Return a user-friendly contract label."""
    if getattr(contract, "plan_name", None):
        return f"{contract.provider_name} {contract.plan_name}"

    return contract.title


def priority_from_value(value: float) -> str:
    """Map estimated optimization value to priority."""
    if value >= 15:
        return "high"

    if value >= 5:
        return "medium"

    return "low"


def build_plan_review_insight(contract: Contract, monthly_cost: float) -> dict | None:
    """Create a generic plan review insight without claiming market prices."""
    estimated_paving = estimate_review_saving(monthly_cost)

    if estimated_paving <= 0:
        return None

    label = contract_label(contract)

    return {
        "type": "plan_review",
        "priority": priority_from_value(estimated_paving),
        "title": f"Review plan value for {label}",
        "message": (
            f"This contract currently costs {monthly_cost:.2f} {contract.currency} per month. "
            "SubPilot does not claim to have found a cheaper market offer. "
            "However, this contract is worth reviewing because the current plan tier, included features "
            "or actual usage may no longer match your needs. "
            f"A conservative monthly optimization potential is estimated at about "
            f"{estimated_paving:.2f} {contract.currency}."
        ),
        "estimated_monthly_saving": estimated_paving,
        "contract_id": contract.id,
        "action": "review_contract",
    }


def build_deadline_insight(contract: Contract, monthly_cost: float) -> dict | None:
    """Create an insight when a cancellation deadline is approaching or overdue."""
    days = calculate_days_until_deadline(contract)

    if days is None or days > 45:
        return None

    if days < 0:
        title = f"Cancellation deadline passed for {contract.title}"
        message = (
            "The cancellation deadline for this contract appears to have passed. "
            "Review the renewal terms and consider preparing a cancellation or renegotiation request."
        )
        priority = "high"
    elif days <= 7:
        title = f"Cancellation deadline soon for {contract.title}"
        message = (
            f"The cancellation deadline is in {days} day(s). Review this contract now so you do not miss "
            "the opportunity to cancel, renegotiate or adjust it before it renews."
        )
        priority = "high"
    else:
        title = f"Upcoming cancellation window for {contract.title}"
        message = (
            f"The cancellation deadline is in {days} day(s). This is a good moment to check whether the "
            "contract still fits your needs and to prepare possible cancellation or renegotiation steps."
        )
        priority = "medium"

    return {
        "type": "upcoming_cancellation_window",
        "priority": priority,
        "title": title,
        "message": f"{message} Monthly cost at stake: {monthly_cost:.2f} {contract.currency}.",
        "estimated_monthly_saving": 0.0,
        "contract_id": contract.id,
        "action": "generate_cancellation_draft",
    }


def build_auto_renewal_insight(contract: Contract, monthly_cost: float) -> dict | None:
    """Create an insight for expensive auto-renewing contracts."""
    if not contract.auto_renewal or monthly_cost < 20:
        return None

    return {
        "type": "auto_renewal_review",
        "priority": "high" if monthly_cost >= 50 else "medium",
        "title": f"Auto-renewal review for {contract.title}",
        "message": (
            f"This contract renews automatically and costs {monthly_cost:.2f} {contract.currency} per month. "
            "Make sure the renewal is intentional before the cancellation window closes."
        ),
        "estimated_monthly_saving": 0.0,
        "contract_id": contract.id,
        "action": "review_contract",
    }


def build_missing_details_insight(contract: Contract) -> dict | None:
    """Create an insight when important contract details are missing."""
    has_notes = bool((contract.notes or "").strip())
    has_end_date = bool(contract.end_date)

    if has_notes and has_end_date:
        return None

    missing = []

    if not has_end_date:
        missing.append("end date")

    if not has_notes:
        missing.append("usage or plan notes")

    return {
        "type": "data_quality",
        "priority": "low",
        "title": f"Add more details for {contract.title}",
        "message": (
            "SubPilot can produce better contract insights when enough context is available. "
            f"Missing details: {', '.join(missing)}."
        ),
        "estimated_monthly_saving": 0.0,
        "contract_id": contract.id,
        "action": "review_contract",
    }


def build_category_overlap_insights(contracts: list[Contract]) -> list[dict]:
    """Create insights when multiple active contracts share the same category."""
    grouped_contracts: dict[str, list[Contract]] = defaultdict(list)

    for contract in contracts:
        category = normalize_text(contract.category)

        if category:
            grouped_contracts[category].append(contract)

    insights = []

    for category, items in grouped_contracts.items():
        if len(items) < 2:
            continue

        monthly_total = sum(calculate_monthly_cost(item) for item in items)
        representative = items[0]
        names = ", ".join(item.title for item in items[:3])
        estimated_potential = round(min(monthly_total * 0.1, 15.0), 2)

        insights.append(
            {
                "type": "category_overlap",
                "priority": "high" if monthly_total >= 50 else "medium",
                "title": f"Review multiple {category} contracts",
                "message": (
                    f"You have {len(items)} active contracts in this category: {names}. "
                    f"Together they cost about {monthly_total:.2f} {representative.currency} per month. "
                    "Check whether there is overlap, duplicated usage or an opportunity to consolidate."
                ),
                "estimated_monthly_saving": estimated_potential,
                "contract_id": representative.id,
                "action": "review_contract",
            }
        )

    return insights


def build_contract_insights(contracts: list[Contract]) -> list[dict]:
    """Build deterministic, non-hallucinated contract optimization insights."""
    insights = []

    for contract in contracts:
        monthly_cost = calculate_monthly_cost(contract)

        candidates = [
            build_deadline_insight(contract, monthly_cost),
            build_plan_review_insight(contract, monthly_cost),
            build_auto_renewal_insight(contract, monthly_cost),
            build_missing_details_insight(contract),
        ]

        insights.extend(insight for insight in candidates if insight)

    insights.extend(build_category_overlap_insights(contracts))

    return insights
