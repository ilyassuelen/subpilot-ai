def normalize_name(value: str) -> str:
    """Normalize a feature name for safer comparison."""
    return value.strip().lower().replace(" ", "_").replace("-", "_")


def parse_float(value) -> float | None:
    """Try to parse a numeric value."""
    try:
        return float(str(value).replace(",", "."))
    except (TypeError, ValueError):
        return None


def feature_matches(required_feature: dict, alternative_feature: dict) -> bool:
    """Check whether an alternative feature satisfies a required feature."""
    rule = required_feature.get("comparison_rule", "same_or_better")
    required_value = required_feature.get("value")
    alternative_value = alternative_feature.get("value")

    required_number = parse_float(required_value)
    alternative_number = parse_float(alternative_value)

    if required_number is not None and alternative_number is not None:
        if rule == "same_or_better":
            return alternative_number >= required_number

        if rule == "same":
            return alternative_number == required_number

        if rule in {"similar", "optional"}:
            return True

    required_text = str(required_value or "").lower().strip()
    alternative_text = str(alternative_value or "").lower().strip()

    if not required_text:
        return True

    if rule == "optional":
        return True

    if rule == "same":
        return required_text == alternative_text

    return required_text in alternative_text or alternative_text in required_text


def is_valid_equivalent_alternative(
    contract_profile: dict,
    alternative: dict,
) -> bool:
    """Validate a same-or-better alternative using important features."""
    required_features = contract_profile.get("features", [])
    alternative_features = alternative.get("features", [])

    if not isinstance(required_features, list):
        return False

    if not isinstance(alternative_features, list):
        return False

    alternative_feature_map = {
        normalize_name(str(feature.get("name", ""))): feature
        for feature in alternative_features
        if feature.get("name")
    }

    for required_feature in required_features:
        importance = required_feature.get("importance", "medium")

        if importance == "low":
            continue

        feature_name = normalize_name(str(required_feature.get("name", "")))

        if not feature_name:
            continue

        alternative_feature = alternative_feature_map.get(feature_name)

        if not alternative_feature:
            return False

        if not feature_matches(required_feature, alternative_feature):
            return False

    return True


def is_valid_downgrade_option(alternative: dict) -> bool:
    """Validate a downgrade option by requiring clear tradeoff and reason."""
    tradeoff = str(alternative.get("tradeoff") or "").strip()
    reason = str(alternative.get("reason") or "").strip()

    if len(tradeoff) < 8:
        return False

    if len(reason) < 8:
        return False

    return True


def is_valid_alternative(contract_profile: dict, alternative: dict) -> bool:
    """Validate an alternative based on its recommendation type."""
    confidence = parse_float(alternative.get("confidence"))

    if confidence is not None and confidence < 0.55:
        return False

    recommendation_type = alternative.get("recommendation_type")

    if recommendation_type == "downgrade_option":
        return is_valid_downgrade_option(alternative)

    return is_valid_equivalent_alternative(contract_profile, alternative)


def filter_valid_alternatives(
    contract_profile: dict,
    alternatives: list[dict],
) -> list[dict]:
    """Return only alternatives that pass validation."""
    return [
        alternative
        for alternative in alternatives
        if is_valid_alternative(contract_profile, alternative)
    ]
