from datetime import datetime
from pydantic import BaseModel


class CancellationResponse(BaseModel):
    """Schema returned by the API for cancellation draft data."""

    id: int
    contract_id: int
    recipient_email: str | None
    subject: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
