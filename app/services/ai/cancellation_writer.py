"""AI-ready cancellation text generation layer with LLM support and template fallback."""

import os

from app.models.contract import Contract
from app.services.ai.llm_cancellation_writer import generate_llm_cancellation_text
from app.services.ai.template_cancellation_writer import generate_template_cancellation_text


def generate_cancellation_text(contract: Contract, language: str) -> str:
    """Generate cancellation text using the configured writer with template fallback."""
    ai_mode = os.getenv("AI_MODE", "template").lower()

    if ai_mode == "openai":
        try:
            return generate_llm_cancellation_text(contract, language)
        except Exception:
            return generate_template_cancellation_text(contract, language)

    return generate_template_cancellation_text(contract, language)
