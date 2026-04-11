from datetime import datetime
from pydantic import BaseModel


class ReminderCreate(BaseModel):
    contract_id: int
    reminder_type: str
    message: str
    scheduled_for: datetime
    channel: str = "app"


class ReminderResponse(BaseModel):
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
    generated_count: int
    reminders: list[ReminderResponse]
