from datetime import datetime
from pydantic import BaseModel


class ReminderCreate(BaseModel):
    """Schema for creating a new reminder."""
    contract_id: int
    reminder_type: str
    message: str
    scheduled_for: datetime
    channel: str = "app"


class ReminderResponse(BaseModel):
    """Schema returned by the API for reminder data."""
    id: int
    contract_id: int
    reminder_type: str
    message: str
    scheduled_for: datetime
    status: str
    channel: str
    sent_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class ReminderGenerateResponse(BaseModel):
    """Schema returned after generating default reminders for a contract."""
    generated_count: int
    reminders: list[ReminderResponse]
