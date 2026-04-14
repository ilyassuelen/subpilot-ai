"""AI-ready cancellation text generation layer with LLM support and template fallback."""

import os

from app.models.contract import Contract
from app.services.ai.llm_cancellation_writer import generate_llm_cancellation_text
from app.services.ai.template_cancellation_writer import generate_template_cancellation_text


def is_valid_cancellation_text(text: str, language: str) -> bool:
    """Validate whether the generated cancellation text meets minimum quality requirements."""
    if not text:
        return False

    cleaned = text.strip()

    if len(cleaned) < 40:
        return False

    if len(cleaned) > 1200:
        return False

    normalized_language = (language or "en").lower()
    lowered = cleaned.lower()

    invalid_patterns = [
        "dear sir or madam",
        "sehr geehrte damen und herren",
        "best regards",
        "mit freundlichen grüßen",
        "subject:",
        "betreff:",
    ]

    if any(pattern in lowered for pattern in invalid_patterns):
        return False

    if normalized_language == "de":
        has_cancellation_intent = any(
            phrase in lowered
            for phrase in [
                "kündige",
                "kündigung",
                "abonnement",
                "vertrag",
                "versicherungsvertrag",
            ]
        )
        has_confirmation_request = any(
            phrase in lowered
            for phrase in [
                "bestätigen sie",
                "schriftlich",
                "bestätigung",
            ]
        )
    else:
        has_cancellation_intent = any(
            phrase in lowered
            for phrase in [
                "cancel",
                "cancellation",
                "subscription",
                "contract",
                "insurance contract",
            ]
        )
        has_confirmation_request = any(
            phrase in lowered
            for phrase in [
                "confirm",
                "written confirmation",
                "in writing",
            ]
        )

    return has_cancellation_intent and has_confirmation_request


def generate_cancellation_text(contract: Contract, language: str) -> str:
    """Generate cancellation text using the configured writer with validation and template fallback."""
    ai_mode = os.getenv("AI_MODE", "template").lower()

    if ai_mode == "openai":
        try:
            text = generate_llm_cancellation_text(contract, language)

            if is_valid_cancellation_text(text, language):
                return text

            return generate_template_cancellation_text(contract, language)
        except Exception:
            return generate_template_cancellation_text(contract, language)

    return generate_template_cancellation_text(contract, language)
