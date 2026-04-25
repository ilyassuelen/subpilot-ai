from datetime import datetime

from pydantic import BaseModel, Field


class NotificationSettingsUpdate(BaseModel):
    """Schema for updating a user's notification preferences."""

    email_notifications: bool
    push_notifications: bool
    weekly_digest: bool
    telegram_notifications: bool
    telegram_chat_id: str | None = Field(default=None, max_length=255)


class NotificationSettingsResponse(BaseModel):
    """Schema returned by the API for user notification preferences."""

    id: int
    user_id: int

    email_notifications: bool
    push_notifications: bool
    weekly_digest: bool

    telegram_notifications: bool
    telegram_chat_id: str | None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
