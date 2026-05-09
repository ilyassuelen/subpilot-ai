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
        .filter(Contract.user_id == user_id, Contract.status == "active")
        .all()
    )


def calculate_total_monthly_cost(contracts: list[Contract]) -> float:
    """Calculate total monthly cost for active contracts."""
    return round(sum(calculate_monthly_cost(contract) for contract in contracts), 2)


def delete_existing_savings_insights(db: Session, user_id: int) -> None:
    """Delete previous insights before rebuilding them."""
    (
        db.query(SavingsInsight)
        .filter(SavingsInsight.user_id == user_id)
        .delete(synchronize_session=False)
    )
    db.commit()


def save_generated_insights(db: Session, user_id: int, generated_result: dict) -> None:
    """Persist generated insights as stable dashboard snapshots."""
    now = datetime.utcnow()

    for insight in generated_result.get("insights", []):
        saved_insight = SavingsInsight(
            user_id=user_id,
            contract_id=insight.get("contract_id"),
            type=insight.get("type", "contract_insight"),
            priority=insight.get("priority", "low"),
            title=insight.get("title", "Contract insight"),
            message=insight.get("message", ""),
            estimated_monthly_saving=float(insight.get("estimated_monthly_saving", 0)),
            action=insight.get("action", "review_contract"),
            source_name=None,
            source_url=None,
            metadata_json=insight.get("metadata_json"),
            status="active",
            created_at=now,
            refreshed_at=now,
        )
        db.add(saved_insight)

    db.commit()


def build_summary_from_saved_insights(
    db: Session,
    user_id: int,
    contracts: list[Contract],
) -> SavingsInsightsSummaryResponse:
    """Build the dashboard summary from saved insights."""
    saved_insights = (
        db.query(SavingsInsight)
        .filter(SavingsInsight.user_id == user_id, SavingsInsight.status == "active")
        .order_by(
            SavingsInsight.priority.asc(),
            SavingsInsight.estimated_monthly_saving.desc(),
        )
        .all()
    )

    return SavingsInsightsSummaryResponse(
        total_monthly_cost=calculate_total_monthly_cost(contracts),
        estimated_monthly_saving=round(
            sum(insight.estimated_monthly_saving for insight in saved_insights),
            2,
        ),
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
                "source_name": insight.source_name,
                "source_url": insight.source_url,
                "created_at": insight.created_at,
                "refreshed_at": insight.refreshed_at,
            }
            for insight in saved_insights
        ],
    )


def refresh_savings_insights_for_user(
    db: Session,
    user_id: int,
) -> SavingsInsightsSummaryResponse:
    """Rebuild contract insights from current contract data."""
    contracts = get_active_contracts(db, user_id)

    delete_existing_savings_insights(db, user_id)

    service = SavingsService(db)
    generated_result = service.generate_insights(user_id=user_id, contracts=contracts)

    save_generated_insights(db, user_id, generated_result)

    return build_summary_from_saved_insights(db, user_id, contracts)


def generate_savings_insights_for_user(
    db: Session,
    user_id: int,
) -> SavingsInsightsSummaryResponse:
    """Always rebuild insights so old tariff-search snapshots cannot stay visible."""
    return refresh_savings_insights_for_user(db, user_id)
