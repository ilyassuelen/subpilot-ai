import json
import re

from openai import OpenAI

from app.models.contract import Contract

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
    prompt = f"""
You are SubPilot's strict savings research agent.

Find realistic savings options for this contract.

Contract:
- Title: {contract.title}
- Provider: {contract.provider_name}
- Category: {contract.category}
- Current monthly cost: {monthly_cost:.2f} {contract.currency}

Contract profile:
{json.dumps(contract_profile, ensure_ascii=False)}

Your task:
Find savings options in Germany. There are two valid recommendation types:

1. equivalent_alternative
- Another plan/provider that preserves the important value of the current contract.
- Should match important features as closely as possible.

2. downgrade_option
- A cheaper plan that intentionally reduces some features.
- This is allowed only if the tradeoff is clear and reasonable.
- Example: cheaper plan, fewer included features, lower plan tier, fewer users, lower usage limit.

Strict rules:
- Do not suggest random substitutes that are not meaningfully related.
- Do not invent prices.
- Prefer options from the same provider if the contract appears to be plan-based.
- Different-provider alternatives are allowed only if they solve the same main user need.
- Every option must include a monthly price.
- If you cannot find reliable options, return an empty alternatives list.
- Return JSON only.

Schema:
{{
  "alternatives": [
    {{
      "provider": "provider name",
      "plan": "plan or tariff name",
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
            alternative["recommendation_type"] = "equivalent_alternative"

        cleaned_alternatives.append(alternative)

    return cleaned_alternatives
