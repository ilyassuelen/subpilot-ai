from datetime import datetime, time, timedelta

from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.services.contract_service import calculate_cancellation_deadline
from app.services.action_log_service import create_action_log
from app.models.reminder import Reminder
from app.schemas.reminder import ReminderCreate


def create_reminder(db: Session, reminder_data: ReminderCreate) -> Reminder:
    """Create and persist a new reminder in the database."""
    reminder = Reminder(
        contract_id=reminder_data.contract_id,
        reminder_type=reminder_data.reminder_type,
        message=reminder_data.message,
        scheduled_for=reminder_data.scheduled_for,
        channel=reminder_data.channel,
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    create_action_log(
        db=db,
        entity_type="reminder",
        entity_id=reminder.id,
        action_type="created",
        message=f"Created reminder for contract #{reminder.contract_id}.",
    )
    db.commit()

    return reminder


def get_all_reminders(db: Session) -> list[Reminder]:
    """Return all reminders stored in the database."""
    return db.query(Reminder).all()


def get_reminders_by_contract(db: Session, contract_id: int) -> list[Reminder]:
    """Return all reminders associated with a specific contract."""
    return db.query(Reminder).filter(Reminder.contract_id == contract_id).all()


def update_reminder_statuses(db: Session) -> list[Reminder]:
    """Mark overdue pending reminders as missed and return the updated reminders."""
    reminders = db.query(Reminder).all()
    now = datetime.utcnow()

    updated_reminders = []

    for reminder in reminders:
        if reminder.status == "pending" and reminder.scheduled_for < now:
            reminder.status = "missed"
            updated_reminders.append(reminder)

    db.commit()

    for reminder in updated_reminders:
        db.refresh(reminder)
        create_action_log(
            db=db,
            entity_type="reminder",
            entity_id=reminder.id,
            action_type="missed",
            message=f"Marked reminder #{reminder.id} as missed.",
        )

    db.commit()

    return updated_reminders


def generate_default_reminders_for_contract(db: Session, contract: Contract) -> list[Reminder]:
    """Generate default cancellation reminders for a contract while skipping past dates and duplicates."""
    cancellation_deadline = calculate_cancellation_deadline(contract)

    if not cancellation_deadline:
        return []

    reminder_offsets = [14, 7, 1, 0]
    created_reminders = []

    now = datetime.utcnow()

    for offset in reminder_offsets:
        reminder_date = cancellation_deadline - timedelta(days=offset)
        scheduled_for = datetime.combine(reminder_date, time(hour=9, minute=0))

        # Skip past reminders
        if scheduled_for < now:
            continue

        # Skip duplicates
        existing = db.query(Reminder).filter(
            Reminder.contract_id == contract.id,
            Reminder.reminder_type == "cancellation",
            Reminder.scheduled_for == scheduled_for,
        ).first()

        if existing:
            continue

        reminder = Reminder(
            contract_id=contract.id,
            reminder_type="cancellation",
            message=f"Reminder: '{contract.title}' reaches its cancellation deadline in {offset} day(s).",
            scheduled_for=scheduled_for,
            channel="app",
            status="pending",
        )

        db.add(reminder)
        created_reminders.append(reminder)

    db.commit()

    for reminder in created_reminders:
        db.refresh(reminder)
        create_action_log(
            db=db,
            entity_type="reminder",
            entity_id=reminder.id,
            action_type="generated",
            message=f"Generated default reminder for contract #{reminder.contract_id}.",
        )

    db.commit()

    return created_reminders
