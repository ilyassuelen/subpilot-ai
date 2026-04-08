from datetime import date, datetime
from pydantic import BaseModel


class ContractCreate(BaseModel):
    title: str
    provider_name: str
    category: str
    monthly_cost: float
    start_date: date
    end_date: date | None = None
    cancellation_notice_days: int = 30


class ContractResponse(BaseModel):
    id: int
    title: str
    provider_name: str
    category: str
    monthly_cost: float
    start_date: date
    end_date: date | None
    cancellation_notice_days: int
    cancellation_deadline: date | None = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ContractUpdate(BaseModel):
    title: str
    provider_name: str
    category: str
    monthly_cost: float
    start_date: date
    end_date: date | None = None
    cancellation_notice_days: int = 30
    status: str
