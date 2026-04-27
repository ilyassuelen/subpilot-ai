from datetime import datetime

from sqlalchemy.orm import Session

from app.models.reminder import Reminder
from app.models.user import User
from app.services.action_log_service import create_action_log
from app.services.notification_settings_service import get_or_create_notification_settings
from app.services.notifications.email_service import send_email
from app.services.notifications.telegram_service import send_telegram_message


def format_reminder_type(reminder_type: str) -> str:
    """Convert internal reminder type to a user-friendly label."""
    mapping = {
        "cancellation": "Cancellation reminder",
        "renewal": "Renewal reminder",
        "general": "Reminder",
    }

    return mapping.get(reminder_type, "Reminder")


def build_reminder_email_subject(reminder: Reminder) -> str:
    """Build the email subject for a reminder notification."""
    contract_title = reminder.contract.title if reminder.contract else "your contract"
    readable_type = format_reminder_type(reminder.reminder_type)

    return f"{readable_type}: {contract_title}"


def build_reminder_email_body(reminder: Reminder, user: User) -> str:
    """Build a user-friendly plain-text email body for a reminder notification."""
    contract = reminder.contract
    contract_title = contract.title if contract else "your contract"
    provider_name = contract.provider_name if contract else "the provider"
    scheduled_for = reminder.scheduled_for.strftime("%d.%m.%Y %H:%M")
    readable_type = format_reminder_type(reminder.reminder_type)

    return (
        f"Hi {user.full_name},\n\n"
        f"this is a reminder from SubPilot.\n\n"
        f"🔔 {readable_type}\n\n"
        f"Contract: {contract_title}\n"
        f"Provider: {provider_name}\n"
        f"Scheduled for: {scheduled_for}\n\n"
        f"{reminder.message}\n\n"
        f"👉 Open SubPilot to review your contract or take action.\n\n"
        f"Best regards,\n"
        f"SubPilot AI"
    )


def build_reminder_telegram_message(reminder: Reminder, user: User) -> str:
    """Build a user-friendly Telegram message for a reminder notification."""
    contract = reminder.contract
    contract_title = contract.title if contract else "your contract"
    provider_name = contract.provider_name if contract else "the provider"
    scheduled_for = reminder.scheduled_for.strftime("%d.%m.%Y %H:%M")
    readable_type = format_reminder_type(reminder.reminder_type)

    return (
        f"🔔 <b>{readable_type}</b>\n\n"
        f"Hi {user.full_name},\n\n"
        f"<b>Contract:</b> {contract_title}\n"
        f"<b>Provider:</b> {provider_name}\n"
        f"<b>Scheduled for:</b> {scheduled_for}\n\n"
        f"{reminder.message}\n\n"
        f"Open SubPilot to review your contract or take action."
    )


def get_due_pending_reminders_for_user(
    db: Session,
    user_id: int,
) -> list[Reminder]:
    """Return all due pending reminders for a specific user."""
    now = datetime.utcnow()

    return (
        db.query(Reminder)
        .filter(
            Reminder.user_id == user_id,
            Reminder.status == "pending",
            Reminder.scheduled_for <= now,
        )
        .order_by(Reminder.scheduled_for.asc(), Reminder.created_at.asc())
        .all()
    )


def process_due_reminders_for_user(
    db: Session,
    user: User,
) -> dict:
    """Process due reminders for a user and deliver notifications based on preferences."""
    settings = get_or_create_notification_settings(db, user)
    reminders = get_due_pending_reminders_for_user(db, user.id)

    processed_count = 0
    email_sent_count = 0
    telegram_sent_count = 0
    in_app_count = 0
    skipped_count = 0
    failed_count = 0

    results: list[dict] = []

    for reminder in reminders:
        delivered_channels: list[str] = []
        error_message: str | None = None

        try:
            if settings.push_notifications:
                delivered_channels.append("app")
                in_app_count += 1

            if settings.email_notifications:
                send_email(
                    to_email=user.email,
                    subject=build_reminder_email_subject(reminder),
                    body=build_reminder_email_body(reminder, user),
                )
                delivered_channels.append("email")
                email_sent_count += 1

            if settings.telegram_notifications and settings.telegram_chat_id:
                send_telegram_message(
                    chat_id=settings.telegram_chat_id,
                    text=build_reminder_telegram_message(reminder, user),
                )
                delivered_channels.append("telegram")
                telegram_sent_count += 1

            if settings.telegram_notifications and not settings.telegram_chat_id:
                delivered_channels.append("telegram_missing_chat_id")

            if not delivered_channels:
                skipped_count += 1
                results.append(
                    {
                        "reminder_id": reminder.id,
                        "status": "skipped",
                        "channels": [],
                        "message": "No notification channels enabled.",
                    }
                )
                continue

            reminder.status = "sent"
            reminder.sent_at = datetime.utcnow()

            create_action_log(
                db=db,
                user_id=user.id,
                entity_type="reminder",
                entity_id=reminder.id,
                action_type="notification_sent",
                message=(
                    f"Processed reminder #{reminder.id} via "
                    f"{', '.join(delivered_channels)}."
                ),
            )

            processed_count += 1

            results.append(
                {
                    "reminder_id": reminder.id,
                    "status": "sent",
                    "channels": delivered_channels,
                    "message": "Reminder notification processed successfully.",
                }
            )

        except Exception as exception:
            failed_count += 1
            error_message = str(exception)

            create_action_log(
                db=db,
                user_id=user.id,
                entity_type="reminder",
                entity_id=reminder.id,
                action_type="notification_failed",
                message=(
                    f"Failed to process reminder #{reminder.id}: "
                    f"{error_message}"
                ),
            )

            results.append(
                {
                    "reminder_id": reminder.id,
                    "status": "failed",
                    "channels": delivered_channels,
                    "message": error_message,
                }
            )

    db.commit()

    return {
        "due_count": len(reminders),
        "processed_count": processed_count,
        "email_sent_count": email_sent_count,
        "telegram_sent_count": telegram_sent_count,
        "in_app_count": in_app_count,
        "skipped_count": skipped_count,
        "failed_count": failed_count,
        "results": results,
    }
