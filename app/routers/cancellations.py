from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.cancellation import CancellationResponse
from app.services.cancellation_service import (
    generate_cancellation_draft,
    get_all_cancellation_requests,
    get_cancellation_request_by_id,
)
from app.services.contract_service import get_contract_by_id

router = APIRouter(prefix="/cancellations", tags=["Cancellations"])


def get_db():
    """Provide a database session for each request and close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/contract/{contract_id}/generate", response_model=CancellationResponse)
def generate_contract_cancellation(contract_id: int, db: Session = Depends(get_db)):
    """Generate a cancellation draft for a given contract."""
    contract = get_contract_by_id(db, contract_id)

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    return generate_cancellation_draft(db, contract)


@router.get("/", response_model=list[CancellationResponse])
def get_cancellations(db: Session = Depends(get_db)):
    """Return all generated cancellation drafts."""
    return get_all_cancellation_requests(db)


@router.get("/{cancellation_id}", response_model=CancellationResponse)
def get_cancellation(cancellation_id: int, db: Session = Depends(get_db)):
    """Return a single cancellation draft by its ID."""
    cancellation = get_cancellation_request_by_id(db, cancellation_id)

    if not cancellation:
        raise HTTPException(status_code=404, detail="Cancellation request not found")

    return cancellation
