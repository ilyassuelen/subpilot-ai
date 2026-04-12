from sqlalchemy.orm import Session

from app.models.cancellation import CancellationRequest
from app.models.contract import Contract
from app.services.action_log_service import create_action_log


def can_transition_cancellation_status(current_status: str, new_status: str) -> bool:
    """Validate whether a cancellation request is allowed to move to a new status."""
    allowed_transitions = {
        "draft": {"approved", "cancelled"},
        "approved": {"sent", "cancelled"},
        "sent": set(),
        "cancelled": set(),
    }

    return new_status in allowed_transitions.get(current_status, set())


def build_cancellation_subject(contract: Contract) -> str:
    """Build a cancellation email subject based on contract details."""
    return f"Cancellation request for {contract.title}"


def build_cancellation_message(contract: Contract) -> str:
    """Build a cancellation message based on contract type and contract details."""
    provider_name = contract.provider_name
    title = contract.title

    effective_date = (
        contract.end_date.strftime("%Y-%m-%d")
        if contract.end_date
        else "the next possible date"
    )

    if contract.contract_type == "subscription":
        return (
            f"Dear {provider_name},\n\n"
            f"I would like to cancel my subscription '{title}' effective {effective_date}.\n\n"
            f"Please send me a written confirmation of the cancellation.\n\n"
            f"Best regards"
        )

    if contract.contract_type in {"contract", "internet_contract", "mobile_contract"}:
        return (
            f"Dear {provider_name},\n\n"
            f"I hereby request the cancellation of my contract '{title}' effective {effective_date}.\n\n"
            f"Please confirm the cancellation in writing.\n\n"
            f"Best regards"
        )

    if contract.contract_type == "insurance":
        return (
            f"Dear {provider_name},\n\n"
            f"I would like to terminate my insurance contract '{title}' effective {effective_date}.\n\n"
            f"Please provide written confirmation of the termination.\n\n"
            f"Best regards"
        )

    return (
        f"Dear {provider_name},\n\n"
        f"I would like to cancel '{title}' at the next possible date.\n\n"
        f"Please confirm the cancellation in writing.\n\n"
        f"Best regards"
    )


def get_draft_cancellation_by_contract(db: Session, contract_id: int) -> CancellationRequest | None:
    """Return an existing draft cancellation request for a contract if one exists."""
    return (
        db.query(CancellationRequest)
        .filter(
            CancellationRequest.contract_id == contract_id,
            CancellationRequest.status == "draft",
        )
        .first()
    )


def generate_cancellation_draft(db: Session, contract: Contract) -> CancellationRequest:
    """Generate and persist a cancellation draft for a contract."""
    existing_draft = get_draft_cancellation_by_contract(db, contract.id)

    if existing_draft:
        return existing_draft

    cancellation_request = CancellationRequest(
        contract_id=contract.id,
        recipient_email=contract.provider_email,
        subject=build_cancellation_subject(contract),
        message=build_cancellation_message(contract),
        status="draft",
    )

    db.add(cancellation_request)
    db.commit()
    db.refresh(cancellation_request)

    create_action_log(
        db=db,
        entity_type="cancellation",
        entity_id=cancellation_request.id,
        action_type="generated",
        message=f"Generated cancellation draft for contract '{contract.title}'.",
    )
    db.commit()

    return cancellation_request


def get_all_cancellation_requests(db: Session) -> list[CancellationRequest]:
    """Return all cancellation requests stored in the database."""
    return db.query(CancellationRequest).all()


def get_cancellation_request_by_id(db: Session, cancellation_id: int) -> CancellationRequest | None:
    """Return a cancellation request by its ID or None if not found."""
    return (
        db.query(CancellationRequest)
        .filter(CancellationRequest.id == cancellation_id)
        .first()
    )


def approve_cancellation_request(db: Session, cancellation_id: int) -> CancellationRequest | None:
    """Mark a cancellation request as approved."""
    cancellation = get_cancellation_request_by_id(db, cancellation_id)

    if not cancellation:
        return None

    if not can_transition_cancellation_status(cancellation.status, "approved"):
        return None

    cancellation.status = "approved"
    db.commit()
    db.refresh(cancellation)

    create_action_log(
        db=db,
        entity_type="cancellation",
        entity_id=cancellation.id,
        action_type="approved",
        message=f"Approved cancellation request #{cancellation.id}.",
    )
    db.commit()

    return cancellation


def mark_cancellation_request_as_sent(db: Session, cancellation_id: int) -> CancellationRequest | None:
    """Mark a cancellation request as sent."""
    cancellation = get_cancellation_request_by_id(db, cancellation_id)

    if not cancellation:
        return None

    if not can_transition_cancellation_status(cancellation.status, "sent"):
        return None

    cancellation.status = "sent"
    db.commit()
    db.refresh(cancellation)

    create_action_log(
        db=db,
        entity_type="cancellation",
        entity_id=cancellation.id,
        action_type="sent",
        message=f"Marked cancellation request #{cancellation.id} as sent.",
    )
    db.commit()

    return cancellation


def cancel_cancellation_request(db: Session, cancellation_id: int) -> CancellationRequest | None:
    """Mark a cancellation request as cancelled."""
    cancellation = get_cancellation_request_by_id(db, cancellation_id)

    if not cancellation:
        return None

    if not can_transition_cancellation_status(cancellation.status, "cancelled"):
        return None

    cancellation.status = "cancelled"
    db.commit()
    db.refresh(cancellation)

    create_action_log(
        db=db,
        entity_type="cancellation",
        entity_id=cancellation.id,
        action_type="cancelled",
        message=f"Cancelled cancellation request #{cancellation.id}.",
    )
    db.commit()

    return cancellation
