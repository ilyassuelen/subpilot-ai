from datetime import date, datetime
from pydantic import BaseModel


class ContractCreate(BaseModel):
    title: str
    provider_name: str
    provider_email: str | None = None
    category: str
    contract_type: str = "subscription"
    monthly_cost: float
    billing_cycle: str = "monthly"
    currency: str = "EUR"
    start_date: date
    end_date: date | None = None
    auto_renewal: bool = True
    cancellation_notice_days: int = 30
    notes: str | None = None


class ContractResponse(BaseModel):
    id: int
    title: str
    provider_name: str
    provider_email: str | None = None
    category: str
    contract_type: str
    monthly_cost: float
    billing_cycle: str
    currency: str
    start_date: date
    end_date: date | None
    auto_renewal: bool
    cancellation_notice_days: int
    cancellation_deadline: date | None = None
    days_until_deadline: int | None = None
    urgency_status: str
    status: str
    notes: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ContractUpdate(BaseModel):
    title: str
    provider_name: str
    provider_email: str | None = None
    category: str
    contract_type: str
    monthly_cost: float
    billing_cycle: str
    currency: str
    start_date: date
    end_date: date | None = None
    auto_renewal: bool
    cancellation_notice_days: int = 30
    status: str
    notes: str | None = None
