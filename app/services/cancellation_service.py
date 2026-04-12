from datetime import datetime

from sqlalchemy.orm import Session

from app.models.cancellation import CancellationRequest
from app.models.contract import Contract
from app.schemas.cancellation import CancellationGenerateRequest
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


def build_cancellation_subject(contract: Contract, language: str) -> str:
    """Build a cancellation subject line based on contract details and selected language."""
    if language == "de":
        return f"Kündigung für {contract.title}"
    return f"Cancellation request for {contract.title}"


def build_generated_message(contract: Contract, language: str) -> str:
    """Build a neutral cancellation body without personal user data."""
    provider_name = contract.provider_name
    title = contract.title
    effective_date = (
        contract.end_date.strftime("%Y-%m-%d")
        if contract.end_date
        else "the next possible date"
    )

    if language == "de":
        if contract.contract_type == "subscription":
            return (
                f"hiermit kündige ich mein Abonnement '{title}' bei {provider_name} "
                f"zum {effective_date} beziehungsweise zum nächstmöglichen Zeitpunkt.\n\n"
                f"Bitte bestätigen Sie mir die Kündigung schriftlich."
            )

        if contract.contract_type in {"contract", "internet_contract", "mobile_contract"}:
            return (
                f"hiermit kündige ich meinen Vertrag '{title}' bei {provider_name} "
                f"zum {effective_date} beziehungsweise zum nächstmöglichen Zeitpunkt.\n\n"
                f"Bitte bestätigen Sie mir die Kündigung schriftlich."
            )

        if contract.contract_type == "insurance":
            return (
                f"hiermit kündige ich meinen Versicherungsvertrag '{title}' bei {provider_name} "
                f"zum {effective_date} beziehungsweise zum nächstmöglichen Zeitpunkt.\n\n"
                f"Bitte senden Sie mir eine schriftliche Bestätigung der Kündigung."
            )

        return (
            f"hiermit kündige ich '{title}' bei {provider_name} zum nächstmöglichen Zeitpunkt.\n\n"
            f"Bitte bestätigen Sie mir die Kündigung schriftlich."
        )

    if contract.contract_type == "subscription":
        return (
            f"I hereby cancel my subscription '{title}' with {provider_name} effective {effective_date} "
            f"or at the next possible date.\n\n"
            f"Please confirm the cancellation in writing."
        )

    if contract.contract_type in {"contract", "internet_contract", "mobile_contract"}:
        return (
            f"I hereby cancel my contract '{title}' with {provider_name} effective {effective_date} "
            f"or at the next possible date.\n\n"
            f"Please confirm the cancellation in writing."
        )

    if contract.contract_type == "insurance":
        return (
            f"I hereby cancel my insurance contract '{title}' with {provider_name} effective {effective_date} "
            f"or at the next possible date.\n\n"
            f"Please provide written confirmation of the cancellation."
        )

    return (
        f"I hereby cancel '{title}' with {provider_name} at the next possible date.\n\n"
        f"Please confirm the cancellation in writing."
    )


def build_final_message(
    contract: Contract,
    request_data: CancellationGenerateRequest,
    subject: str,
    generated_message: str,
) -> str:
    """Build the full cancellation letter by inserting personal and provider data in the backend."""
    date_str = datetime.utcnow().strftime("%Y-%m-%d")

    customer_block_parts = [
        request_data.customer_name,
        request_data.customer_address,
        request_data.customer_email,
    ]
    customer_block = "\n".join(part for part in customer_block_parts if part)

    provider_block_parts = [
        contract.provider_name,
        request_data.provider_address,
        request_data.provider_email or contract.provider_email,
    ]
    provider_block = "\n".join(part for part in provider_block_parts if part)

    customer_number_line = (
        f"\nCustomer number: {request_data.customer_number}"
        if request_data.customer_number and request_data.language != "de"
        else (
            f"\nKundennummer: {request_data.customer_number}"
            if request_data.customer_number
            else ""
        )
    )

    if request_data.language == "de":
        return (
            f"{customer_block}\n\n"
            f"{provider_block}\n\n"
            f"Datum: {date_str}\n\n"
            f"Betreff: {subject}{customer_number_line}\n\n"
            f"Sehr geehrte Damen und Herren,\n\n"
            f"{generated_message}\n\n"
            f"Mit freundlichen Grüßen\n"
            f"{request_data.customer_name or ''}".strip()
        )

    return (
        f"{customer_block}\n\n"
        f"{provider_block}\n\n"
        f"Date: {date_str}\n\n"
        f"Subject: {subject}{customer_number_line}\n\n"
        f"Dear Sir or Madam,\n\n"
        f"{generated_message}\n\n"
        f"Best regards\n"
        f"{request_data.customer_name or ''}".strip()
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


def generate_cancellation_draft(
        db: Session,
        contract: Contract,
        request_data: CancellationGenerateRequest,
) -> CancellationRequest:
    """Generate and persist a cancellation draft for a contract using form input."""
    existing_draft = get_draft_cancellation_by_contract(db, contract.id)

    subject = build_cancellation_subject(contract, request_data.language)
    generated_message = build_generated_message(contract, request_data.language)
    final_message = build_final_message(contract, request_data, subject, generated_message)

    if existing_draft:
        existing_draft.language = request_data.language
        existing_draft.customer_name = request_data.customer_name
        existing_draft.customer_address = request_data.customer_address
        existing_draft.customer_email = request_data.customer_email
        existing_draft.customer_number = request_data.customer_number
        existing_draft.provider_name = contract.provider_name
        existing_draft.provider_email = request_data.provider_email or contract.provider_email
        existing_draft.provider_address = request_data.provider_address
        existing_draft.subject = subject
        existing_draft.generated_message = generated_message
        existing_draft.final_message = final_message

        db.commit()
        db.refresh(existing_draft)

        create_action_log(
            db=db,
            entity_type="cancellation",
            entity_id=existing_draft.id,
            action_type="updated",
            message=f"Updated cancellation draft for contract '{contract.title}'.",
        )
        db.commit()

        return existing_draft

    cancellation_request = CancellationRequest(
        contract_id=contract.id,
        language=request_data.language,
        customer_name=request_data.customer_name,
        customer_address=request_data.customer_address,
        customer_email=request_data.customer_email,
        customer_number=request_data.customer_number,
        provider_name=contract.provider_name,
        provider_email=request_data.provider_email or contract.provider_email,
        provider_address=request_data.provider_address,
        subject=subject,
        generated_message=generated_message,
        final_message=final_message,
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
    cancellation.sent_at = datetime.utcnow()
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
