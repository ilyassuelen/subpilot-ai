from datetime import datetime, time, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.models.reminder import Reminder
from app.schemas.reminder import ReminderCreate
from app.services.action_log_service import create_action_log
from app.services.contract_service import calculate_cancellation_deadline


def create_reminder(db: Session, reminder_data: ReminderCreate) -> Reminder:
    """Create and persist a new reminder in the database."""
    contract = db.query(Contract).filter(Contract.id == reminder_data.contract_id).first()
    if not contract:
        raise ValueError("Contract not found")

    scheduled_for = reminder_data.scheduled_for

    if scheduled_for <= datetime.now(timezone.utc):
        raise ValueError("Scheduled date must be in the future")

    reminder = Reminder(
        contract_id=reminder_data.contract_id,
        reminder_type=reminder_data.reminder_type,
        message=reminder_data.message,
        scheduled_for=scheduled_for,
        channel=reminder_data.channel,
        status="pending",
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
    """Return all reminders sorted by scheduled date."""
    return (
        db.query(Reminder)
        .order_by(Reminder.scheduled_for.asc(), Reminder.created_at.asc())
        .all()
    )


def get_reminders_by_contract(db: Session, contract_id: int) -> list[Reminder]:
    """Return all reminders associated with a specific contract."""
    return (
        db.query(Reminder)
        .filter(Reminder.contract_id == contract_id)
        .order_by(Reminder.scheduled_for.asc(), Reminder.created_at.asc())
        .all()
    )


def get_reminder_by_id(db: Session, reminder_id: int) -> Reminder | None:
    return db.query(Reminder).filter(Reminder.id == reminder_id).first()


def update_reminder_statuses(db: Session) -> list[Reminder]:
    """Mark overdue pending reminders as missed and return the updated reminders."""
    now = datetime.now(timezone.utc)

    reminders = (
        db.query(Reminder)
        .filter(Reminder.status == "pending", Reminder.scheduled_for < now)
        .all()
    )

    for reminder in reminders:
        reminder.status = "missed"

    db.commit()

    for reminder in reminders:
        db.refresh(reminder)
        create_action_log(
            db=db,
            entity_type="reminder",
            entity_id=reminder.id,
            action_type="missed",
            message=f"Marked reminder #{reminder.id} as missed.",
        )

    db.commit()

    return reminders


def mark_reminder_as_sent(db: Session, reminder_id: int) -> Reminder | None:
    """Mark a reminder as sent."""
    reminder = get_reminder_by_id(db, reminder_id)

    if not reminder:
        return None

    if reminder.status == "sent":
        return reminder

    reminder.status = "sent"
    reminder.sent_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(reminder)

    create_action_log(
        db=db,
        entity_type="reminder",
        entity_id=reminder.id,
        action_type="sent",
        message=f"Marked reminder #{reminder.id} as sent.",
    )
    db.commit()

    return reminder


def generate_default_reminders_for_contract(db: Session, contract: Contract) -> list[Reminder]:
    """Generate default cancellation reminders for a contract while skipping past dates and duplicates."""
    cancellation_deadline = calculate_cancellation_deadline(contract)

    if not cancellation_deadline or contract.status != "active":
        return []

    reminder_offsets = [14, 7, 1, 0]
    created_reminders = []
    now = datetime.now(timezone.utc)

    for offset in reminder_offsets:
        reminder_date = cancellation_deadline - timedelta(days=offset)

        scheduled_for = datetime(
            year=reminder_date.year,
            month=reminder_date.month,
            day=reminder_date.day,
            hour=9,
            minute=0,
            tzinfo=timezone.utc,
        )

        if scheduled_for < now:
            continue

        existing = (
            db.query(Reminder)
            .filter(
                Reminder.contract_id == contract.id,
                Reminder.reminder_type == "cancellation",
                Reminder.scheduled_for == scheduled_for,
            )
            .first()
        )

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
