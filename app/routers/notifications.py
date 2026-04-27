from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.notifications.email_service import (
    EmailConfigurationError,
    send_test_email,
)
from app.services.notifications.notification_dispatcher import (
    process_due_reminders_for_user,
)
from app.services.notifications.telegram_service import (
    TelegramConfigurationError,
    TelegramDeliveryError,
    send_test_telegram_message,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class TestEmailRequest(BaseModel):
    """Schema for sending a test email notification."""

    to_email: EmailStr | None = None


class TestEmailResponse(BaseModel):
    """Schema returned after sending a test email notification."""

    message: str


class TestTelegramRequest(BaseModel):
    """Schema for sending a test Telegram notification."""

    chat_id: str


class TestTelegramResponse(BaseModel):
    """Schema returned after sending a test Telegram notification."""

    message: str


class ReminderNotificationResult(BaseModel):
    """Schema for a single processed reminder notification result."""

    reminder_id: int
    status: str
    channels: list[str]
    message: str


class ProcessDueRemindersResponse(BaseModel):
    """Schema returned after processing due reminder notifications."""

    due_count: int
    processed_count: int
    email_sent_count: int
    telegram_sent_count: int
    in_app_count: int
    skipped_count: int
    failed_count: int
    results: list[ReminderNotificationResult]


def get_db():
    """Provide a database session for each request and close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/test-email", response_model=TestEmailResponse)
def send_test_email_notification(
    data: TestEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a test email notification to the current user or a provided email address."""
    _ = db

    target_email = data.to_email or current_user.email

    try:
        send_test_email(target_email)

    except EmailConfigurationError as exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exception),
        ) from exception

    except Exception as exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to send test email: {exception}",
        ) from exception

    return TestEmailResponse(
        message=f"Test email sent to {target_email}.",
    )


@router.post("/test-telegram", response_model=TestTelegramResponse)
def send_test_telegram_notification(
    data: TestTelegramRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a test Telegram notification to the provided Telegram chat ID."""
    _ = db
    _ = current_user

    try:
        send_test_telegram_message(data.chat_id)

    except TelegramConfigurationError as exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exception),
        ) from exception

    except TelegramDeliveryError as exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exception),
        ) from exception

    except Exception as exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to send test Telegram message: {exception}",
        ) from exception

    return TestTelegramResponse(
        message=f"Test Telegram message sent to chat ID {data.chat_id}.",
    )


@router.post(
    "/process-due-reminders",
    response_model=ProcessDueRemindersResponse,
)
def process_due_reminder_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Process due pending reminders for the current user and send enabled notifications."""
    try:
        return process_due_reminders_for_user(db, current_user)

    except EmailConfigurationError as exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exception),
        ) from exception

    except TelegramConfigurationError as exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exception),
        ) from exception

    except TelegramDeliveryError as exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exception),
        ) from exception

    except Exception as exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process due reminders: {exception}",
        ) from exception
