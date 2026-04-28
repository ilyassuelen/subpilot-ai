from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.schemas.savings_insight import (
    SavingsInsightResponse,
    SavingsInsightsSummaryResponse,
)
from app.services.ai.savings_insight_writer import (
    SavingsInsightAIError,
    generate_ai_savings_insights,
)


def calculate_monthly_cost(contract: Contract) -> float:
    """Return normalized monthly cost for a contract."""
    if contract.billing_cycle == "weekly":
        return round(contract.monthly_cost * 4.33, 2)

    if contract.billing_cycle == "quarterly":
        return round(contract.monthly_cost / 3, 2)

    if contract.billing_cycle == "yearly":
        return round(contract.monthly_cost / 12, 2)

    return round(contract.monthly_cost, 2)


def calculate_cancellation_deadline(contract: Contract) -> date | None:
    """Calculate the cancellation deadline for a contract if possible."""
    if not contract.end_date:
        return None

    return contract.end_date - timedelta(days=contract.cancellation_notice_days)


def estimate_basic_saving(contract: Contract) -> float:
    """Estimate a conservative fallback saving potential."""
    monthly_cost = calculate_monthly_cost(contract)

    if monthly_cost <= 0:
        return 0.0

    if monthly_cost < 10:
        return round(monthly_cost, 2)

    if monthly_cost < 25:
        return round(monthly_cost * 0.2, 2)

    if monthly_cost < 50:
        return round(monthly_cost * 0.3, 2)

    return round(monthly_cost * 0.4, 2)


def build_contract_payload(contract: Contract) -> dict:
    """Build structured contract data for the Smart Savings Agent."""
    monthly_cost = calculate_monthly_cost(contract)
    cancellation_deadline = calculate_cancellation_deadline(contract)

    days_until_deadline = None
    if cancellation_deadline:
        days_until_deadline = (cancellation_deadline - date.today()).days

    return {
        "id": contract.id,
        "title": contract.title,
        "provider_name": contract.provider_name,
        "category": contract.category,
        "contract_type": contract.contract_type,
        "monthly_cost": monthly_cost,
        "currency": contract.currency,
        "billing_cycle": contract.billing_cycle,
        "start_date": str(contract.start_date),
        "end_date": str(contract.end_date) if contract.end_date else None,
        "auto_renewal": contract.auto_renewal,
        "cancellation_notice_days": contract.cancellation_notice_days,
        "cancellation_deadline": (
            str(cancellation_deadline) if cancellation_deadline else None
        ),
        "days_until_deadline": days_until_deadline,
        "notes": contract.notes,
        "fallback_estimated_saving": estimate_basic_saving(contract),
    }


def build_fallback_insight(contract: Contract) -> SavingsInsightResponse:
    """Build a safe fallback insight if AI generation is unavailable."""
    monthly_cost = calculate_monthly_cost(contract)
    estimated_saving = estimate_basic_saving(contract)
    cancellation_deadline = calculate_cancellation_deadline(contract)

    priority = "medium"
    action = "review_contract"

    if cancellation_deadline:
        days_until_deadline = (cancellation_deadline - date.today()).days
        if 0 <= days_until_deadline <= 30:
            priority = "high" if days_until_deadline <= 7 else "medium"
            action = "generate_cancellation_draft"

    return SavingsInsightResponse(
        type="subscription_review",
        priority=priority,
        title=f"Review {contract.title}",
        message=(
            f"{contract.title} currently costs about {monthly_cost:.2f} "
            f"{contract.currency} per month. Review whether you still use it regularly, "
            f"whether a lower tier is enough, or whether cancelling would be the better option."
        ),
        estimated_monthly_saving=estimated_saving,
        contract_id=contract.id,
        action=action,
    )


def normalize_ai_insight(item: dict, valid_contract_ids: set[int]) -> SavingsInsightResponse | None:
    """Validate and normalize a single AI-generated insight."""
    contract_id = item.get("contract_id")

    if contract_id not in valid_contract_ids:
        return None

    return SavingsInsightResponse(
        type=str(item.get("type", "subscription_review")),
        priority=str(item.get("priority", "medium")),
        title=str(item.get("title", "Savings recommendation")),
        message=str(item.get("message", "")),
        estimated_monthly_saving=round(
            float(item.get("estimated_monthly_saving", 0.0)),
            2,
        ),
        contract_id=contract_id,
        action=str(item.get("action", "review_contract")),
    )


def generate_savings_insights_for_user(
    db: Session,
    user_id: int,
) -> SavingsInsightsSummaryResponse:
    """Generate AI-powered smart savings insights for all active contracts of a user."""
    contracts = (
        db.query(Contract)
        .filter(
            Contract.user_id == user_id,
            Contract.status == "active",
        )
        .all()
    )

    total_monthly_cost = round(
        sum(calculate_monthly_cost(contract) for contract in contracts),
        2,
    )

    if not contracts:
        return SavingsInsightsSummaryResponse(
            total_monthly_cost=0.0,
            estimated_monthly_saving=0.0,
            insight_count=0,
            insights=[],
        )

    contract_payload = [build_contract_payload(contract) for contract in contracts]
    valid_contract_ids = {contract.id for contract in contracts}

    insights: list[SavingsInsightResponse] = []

    try:
        ai_items = generate_ai_savings_insights(
            contracts_payload=contract_payload,
            total_monthly_cost=total_monthly_cost,
        )

        for item in ai_items:
            insight = normalize_ai_insight(item, valid_contract_ids)
            if insight and insight.message:
                insights.append(insight)

    except SavingsInsightAIError:
        insights = [build_fallback_insight(contract) for contract in contracts]

    except Exception:
        insights = [build_fallback_insight(contract) for contract in contracts]

    insights.sort(
        key=lambda insight: (
            0 if insight.priority == "high" else 1,
            -insight.estimated_monthly_saving,
        )
    )

    estimated_monthly_saving = round(
        sum(insight.estimated_monthly_saving for insight in insights),
        2,
    )

    return SavingsInsightsSummaryResponse(
        total_monthly_cost=total_monthly_cost,
        estimated_monthly_saving=estimated_monthly_saving,
        insight_count=len(insights),
        insights=insights,
    )
