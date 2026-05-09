from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.services.savings.insight_rules import build_contract_insights
from app.services.savings.savings_calculator import calculate_monthly_cost


class SavingsService:
    """Build stable contract optimization insights from saved contract data."""

    def __init__(self, db: Session):
        """Initialize the service with a database session."""
        self.db = db

    def generate_insights(self, user_id: int, contracts: list[Contract]) -> dict:
        """Generate deterministic insights without market-price or tariff claims."""
        _ = user_id

        active_contracts = [
            contract for contract in contracts if contract.status == "active"
        ]

        insights = build_contract_insights(active_contracts)

        total_monthly_cost = round(
            sum(calculate_monthly_cost(contract) for contract in active_contracts),
            2,
        )

        estimated_potential = round(
            sum(insight.get("estimated_monthly_saving", 0) for insight in insights),
            2,
        )

        insights.sort(
            key=lambda insight: (
                0 if insight["priority"] == "high" else 1,
                1 if insight["priority"] == "medium" else 2,
                -insight.get("estimated_monthly_saving", 0),
            )
        )

        return {
            "total_monthly_cost": total_monthly_cost,
            "estimated_monthly_saving": estimated_potential,
            "insight_count": len(insights),
            "insights": insights,
        }
