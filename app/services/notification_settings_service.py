from sqlalchemy.orm import Session

from app.models.notification_settings import NotificationSettings
from app.models.user import User
from app.schemas.notification_settings import NotificationSettingsUpdate


def get_or_create_notification_settings(
    db: Session,
    user: User,
) -> NotificationSettings:
    """Return the user's notification settings or create default settings if none exist."""

    settings = (
        db.query(NotificationSettings)
        .filter(NotificationSettings.user_id == user.id)
        .first()
    )

    if settings:
        return settings

    settings = NotificationSettings(user_id=user.id)

    db.add(settings)
    db.commit()
    db.refresh(settings)

    return settings


def update_notification_settings(
    db: Session,
    user: User,
    data: NotificationSettingsUpdate,
) -> NotificationSettings:
    """Update and persist the current user's notification preferences."""

    settings = get_or_create_notification_settings(db, user)

    settings.email_notifications = data.email_notifications
    settings.push_notifications = data.push_notifications
    settings.weekly_digest = data.weekly_digest
    settings.telegram_notifications = data.telegram_notifications
    settings.telegram_chat_id = (
        data.telegram_chat_id.strip()
        if data.telegram_chat_id and data.telegram_chat_id.strip()
        else None
    )

    db.commit()
    db.refresh(settings)

    return settings
