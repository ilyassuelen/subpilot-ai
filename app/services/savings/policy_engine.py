import json
from functools import lru_cache
from pathlib import Path
from urllib.parse import urlparse


POLICY_FILE = Path(__file__).resolve().parents[2] / "data" / "savings_category_policies.json"


@lru_cache
def load_policy_config() -> dict:
    """Load savings category policies from JSON configuration."""
    with POLICY_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def normalize(value: str | None) -> str:
    """Normalize strings for comparisons."""
    return (value or "").strip().lower()


def parse_float(value) -> float | None:
    """Parse a value into float when possible."""
    try:
        return float(str(value).replace(",", "."))
    except (TypeError, ValueError):
        return None


def join_feature_text(features: list[dict] | None) -> str:
    """Convert feature dictionaries into searchable text."""
    if not isinstance(features, list):
        return ""

    parts = []

    for feature in features:
        if not isinstance(feature, dict):
            continue

        parts.append(str(feature.get("name") or ""))
        parts.append(str(feature.get("value") or ""))
        parts.append(str(feature.get("unit") or ""))

    return " ".join(parts)


def build_contract_text(contract_profile: dict) -> str:
    """Build searchable text for contract classification."""
    return normalize(
        " ".join(
            [
                str(contract_profile.get("provider") or ""),
                str(contract_profile.get("category") or ""),
                str(contract_profile.get("comparison_goal") or ""),
                str(contract_profile.get("raw_text") or ""),
                join_feature_text(contract_profile.get("features")),
            ]
        )
    )


def build_alternative_text(alternative: dict) -> str:
    """Build searchable text for offer classification."""
    return normalize(
        " ".join(
            [
                str(alternative.get("provider") or ""),
                str(alternative.get("plan") or ""),
                str(alternative.get("recommendation_type") or ""),
                str(alternative.get("tradeoff") or ""),
                str(alternative.get("reason") or ""),
                join_feature_text(alternative.get("features")),
            ]
        )
    )


def score_policy_match(text: str, policy: dict) -> int:
    """Score how well a text matches a category policy."""
    score = 0

    for alias in policy.get("aliases", []):
        if normalize(alias) in text:
            score += 4

    for provider_alias in policy.get("provider_aliases", []):
        if normalize(provider_alias) in text:
            score += 3

    for marker in policy.get("text_markers", []):
        if normalize(marker) in text:
            score += 2

    return score


def classify_text(text: str) -> str | None:
    """Classify text into a configured category id."""
    config = load_policy_config()
    policies = config.get("categories", [])

    scored = [
        (score_policy_match(text, policy), policy.get("id"))
        for policy in policies
    ]

    scored = [item for item in scored if item[0] > 0 and item[1]]

    if not scored:
        return None

    scored.sort(reverse=True)
    return scored[0][1]


def classify_contract(contract_profile: dict) -> str | None:
    """Classify a contract profile into a configured category id."""
    explicit_category = normalize(contract_profile.get("canonical_category"))

    if explicit_category:
        return explicit_category

    return classify_text(build_contract_text(contract_profile))


def classify_alternative(alternative: dict) -> str | None:
    """Classify a researched offer into a configured category id."""
    explicit_category = normalize(alternative.get("category_id"))

    if explicit_category:
        return explicit_category

    return classify_text(build_alternative_text(alternative))


def get_policy(category_id: str | None) -> dict | None:
    """Return category policy by id."""
    if not category_id:
        return None

    config = load_policy_config()

    for policy in config.get("categories", []):
        if policy.get("id") == category_id:
            return policy

    return None


def same_provider(contract_profile: dict, alternative: dict) -> bool:
    """Check whether contract and alternative use the same provider."""
    current_provider = normalize(contract_profile.get("provider"))
    option_provider = normalize(alternative.get("provider"))

    if not current_provider or not option_provider:
        return False

    return current_provider in option_provider or option_provider in current_provider


