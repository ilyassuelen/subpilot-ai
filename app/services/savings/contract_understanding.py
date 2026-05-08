import json
import re

from openai import OpenAI

from app.models.contract import Contract
from app.services.savings.policy_engine import classify_contract

client = OpenAI()


def extract_json(text: str) -> dict:
    """Extract a JSON object from an LLM response."""
    cleaned = re.sub(r"```json|```", "", text or "").strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start == -1 or end == -1:
        return {"category": "unknown", "features": []}

    try:
        return json.loads(cleaned[start : end + 1])
    except json.JSONDecodeError:
        return {"category": "unknown", "features": []}


def understand_contract(contract: Contract, monthly_cost: float) -> dict:
    """Extract comparable contract features and classify them via policy data."""
    raw_text = " ".join(
        [
            contract.title or "",
            contract.provider_name or "",
            contract.category or "",
            contract.contract_type or "",
            contract.notes or "",
        ]
    )

    prompt = f"""
You are SubPilot's strict contract understanding agent.

Analyze this contract and extract only comparable features that are actually
known from the provided data. Do not invent missing details.

Contract data:
- Title: {contract.title}
- Provider: {contract.provider_name}
- Category: {contract.category}
- Contract type: {contract.contract_type}
- Monthly cost: {monthly_cost:.2f} {contract.currency}
- Billing cycle: {contract.billing_cycle}
- Notes: {contract.notes or "No notes"}

Return JSON only.

Schema:
{{
  "provider": "{contract.provider_name}",
  "category": "short generic category",
  "comparison_goal": "what a comparable option must preserve",
  "features": [
    {{
      "name": "feature name",
      "value": "feature value",
      "unit": "unit or null",
      "importance": "high|medium|low",
      "comparison_rule": "same_or_better|same|similar|optional"
    }}
  ]
}}

Rules:
- Always include the provider field exactly.
- Extract only features that matter for comparing alternatives.
- Do not invent unknown features.
- High importance features must be preserved by equivalent alternatives.
- For streaming, provider/catalog is usually not interchangeable.
- For fixed internet, speed/download/upload/router/contract duration can matter.
- For mobile contracts, data volume, network, 5G/LTE and contract duration can matter.
- For energy contracts, postal code, yearly kWh usage, base price and working price matter.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        messages=[{"role": "user", "content": prompt}],
    )

    data = extract_json(response.choices[0].message.content or "")

    if not isinstance(data.get("features"), list):
        data["features"] = []

    data["provider"] = contract.provider_name
    data["raw_text"] = raw_text
    data["current_monthly_cost"] = round(monthly_cost, 2)
    data["currency"] = contract.currency
    data["canonical_category"] = classify_contract(data)

    return data
