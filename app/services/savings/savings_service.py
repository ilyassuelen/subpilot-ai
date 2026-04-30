from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.services.savings.contract_classifier import classify_contract
from app.services.savings.llm_writer import generate_text
from app.services.savings.research_tool import research_alternatives
from app.services.savings.savings_calculator import calculate_saving


class SavingsService:
    """Service that coordinates the AI Savings Agent pipeline."""

    def __init__(self, db: Session):
        """Initialize the savings service with a database session."""
        self.db = db

    def generate_insights(self, user_id: int, contracts: list[Contract]) -> dict:
        """Generate savings insights for a user's active contracts."""
        _ = user_id

        insights = []
        total_cost = 0.0
        total_saving = 0.0

        for contract in contracts:
            if contract.status != "active":
                continue

            total_cost += contract.monthly_cost

            contract_type = classify_contract(contract)
            alternatives = research_alternatives(contract, contract_type)

            saving, best = calculate_saving(contract.monthly_cost, alternatives)

            if saving <= 0 or not best:
                continue

            total_saving += saving
            message = generate_text(contract, best, saving)

            insights.append(
                {
                    "type": "cost_optimization",
                    "priority": "medium",
                    "title": f"Save on {contract.title}",
                    "message": message,
                    "estimated_monthly_saving": saving,
                    "contract_id": contract.id,
                    "action": "review_contract",
                }
            )

        return {
            "total_monthly_cost": round(total_cost, 2),
            "estimated_monthly_saving": round(total_saving, 2),
            "insight_count": len(insights),
            "insights": insights,
        }
