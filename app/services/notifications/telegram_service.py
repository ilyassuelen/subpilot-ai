import os
import urllib.error
import urllib.parse
import urllib.request

from dotenv import load_dotenv

load_dotenv()


class TelegramConfigurationError(Exception):
    """Raised when required Telegram configuration is missing."""


class TelegramDeliveryError(Exception):
    """Raised when Telegram message delivery fails."""


def get_telegram_bot_token() -> str:
    """Return the configured Telegram bot token or raise a configuration error."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")

    if not token:
        raise TelegramConfigurationError(
            "Missing required environment variable: TELEGRAM_BOT_TOKEN"
        )

    return token


def send_telegram_message(
    chat_id: str,
    text: str,
) -> None:
    """Send a plain-text Telegram message to a chat using the configured bot."""
    token = get_telegram_bot_token()

    payload = urllib.parse.urlencode(
        {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": "true",
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        url=f"https://api.telegram.org/bot{token}/sendMessage",
        data=payload,
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            if response.status >= 400:
                raise TelegramDeliveryError(
                    f"Telegram API returned status {response.status}"
                )

    except urllib.error.HTTPError as exception:
        raise TelegramDeliveryError(
            f"Telegram API error {exception.code}: {exception.reason}"
        ) from exception

    except urllib.error.URLError as exception:
        raise TelegramDeliveryError(
            f"Telegram connection error: {exception.reason}"
        ) from exception


def send_test_telegram_message(chat_id: str) -> None:
    """Send a test Telegram message to verify bot configuration."""
    send_telegram_message(
        chat_id=chat_id,
        text=(
            "Hello from SubPilot!\n\n"
            "Your Telegram notification setup is working correctly."
        ),
    )
