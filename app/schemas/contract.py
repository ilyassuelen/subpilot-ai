from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field


class ContractCreate(BaseModel):
    """Schema for creating a new contract."""
    title: str
    provider_name: str
    provider_email: EmailStr | None = None
    category: str
    contract_type: Literal[
        "subscription",
        "contract",
        "internet_contract",
        "mobile_contract",
        "insurance",
    ] = "subscription"
    monthly_cost: float = Field(gt=0)
    billing_cycle: Literal["weekly", "monthly", "quarterly", "yearly"] = "monthly"
    currency: str = "EUR"
    start_date: date
    end_date: date | None = None
    auto_renewal: bool = True
    cancellation_notice_days: int = Field(default=30, ge=0)
    status: Literal["active", "cancelled"] = "active"
    notes: str | None = None


class ContractResponse(BaseModel):
    """Schema returned by the API for contract data including calculated fields."""
    id: int
    title: str
    provider_name: str
    provider_email: EmailStr | None = None
    category: str
    contract_type: Literal[
        "subscription",
        "contract",
        "internet_contract",
        "mobile_contract",
        "insurance",
    ]
    monthly_cost: float
    billing_cycle: Literal["weekly", "monthly", "quarterly", "yearly"]
    currency: str
    start_date: date
    end_date: date | None
    auto_renewal: bool
    cancellation_notice_days: int
    cancellation_deadline: date | None = None
    days_until_deadline: int | None = None
    urgency_status: str
    status: Literal["active", "cancelled"]
    notes: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ContractUpdate(BaseModel):
    """Schema for updating an existing contract."""
    title: str
    provider_name: str
    provider_email: EmailStr | None = None
    category: str
    contract_type: Literal[
        "subscription",
        "contract",
        "internet_contract",
        "mobile_contract",
        "insurance",
    ]
    monthly_cost: float = Field(gt=0)
    billing_cycle: Literal["weekly", "monthly", "quarterly", "yearly"]
    currency: str
    start_date: date
    end_date: date | None = None
    auto_renewal: bool
    cancellation_notice_days: int = Field(default=30, ge=0)
    status: Literal["active", "cancelled"]
    notes: str | None = None
