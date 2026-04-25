from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.notification_settings import NotificationSettingsResponse, NotificationSettingsUpdate
from app.services.notification_settings_service import (
    get_or_create_notification_settings,
    update_notification_settings,
)

router = APIRouter(prefix="/settings/notifications", tags=["Settings"])


def get_db():
    """Provide a database session for each request and close it afterwards."""

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=NotificationSettingsResponse)
def get_my_notification_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return notification preferences for the currently authenticated user."""

    return get_or_create_notification_settings(db, current_user)


@router.put("/", response_model=NotificationSettingsResponse)
def update_my_notification_settings(
    data: NotificationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update notification preferences for the currently authenticated user."""

    return update_notification_settings(db, current_user, data)
