import logging
import os

from apscheduler.schedulers.background import BackgroundScheduler

from app.core.database import SessionLocal
from app.services.notifications.notification_dispatcher import (
    process_due_reminders_for_all_users,
)

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def reminder_agent_job() -> None:
    """Run the reminder notification agent for all users."""
    db = SessionLocal()

    try:
        result = process_due_reminders_for_all_users(db)

        logger.info(
            "Reminder agent finished: users=%s due=%s processed=%s email=%s telegram=%s failed=%s",
            result["user_count"],
            result["due_count"],
            result["processed_count"],
            result["email_sent_count"],
            result["telegram_sent_count"],
            result["failed_count"],
        )

    except Exception as exception:
        logger.exception("Reminder agent failed: %s", exception)

    finally:
        db.close()


def start_reminder_agent_scheduler() -> None:
    """Start the reminder agent scheduler if enabled."""
    enabled = os.getenv("REMINDER_AGENT_ENABLED", "false").lower() == "true"

    if not enabled:
        logger.info("Reminder agent scheduler is disabled.")
        return

    if scheduler.running:
        logger.info("Reminder agent scheduler is already running.")
        return

    interval_minutes = int(os.getenv("REMINDER_AGENT_INTERVAL_MINUTES", "5"))

    scheduler.add_job(
        reminder_agent_job,
        trigger="interval",
        minutes=interval_minutes,
        id="reminder_agent_job",
        replace_existing=True,
        max_instances=1,
    )

    scheduler.start()

    logger.info(
        "Reminder agent scheduler started with interval=%s minute(s).",
        interval_minutes,
    )


def stop_reminder_agent_scheduler() -> None:
    """Stop the reminder agent scheduler if it is running."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Reminder agent scheduler stopped.")