def has_valid_source(alternative: dict) -> bool:
    """Validate source information according to global policy settings."""
    config = load_policy_config()
    settings = config.get("settings", {})

    source_name = str(alternative.get("source_name") or "").strip()
    source_url = str(alternative.get("source_url") or "").strip()

    if settings.get("require_source_name", True) and len(source_name) < 2:
        return False

    if settings.get("require_source_url", True):
        if not source_url.startswith(("http://", "https://")):
            return False

        parsed = urlparse(source_url)

        if not parsed.netloc:
            return False

    return True


def has_required_evidence(policy: dict, alternative: dict) -> bool:
    """Check whether an alternative contains enough category-specific evidence."""
    required_terms = policy.get("required_evidence_terms", [])

    if not required_terms:
        return True

    text = build_alternative_text(alternative)

    return any(normalize(term) in text for term in required_terms)


def recommendation_type_allowed(policy: dict, recommendation_type: str) -> bool:
    """Check whether a recommendation type is allowed for a category."""
    type_policy = policy.get(recommendation_type)

    if not isinstance(type_policy, dict):
        return False

    return bool(type_policy.get("allowed", False))


def provider_rule_passes(
    policy: dict,
    recommendation_type: str,
    contract_profile: dict,
    alternative: dict,
) -> bool:
    """Validate same-provider requirements from policy data."""
    type_policy = policy.get(recommendation_type, {})

    if type_policy.get("same_provider_required", False):
        return same_provider(contract_profile, alternative)

    return True


def category_rule_passes(
    policy: dict,
    recommendation_type: str,
    contract_category: str,
    alternative_category: str,
) -> bool:
    """Validate category compatibility using policy data."""
    if contract_category != alternative_category:
        return False

    type_policy = policy.get(recommendation_type, {})
    blocked_categories = set(type_policy.get("disallowed_target_categories", []))

    return alternative_category not in blocked_categories


def validate_candidate(contract_profile: dict, alternative: dict) -> tuple[bool, str]:
    """Validate one researched candidate using JSON-based policy rules."""
    if not isinstance(alternative, dict):
        return False, "alternative_is_not_object"

    if not has_valid_source(alternative):
        return False, "missing_or_invalid_source"

    config = load_policy_config()
    settings = config.get("settings", {})

    confidence = parse_float(alternative.get("confidence"))
    minimum_confidence = float(settings.get("minimum_confidence", 0.78))

    if confidence is None or confidence < minimum_confidence:
        return False, "confidence_too_low"

    price = parse_float(alternative.get("price"))

    if price is None or price <= 0:
        return False, "invalid_price"

    recommendation_type = alternative.get("recommendation_type")

    if recommendation_type not in {"equivalent_alternative", "downgrade_option"}:
        return False, "invalid_recommendation_type"

    contract_category = classify_contract(contract_profile)
    alternative_category = classify_alternative(alternative)

    if not contract_category or not alternative_category:
        if settings.get("allow_unknown_category", False):
            return True, "accepted_unknown_category"

        return False, "unknown_category"

    policy = get_policy(contract_category)

    if not policy:
        return False, "missing_policy"

    if not recommendation_type_allowed(policy, recommendation_type):
        return False, "recommendation_type_not_allowed"

    if not category_rule_passes(
        policy=policy,
        recommendation_type=recommendation_type,
        contract_category=contract_category,
        alternative_category=alternative_category,
    ):
        return False, "category_mismatch"

    if not provider_rule_passes(
        policy=policy,
        recommendation_type=recommendation_type,
        contract_profile=contract_profile,
        alternative=alternative,
    ):
        return False, "provider_rule_failed"

    if not has_required_evidence(policy, alternative):
        return False, "missing_category_evidence"

    alternative["category_id"] = alternative_category
    alternative["price"] = round(price, 2)

    return True, "valid"


def get_research_guidance(contract_profile: dict) -> dict:
    """Return policy guidance for the research agent prompt."""
    category_id = classify_contract(contract_profile)
    policy = get_policy(category_id)

    if not policy:
        return {
            "category_id": category_id,
            "policy": None,
        }

    return {
        "category_id": category_id,
        "label": policy.get("label"),
        "downgrade": policy.get("downgrade"),
        "equivalent_alternative": policy.get("equivalent_alternative"),
        "required_evidence_terms": policy.get("required_evidence_terms", []),
    }
