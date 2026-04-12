from datetime import datetime
from pydantic import BaseModel


class CancellationGenerateRequest(BaseModel):
    """Schema for generating a cancellation draft from form input."""

    language: str = "de"

    customer_name: str | None = None
    customer_address: str | None = None
    customer_email: str | None = None
    customer_number: str | None = None

    provider_email: str | None = None
    provider_address: str | None = None


class CancellationResponse(BaseModel):
    """Schema returned by the API for cancellation draft data."""

    id: int
    contract_id: int

    language: str

    customer_name: str | None
    customer_address: str | None
    customer_email: str | None
    customer_number: str | None

    provider_name: str | None
    provider_email: str | None
    provider_address: str | None

    subject: str
    generated_message: str
    final_message: str

    status: str
    sent_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
