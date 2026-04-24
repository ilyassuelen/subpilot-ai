from datetime import datetime
from urllib.parse import quote

from sqlalchemy.orm import Session

from app.models.cancellation import CancellationRequest
from app.models.contract import Contract
from app.schemas.cancellation import CancellationGenerateRequest
from app.services.action_log_service import create_action_log
from app.services.ai.cancellation_writer import generate_cancellation_text


def can_transition_cancellation_status(current_status: str, target_status: str) -> bool:
    """Validate allowed cancellation status transitions."""
    allowed_transitions = {
        "draft": {"approved", "cancelled"},
        "approved": {"sent", "cancelled"},
        "sent": set(),
        "cancelled": set(),
    }

    return target_status in allowed_transitions.get(current_status, set())


def normalize_optional_text(value: str | None) -> str | None:
    """Normalize optional text values from form input."""
    if value is None:
        return None

    cleaned = value.strip()

    if cleaned == "":
        return None

    return cleaned


def build_cancellation_subject(contract: Contract, language: str) -> str:
    """Build a cancellation subject line."""
    if language == "de":
        return f"Kündigung meines Vertrags bei {contract.provider_name}"

    return f"Cancellation of my contract with {contract.provider_name}"


def build_final_message(
    contract: Contract,
    request_data: CancellationGenerateRequest,
    subject: str,
    generated_message: str,
) -> str:
    """Build the final composed cancellation letter."""
    today = datetime.utcnow().strftime("%d.%m.%Y")

    customer_name = normalize_optional_text(request_data.customer_name)
    customer_address = normalize_optional_text(request_data.customer_address)
    customer_email = normalize_optional_text(request_data.customer_email)
    customer_number = normalize_optional_text(request_data.customer_number)
    provider_email = normalize_optional_text(request_data.provider_email) or contract.provider_email
    provider_address = normalize_optional_text(request_data.provider_address)

    customer_block = "\n".join(
        value
        for value in [customer_name, customer_address, customer_email]
        if value
    )

    provider_block = "\n".join(
        value
        for value in [
            contract.provider_name,
            provider_address,
            provider_email,
        ]
        if value
    )

    if request_data.language == "de":
        customer_number_line = (
            f"\nKundennummer: {customer_number}" if customer_number else ""
        )

        return (
            f"{customer_block}\n\n"
            f"{provider_block}\n\n"
            f"Datum: {today}\n\n"
            f"Betreff: {subject}{customer_number_line}\n\n"
            f"Sehr geehrte Damen und Herren,\n\n"
            f"{generated_message}\n\n"
            f"Mit freundlichen Grüßen\n"
            f"{customer_name or ''}"
        ).strip()

    customer_number_line = (
        f"\nCustomer number: {customer_number}" if customer_number else ""
    )

    return (
        f"{customer_block}\n\n"
        f"{provider_block}\n\n"
        f"Date: {today}\n\n"
        f"Subject: {subject}{customer_number_line}\n\n"
        f"Dear Sir or Madam,\n\n"
        f"{generated_message}\n\n"
        f"Best regards\n"
        f"{customer_name or ''}"
    ).strip()


def generate_cancellation_draft(
    db: Session,
    user_id: int,
    contract: Contract,
    request_data: CancellationGenerateRequest,
) -> CancellationRequest:
    """Generate and persist a cancellation draft for a given contract."""
    subject = build_cancellation_subject(contract, request_data.language)

    generated_message = generate_cancellation_text(
        contract=contract,
        language=request_data.language,
    )

    final_message = build_final_message(
        contract=contract,
        request_data=request_data,
        subject=subject,
        generated_message=generated_message,
    )

    cancellation_request = CancellationRequest(
        user_id=user_id,
        contract_id=contract.id,
        language=request_data.language,
        customer_name=normalize_optional_text(request_data.customer_name),
        customer_address=normalize_optional_text(request_data.customer_address),
        customer_email=normalize_optional_text(request_data.customer_email),
        customer_number=normalize_optional_text(request_data.customer_number),
        provider_name=contract.provider_name,
        provider_email=normalize_optional_text(request_data.provider_email)
        or contract.provider_email,
        provider_address=normalize_optional_text(request_data.provider_address),
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
        user_id=user_id,
        entity_type="cancellation",
        entity_id=cancellation_request.id,
        action_type="generated",
        message=f"Generated cancellation draft for contract '{contract.title}'.",
    )
    db.commit()

    return cancellation_request


def get_all_cancellation_requests(db: Session, user_id: int) -> list[CancellationRequest]:
    """Return all cancellation requests for a specific user."""
    return (
        db.query(CancellationRequest)
        .filter(CancellationRequest.user_id == user_id)
        .order_by(CancellationRequest.created_at.desc())
        .all()
    )


def get_cancellation_request_by_id(
    db: Session,
    cancellation_id: int,
    user_id: int,
) -> CancellationRequest | None:
    """Return a cancellation request by its ID for a specific user."""
    return (
        db.query(CancellationRequest)
        .filter(
            CancellationRequest.id == cancellation_id,
            CancellationRequest.user_id == user_id,
        )
        .first()
    )


def approve_cancellation_request(
    db: Session,
    user_id: int,
    cancellation_id: int,
) -> CancellationRequest | None:
    """Mark a cancellation request as approved."""
    cancellation = get_cancellation_request_by_id(db, cancellation_id, user_id)

    if not cancellation:
        return None

    if not can_transition_cancellation_status(cancellation.status, "approved"):
        return None

    cancellation.status = "approved"
    db.commit()
    db.refresh(cancellation)

    create_action_log(
        db=db,
        user_id=user_id,
        entity_type="cancellation",
        entity_id=cancellation.id,
        action_type="approved",
        message=f"Approved cancellation request #{cancellation.id}.",
    )
    db.commit()

    return cancellation


def mark_cancellation_request_as_sent(
    db: Session,
    user_id: int,
    cancellation_id: int,
) -> CancellationRequest | None:
    """Mark a cancellation request as sent."""
    cancellation = get_cancellation_request_by_id(db, cancellation_id, user_id)

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
        user_id=user_id,
        entity_type="cancellation",
        entity_id=cancellation.id,
        action_type="sent",
        message=f"Marked cancellation request #{cancellation.id} as sent.",
    )
    db.commit()

    return cancellation


def cancel_cancellation_request(
    db: Session,
    user_id: int,
    cancellation_id: int,
) -> CancellationRequest | None:
    """Mark a cancellation request as cancelled."""
    cancellation = get_cancellation_request_by_id(db, cancellation_id, user_id)

    if not cancellation:
        return None

    if not can_transition_cancellation_status(cancellation.status, "cancelled"):
        return None

    cancellation.status = "cancelled"
    db.commit()
    db.refresh(cancellation)

    create_action_log(
        db=db,
        user_id=user_id,
        entity_type="cancellation",
        entity_id=cancellation.id,
        action_type="cancelled",
        message=f"Cancelled cancellation request #{cancellation.id}.",
    )
    db.commit()

    return cancellation


def build_cancellation_email_preview(cancellation: CancellationRequest) -> dict:
    """Build a send-ready email preview including a mailto link."""
    if not cancellation.provider_email:
        raise ValueError("Cancellation request has no provider email.")

    to = cancellation.provider_email
    subject = cancellation.subject
    body = cancellation.final_message

    encoded_subject = quote(subject)
    encoded_body = quote(body)
    encoded_to = quote(to)

    mailto_link = f"mailto:{encoded_to}?subject={encoded_subject}&body={encoded_body}"

    return {
        "to": to,
        "subject": subject,
        "body": body,
        "mailto_link": mailto_link,
    }
