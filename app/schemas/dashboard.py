from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    total_contracts: int
    active_contracts: int
    critical_contracts: int
    monthly_total_cost: float
