from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.schemas.savings_insight import SavingsInsightsSummaryResponse
from app.services.savings.savings_service import SavingsService


def generate_savings_insights_for_user(
    db: Session,
    user_id: int,
) -> SavingsInsightsSummaryResponse:
    """Generate smart savings insights for all active contracts of a user."""
    contracts = (
        db.query(Contract)
        .filter(
            Contract.user_id == user_id,
            Contract.status == "active",
        )
        .all()
    )

    service = SavingsService(db)
    result = service.generate_insights(user_id, contracts)

    return SavingsInsightsSummaryResponse(**result)
