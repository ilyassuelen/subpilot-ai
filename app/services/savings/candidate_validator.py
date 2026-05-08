from app.services.savings.policy_engine import validate_candidate


def filter_valid_alternatives(
    contract_profile: dict,
    alternatives: list[dict],
) -> list[dict]:
    """Return only alternatives that pass data-driven savings policies."""
    valid_alternatives = []

    for alternative in alternatives:
        is_valid, rejection_reason = validate_candidate(
            contract_profile=contract_profile,
            alternative=alternative,
        )

        if is_valid:
            alternative["validation_status"] = "valid"
            valid_alternatives.append(alternative)
            continue

        alternative["validation_status"] = "rejected"
        alternative["rejection_reason"] = rejection_reason

    return valid_alternatives
