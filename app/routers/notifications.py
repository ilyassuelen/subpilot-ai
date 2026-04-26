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

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class TestEmailRequest(BaseModel):
    """Schema for sending a test email notification."""

    to_email: EmailStr | None = None


class TestEmailResponse(BaseModel):
    """Schema returned after sending a test email notification."""

    message: str


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
