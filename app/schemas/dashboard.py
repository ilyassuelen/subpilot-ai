from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    """Summary statistics used for the dashboard overview."""
    total_contracts: int
    active_contracts: int
    critical_contracts: int
    monthly_total_cost: float
