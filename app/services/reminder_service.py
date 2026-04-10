from sqlalchemy.orm import Session

from app.models.reminder import Reminder
from app.schemas.reminder import ReminderCreate


def create_reminder(db: Session, reminder_data: ReminderCreate) -> Reminder:
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

    return reminder


def get_all_reminders(db: Session) -> list[Reminder]:
    return db.query(Reminder).all()


def get_reminders_by_contract(db: Session, contract_id: int) -> list[Reminder]:
    return db.query(Reminder).filter(Reminder.contract_id == contract_id).all()
