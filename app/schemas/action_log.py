from datetime import datetime
from pydantic import BaseModel


class ActionLogResponse(BaseModel):
    """Schema returned by the API for action log entries."""

    id: int
    entity_type: str
    entity_id: int
    action_type: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
