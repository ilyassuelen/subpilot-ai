from datetime import datetime

from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.models.savings_insight import SavingsInsight
from app.schemas.savings_insight import SavingsInsightsSummaryResponse
from app.services.savings.savings_calculator import calculate_monthly_cost
from app.services.savings.savings_service import SavingsService


def get_active_contracts(db: Session, user_id: int) -> list[Contract]:
    """Return all active contracts for a user."""
    return (
        db.query(Contract)
        .filter(
            Contract.user_id == user_id,
            Contract.status == "active",
        )
        .all()
    )


def calculate_total_monthly_cost(contracts: list[Contract]) -> float:
    """Calculate the total normalized monthly cost for active contracts."""
    return round(sum(calculate_monthly_cost(contract) for contract in contracts), 2)


def build_summary_from_saved_insights(
    db: Session,
    user_id: int,
    contracts: list[Contract],
) -> SavingsInsightsSummaryResponse:
    """Build the savings summary from persisted insight snapshots."""
    saved_insights = (
        db.query(SavingsInsight)
        .filter(
            SavingsInsight.user_id == user_id,
            SavingsInsight.status == "active",
        )
        .order_by(
            SavingsInsight.priority.asc(),
            SavingsInsight.estimated_monthly_saving.desc(),
        )
        .all()
    )

    total_monthly_cost = calculate_total_monthly_cost(contracts)
    estimated_monthly_saving = round(
        sum(insight.estimated_monthly_saving for insight in saved_insights),
        2,
    )

    return SavingsInsightsSummaryResponse(
        total_monthly_cost=total_monthly_cost,
        estimated_monthly_saving=estimated_monthly_saving,
        insight_count=len(saved_insights),
        insights=[
            {
                "id": insight.id,
                "type": insight.type,
                "priority": insight.priority,
                "title": insight.title,
                "message": insight.message,
                "estimated_monthly_saving": insight.estimated_monthly_saving,
                "contract_id": insight.contract_id,
                "action": insight.action,
                "current_monthly_cost": insight.current_monthly_cost,
                "option_provider": insight.option_provider,
                "option_plan": insight.option_plan,
                "option_price": insight.option_price,
                "option_currency": insight.option_currency,
                "source_name": insight.source_name,
                "source_url": insight.source_url,
                "created_at": insight.created_at,
                "refreshed_at": insight.refreshed_at,
            }
            for insight in saved_insights
        ],
    )


def delete_existing_savings_insights(db: Session, user_id: int) -> None:
    """Delete existing savings snapshots before creating a fresh analysis."""
    (
        db.query(SavingsInsight)
        .filter(SavingsInsight.user_id == user_id)
        .delete(synchronize_session=False)
    )
    db.commit()


def save_generated_insights(
    db: Session,
    user_id: int,
    generated_result: dict,
) -> None:
    """Persist generated savings insights as stable snapshots."""
    now = datetime.utcnow()

    for insight in generated_result.get("insights", []):
        saved_insight = SavingsInsight(
            user_id=user_id,
            contract_id=insight.get("contract_id"),
            type=insight.get("type", "cost_optimization"),
            priority=insight.get("priority", "low"),
            title=insight.get("title", "Savings opportunity"),
            message=insight.get("message", ""),
            estimated_monthly_saving=float(
                insight.get("estimated_monthly_saving", 0),
            ),
            action=insight.get("action", "review_contract"),
            current_monthly_cost=insight.get("current_monthly_cost"),
            option_provider=insight.get("option_provider"),
            option_plan=insight.get("option_plan"),
            option_price=insight.get("option_price"),
            option_currency=insight.get("option_currency"),
            source_name=insight.get("source_name"),
            source_url=insight.get("source_url"),
            contract_profile=insight.get("contract_profile"),
            offer_data=insight.get("offer_data"),
            status="active",
            created_at=now,
            refreshed_at=now,
        )

        db.add(saved_insight)

    db.commit()


def generate_savings_insights_for_user(
    db: Session,
    user_id: int,
) -> SavingsInsightsSummaryResponse:
    """Return saved savings insights or create them once if none exist."""
    contracts = get_active_contracts(db, user_id)

    existing_count = (
        db.query(SavingsInsight)
        .filter(
            SavingsInsight.user_id == user_id,
            SavingsInsight.status == "active",
        )
        .count()
    )

    if existing_count == 0:
        return refresh_savings_insights_for_user(db, user_id)

    return build_summary_from_saved_insights(db, user_id, contracts)


def refresh_savings_insights_for_user(
    db: Session,
    user_id: int,
) -> SavingsInsightsSummaryResponse:
    """Force a fresh Smart Savings Agent run and persist the new result."""
    contracts = get_active_contracts(db, user_id)

    delete_existing_savings_insights(db, user_id)

    service = SavingsService(db)
    generated_result = service.generate_insights(
        user_id=user_id,
        contracts=contracts,
    )

    save_generated_insights(
        db=db,
        user_id=user_id,
        generated_result=generated_result,
    )

    return build_summary_from_saved_insights(db, user_id, contracts)
