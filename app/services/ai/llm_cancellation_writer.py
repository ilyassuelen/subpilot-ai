"""LLM-based writer for neutral cancellation text generation."""

import os

from openai import OpenAI

from app.models.contract import Contract


def generate_llm_cancellation_text(contract: Contract, language: str) -> str:
    """Generate a neutral cancellation text using an LLM without personal user data."""
    api_key = os.getenv("OPENAI_API_KEY")
    model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set.")

    client = OpenAI(api_key=api_key)

    effective_date = (
        contract.end_date.strftime("%Y-%m-%d")
        if contract.end_date
        else "the next possible date"
    )

    normalized_language = (language or "en").lower()

    language_instruction = (
        "Write the cancellation text in German." if normalized_language == "de"
        else "Write the cancellation text in English."
    )

    prompt = f"""
You are writing a professional cancellation text.

Important rules:
- Do not include personal data.
- Do not invent names, addresses, customer numbers, or email addresses.
- Only write the neutral cancellation body text.
- Keep it concise, professional, and legally clear.
- Do not include a subject line.
- Do not include a greeting like "Dear Sir or Madam" or "Sehr geehrte Damen und Herren".
- Do not include a signature.
- Always express a clear cancellation intent.
- Always ask for written confirmation of the cancellation.
- The date "{effective_date}" refers to the intended cancellation effective date or contract end date.
- Do NOT describe this date as the contract start date, activation date, or effective start.
- Do not invent legal claims or extra facts.
- Use wording like "zum {effective_date} beziehungsweise zum nächstmöglichen Zeitpunkt" in German when appropriate.
- Use wording like "effective {effective_date} or at the next possible date" in English when appropriate.

Contract details:
- Provider name: {contract.provider_name}
- Contract title: {contract.title}
- Contract type: {contract.contract_type}
- Intended cancellation effective date: {effective_date}

{language_instruction}
"""

    response = client.responses.create(
        model=model_name,
        input=prompt,
        temperature=0.2,
    )

    text = response.output_text.strip()

    if not text:
        raise RuntimeError("LLM returned empty cancellation text.")

    return text
