from datetime import datetime

from pydantic import BaseModel


class SavingsInsightResponse(BaseModel):
    """Schema for a persisted smart savings recommendation."""

    id: int | None = None
    type: str
    priority: str
    title: str
    message: str
    estimated_monthly_saving: float
    contract_id: int | None = None
    action: str

    current_monthly_cost: float | None = None
    option_provider: str | None = None
    option_plan: str | None = None
    option_price: float | None = None
    option_currency: str | None = None

    source_name: str | None = None
    source_url: str | None = None

    created_at: datetime | None = None
    refreshed_at: datetime | None = None


class SavingsInsightsSummaryResponse(BaseModel):
    """Schema returned by the Smart Savings Agent summary endpoint."""

    total_monthly_cost: float
    estimated_monthly_saving: float
    insight_count: int
    insights: list[SavingsInsightResponse]
