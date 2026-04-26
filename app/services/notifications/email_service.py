import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv()


class EmailConfigurationError(Exception):
    """Raised when required SMTP configuration is missing."""


def get_required_env(name: str) -> str:
    """Return a required environment variable or raise a configuration error."""
    value = os.getenv(name)

    if not value:
        raise EmailConfigurationError(f"Missing required environment variable: {name}")

    return value


def send_email(
    to_email: str,
    subject: str,
    body: str,
) -> None:
    """Send a plain-text email using the configured SMTP provider."""
    smtp_host = get_required_env("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = get_required_env("SMTP_USERNAME")
    smtp_password = get_required_env("SMTP_PASSWORD")
    smtp_from_email = get_required_env("SMTP_FROM_EMAIL")
    smtp_from_name = os.getenv("SMTP_FROM_NAME", "SubPilot AI")

    message = EmailMessage()
    message["From"] = f"{smtp_from_name} <{smtp_from_email}>"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(message)


def send_test_email(to_email: str) -> None:
    """Send a test email to verify SMTP configuration."""
    send_email(
        to_email=to_email,
        subject="SubPilot test notification",
        body=(
            "Hello from SubPilot!\n\n"
            "Your email notification setup is working correctly.\n\n"
            "This is a test message from your SubPilot notification system."
        ),
    )
