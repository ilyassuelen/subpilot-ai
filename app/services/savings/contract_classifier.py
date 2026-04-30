from app.models.contract import Contract


def classify_contract(contract: Contract) -> str:
    """Classify a contract into a broad savings research category."""
    name = (contract.title or "").lower()
    category = (contract.category or "").lower()
    provider = (contract.provider_name or "").lower()
    contract_type = (contract.contract_type or "").lower()

    combined = f"{name} {category} {provider} {contract_type}"

    if any(keyword in combined for keyword in ["netflix", "spotify", "streaming"]):
        return "streaming"

    if any(keyword in combined for keyword in ["dsl", "internet", "glasfaser", "fiber"]):
        return "internet"

    if any(keyword in combined for keyword in ["strom", "electricity", "energy", "energie"]):
        return "electricity"

    if any(keyword in combined for keyword in ["cloud", "storage", "icloud", "dropbox"]):
        return "cloud"

    if any(keyword in combined for keyword in ["mobile", "handy", "mobilfunk", "sim"]):
        return "mobile"

    return "other"
