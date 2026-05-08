import json
import re

from openai import OpenAI

from app.models.contract import Contract
from app.services.savings.policy_engine import get_research_guidance

client = OpenAI()


def extract_json(text: str) -> dict:
    """Extract a JSON object from a web-search response."""
    cleaned = re.sub(r"```json|```", "", text or "").strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start == -1 or end == -1:
        return {"alternatives": []}

    try:
        return json.loads(cleaned[start : end + 1])
    except json.JSONDecodeError:
        return {"alternatives": []}


def research_alternatives(
    contract: Contract,
    contract_profile: dict,
    monthly_cost: float,
) -> list[dict]:
    """Research comparable alternatives and downgrade options using web search."""
    policy_guidance = get_research_guidance(contract_profile)

    prompt = f"""
You are SubPilot's strict savings research agent.

Find realistic savings options for this contract in Germany.

Contract:
- Title: {contract.title}
- Provider: {contract.provider_name}
- Category: {contract.category}
- Current monthly cost: {monthly_cost:.2f} {contract.currency}

Contract profile:
{json.dumps(contract_profile, ensure_ascii=False)}

Data-driven category policy:
{json.dumps(policy_guidance, ensure_ascii=False)}

Valid recommendation types:

1. equivalent_alternative
- A cheaper plan/provider that preserves the important value of the current contract.
- Must belong to the same policy category.
- Must follow the category policy above.

2. downgrade_option
- A cheaper plan that intentionally reduces some features.
- Must follow the category policy above.
- If same_provider_required is true, it must stay with the same provider.
- The tradeoff must clearly explain what the user gives up.

Strict rules:
- Do not invent prices.
- Do not invent plan names.
- Do not mix categories.
- Do not compare fixed internet with mobile contracts.
- Do not compare streaming providers as equivalent unless the policy allows it.
- Do not suggest energy offers unless the offer evidence includes consumption/price logic such as kWh, usage, base price or working price.
- Every option must include a real source_name and source_url.
- Every option must include category_id from the policy.
- If you cannot find reliable options, return an empty alternatives list.
- Return JSON only.

Schema:
{{
  "alternatives": [
    {{
      "provider": "provider name",
      "plan": "plan or tariff name",
      "category_id": "policy category id",
      "price": 0.0,
      "currency": "EUR",
      "recommendation_type": "equivalent_alternative",
      "tradeoff": "No major tradeoff, comparable offer",
      "features": [
        {{
          "name": "feature name",
          "value": "feature value",
          "unit": "unit or null"
        }}
      ],
      "source_name": "source website name",
      "source_url": "source url",
      "confidence": 0.0,
      "reason": "why this option is relevant and comparable"
    }}
  ]
}}

Important:
- recommendation_type must be either "equivalent_alternative" or "downgrade_option".
- category_id must match the category policy id.
- For downgrade_option, tradeoff must clearly explain what the user gives up.
- For equivalent_alternative, tradeoff can be "No major tradeoff identified".
"""

    response = client.responses.create(
        model="gpt-4o-mini",
        tools=[{"type": "web_search_preview"}],
        input=prompt,
    )

    data = extract_json(response.output_text)
    alternatives = data.get("alternatives", [])

    if not isinstance(alternatives, list):
        return []

    cleaned_alternatives = []

    for alternative in alternatives:
        if not isinstance(alternative, dict):
            continue

        recommendation_type = alternative.get("recommendation_type")

        if recommendation_type not in {
            "equivalent_alternative",
            "downgrade_option",
        }:
            continue

        cleaned_alternatives.append(alternative)

    return cleaned_alternatives
