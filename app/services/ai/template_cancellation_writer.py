"""Template-based fallback writer for neutral cancellation text generation."""

from app.models.contract import Contract


def generate_template_cancellation_text(contract: Contract, language: str) -> str:
    """Generate a neutral cancellation text without personal user data."""
    provider_name = contract.provider_name
    title = contract.title

    effective_date = (
        contract.end_date.strftime("%Y-%m-%d")
        if contract.end_date
        else "the next possible date"
    )

    normalized_language = (language or "en").lower()

    if normalized_language == "de":
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
