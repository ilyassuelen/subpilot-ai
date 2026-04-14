from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.cancellation import CancellationResponse, CancellationGenerateRequest
from app.schemas.email_preview import EmailPreviewResponse
from app.services.cancellation_service import (
    generate_cancellation_draft,
    get_all_cancellation_requests,
    get_cancellation_request_by_id,
    approve_cancellation_request,
    mark_cancellation_request_as_sent,
    cancel_cancellation_request,
    can_transition_cancellation_status,
    build_cancellation_email_preview,
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
def generate_contract_cancellation(
        contract_id: int,
        request_data: CancellationGenerateRequest,
        db: Session = Depends(get_db)
):
    """Generate a cancellation draft for a given contract."""
    contract = get_contract_by_id(db, contract_id)

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    return generate_cancellation_draft(db, contract, request_data)


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


@router.get("/{cancellation_id}/email-preview", response_model=EmailPreviewResponse)
def get_cancellation_email_preview(cancellation_id: int, db: Session = Depends(get_db)):
    """Return a send-ready email preview for a cancellation request."""
    cancellation = get_cancellation_request_by_id(db, cancellation_id)

    if not cancellation:
        raise HTTPException(status_code=404, detail="Cancellation request not found")

    if cancellation.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Cancellation request must be approved before generating email preview"
        )

    if not cancellation.provider_email:
        raise HTTPException(status_code=400, detail="Provider email is missing")

    return build_cancellation_email_preview(cancellation)


@router.post("/{cancellation_id}/approve", response_model=CancellationResponse)
def approve_cancellation(cancellation_id: int, db: Session = Depends(get_db)):
    """Mark a cancellation draft as approved."""
    cancellation = get_cancellation_request_by_id(db, cancellation_id)

    if not cancellation:
        raise HTTPException(status_code=404, detail="Cancellation request not found")

    if not can_transition_cancellation_status(cancellation.status, "approved"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition cancellation request from '{cancellation.status}' to 'approved'",
        )

    return approve_cancellation_request(db, cancellation_id)


@router.post("/{cancellation_id}/mark-sent", response_model=CancellationResponse)
def mark_cancellation_sent(cancellation_id: int, db: Session = Depends(get_db)):
    """Mark a cancellation request as sent."""
    cancellation = get_cancellation_request_by_id(db, cancellation_id)

    if not cancellation:
        raise HTTPException(status_code=404, detail="Cancellation request not found")

    if not can_transition_cancellation_status(cancellation.status, "sent"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition cancellation request from '{cancellation.status}' to 'sent'",
        )

    return mark_cancellation_request_as_sent(db, cancellation_id)


@router.post("/{cancellation_id}/cancel", response_model=CancellationResponse)
def cancel_cancellation(cancellation_id: int, db: Session = Depends(get_db)):
    """Mark a cancellation request as cancelled."""
    cancellation = get_cancellation_request_by_id(db, cancellation_id)

    if not cancellation:
        raise HTTPException(status_code=404, detail="Cancellation request not found")

    if not can_transition_cancellation_status(cancellation.status, "cancelled"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition cancellation request from '{cancellation.status}' to 'cancelled'",
        )

    return cancel_cancellation_request(db, cancellation_id)
