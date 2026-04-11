from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.reminder import ReminderCreate, ReminderResponse, ReminderGenerateResponse
from app.services.contract_service import get_contract_by_id
from app.services.reminder_service import (
    create_reminder,
    get_all_reminders,
    get_reminders_by_contract,
    generate_default_reminders_for_contract,
    update_reminder_statuses,
)

router = APIRouter(prefix="/reminders", tags=["Reminders"])


def get_db():
    """Provide a database session for each request and close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=ReminderResponse)
def create_new_reminder(reminder: ReminderCreate, db: Session = Depends(get_db)):
    """Create a new reminder and return the saved reminder."""
    return create_reminder(db, reminder)


@router.get("/", response_model=list[ReminderResponse])
def get_reminders(db: Session = Depends(get_db)):
    """Return all reminders."""
    return get_all_reminders(db)


@router.post("/update-statuses", response_model=list[ReminderResponse])
def update_all_reminder_statuses(db: Session = Depends(get_db)):
    """Update reminder statuses, marking overdue pending reminders as missed."""
    return update_reminder_statuses(db)


@router.get("/contract/{contract_id}", response_model=list[ReminderResponse])
def get_contract_reminders(contract_id: int, db: Session = Depends(get_db)):
    """Return all reminders for a specific contract."""
    return get_reminders_by_contract(db, contract_id)


@router.post("/contract/{contract_id}/generate", response_model=ReminderGenerateResponse)
def generate_contract_reminders(contract_id: int, db: Session = Depends(get_db)):
    """Generate default reminders for a contract based on its cancellation deadline."""
    contract = get_contract_by_id(db, contract_id)

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    reminders = generate_default_reminders_for_contract(db, contract)

    return {
        "generated_count": len(reminders),
        "reminders": reminders,
    }
