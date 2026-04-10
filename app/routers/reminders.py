from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.reminder import ReminderCreate, ReminderResponse
from app.services.reminder_service import (
    create_reminder,
    get_all_reminders,
    get_reminders_by_contract,
)

router = APIRouter(prefix="/reminders", tags=["Reminders"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=ReminderResponse)
def create_new_reminder(reminder: ReminderCreate, db: Session = Depends(get_db)):
    return create_reminder(db, reminder)


@router.get("/", response_model=list[ReminderResponse])
def get_reminders(db: Session = Depends(get_db)):
    return get_all_reminders(db)


@router.get("/contract/{contract_id}", response_model=list[ReminderResponse])
def get_contract_reminders(contract_id: int, db: Session = Depends(get_db)):
    return get_reminders_by_contract(db, contract_id)
