from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.services.savings.candidate_validator import filter_valid_alternatives
from app.services.savings.contract_understanding import understand_contract
from app.services.savings.llm_writer import generate_text
from app.services.savings.research_tool import research_alternatives
from app.services.savings.savings_calculator import (
    calculate_monthly_cost,
    calculate_saving,
)


class SavingsService:
    """Service that coordinates the universal AI Savings Agent pipeline."""

    def __init__(self, db: Session):
        """Initialize the savings service with a database session."""
        self.db = db

    def build_priority(self, saving: float, monthly_cost: float) -> str:
        """Build recommendation priority from saving amount and ratio."""
        if monthly_cost <= 0:
            return "low"

        ratio = saving / monthly_cost

        if saving >= 20 or ratio >= 0.35:
            return "high"

        if saving >= 5 or ratio >= 0.15:
            return "medium"

        return "low"

    def build_action(self, best_option: dict) -> str:
        """Build the frontend action based on recommendation type."""
        if best_option.get("recommendation_type") == "downgrade_option":
            return "review_contract"

        return "compare_alternatives"

    def build_title(
        self,
        contract: Contract,
        best_option: dict,
        saving: float,
    ) -> str:
        """Build a readable recommendation title."""
        recommendation_type = best_option.get("recommendation_type")
        provider = best_option.get("provider")
        plan = best_option.get("plan")

        if recommendation_type == "downgrade_option":
            return f"Downgrade option for {contract.title}"

        if provider and plan:
            return f"Save {saving:.2f} {contract.currency}/month with {provider} {plan}"

        return f"Potential savings for {contract.title}"

    def generate_insights(self, user_id: int, contracts: list[Contract]) -> dict:
        """Generate savings insights for a user's active contracts."""
        _ = user_id

        insights = []
        total_cost = 0.0
        total_saving = 0.0

        for contract in contracts:
            if contract.status != "active":
                continue

            monthly_cost = calculate_monthly_cost(contract)
            total_cost += monthly_cost

            if monthly_cost <= 0:
                continue

            contract_profile = understand_contract(contract, monthly_cost)

            researched_alternatives = research_alternatives(
                contract=contract,
                contract_profile=contract_profile,
                monthly_cost=monthly_cost,
            )

            valid_alternatives = filter_valid_alternatives(
                contract_profile=contract_profile,
                alternatives=researched_alternatives,
            )

            saving, best_option = calculate_saving(
                current_price=monthly_cost,
                alternatives=valid_alternatives,
            )

            if saving <= 0 or not best_option:
                continue

            total_saving += saving

            message = generate_text(
                contract=contract,
                contract_profile=contract_profile,
                best_option=best_option,
                saving=saving,
                current_monthly_cost=monthly_cost,
            )

            insights.append(
                {
                    "type": best_option.get(
                        "recommendation_type",
                        "cost_optimization",
                    ),
                    "priority": self.build_priority(saving, monthly_cost),
                    "title": self.build_title(contract, best_option, saving),
                    "message": message,
                    "estimated_monthly_saving": saving,
                    "contract_id": contract.id,
                    "action": self.build_action(best_option),
                }
            )

        insights.sort(
            key=lambda insight: (
                0 if insight["priority"] == "high" else 1,
                -insight["estimated_monthly_saving"],
            )
        )

        return {
            "total_monthly_cost": round(total_cost, 2),
            "estimated_monthly_saving": round(total_saving, 2),
            "insight_count": len(insights),
            "insights": insights,
        }
