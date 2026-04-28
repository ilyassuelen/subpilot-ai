from pydantic import BaseModel


class SavingsInsightResponse(BaseModel):
    """Schema for a single smart savings recommendation."""

    type: str
    priority: str
    title: str
    message: str
    estimated_monthly_saving: float
    contract_id: int | None = None
    action: str


class SavingsInsightsSummaryResponse(BaseModel):
    """Schema returned by the Smart Savings Agent."""

    total_monthly_cost: float
    estimated_monthly_saving: float
    insight_count: int
    insights: list[SavingsInsightResponse]
