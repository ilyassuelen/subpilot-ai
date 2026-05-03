import json
import re

from openai import OpenAI

from app.models.contract import Contract

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
    """Extract generic comparable contract features."""
    prompt = f"""
You are a universal contract understanding agent.

Analyze this contract and extract the relevant comparable features.
Do not assume a fixed contract type. This can be any kind of subscription,
contract, membership, utility tariff, software plan, insurance, service plan,
or recurring payment.

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
  "category": "short generic category",
  "comparison_goal": "what an equivalent alternative must preserve",
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
- Extract only features that can matter for comparing alternatives.
- High importance features must be preserved by alternatives.
- Use generic feature names.
- Do not invent details that are not present or reasonably inferable.
- If a feature is unknown, do not include it.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        messages=[{"role": "user", "content": prompt}],
    )

    data = extract_json(response.choices[0].message.content or "")

    if not isinstance(data.get("features"), list):
        data["features"] = []

    return data
