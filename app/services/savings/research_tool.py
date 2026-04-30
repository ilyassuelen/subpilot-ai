import json
import re

from openai import OpenAI

from app.models.contract import Contract

client = OpenAI()


def extract_json(text: str) -> dict:
    """Extract a JSON object from a model response."""
    cleaned = re.sub(r"```json|```", "", text).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start == -1 or end == -1:
        return {"alternatives": []}

    return json.loads(cleaned[start : end + 1])


def research_alternatives(contract: Contract, contract_type: str) -> list[dict]:
    """Research cheaper alternatives using OpenAI web search."""
    prompt = f"""
You are a price comparison agent.

Find REAL cheaper alternatives in Germany.

Contract:
{contract.title}
Provider: {contract.provider_name}
Category: {contract.category}
Contract type: {contract_type}
Price: {contract.monthly_cost} EUR

Rules:
- Only real providers
- Only cheaper options
- Return JSON ONLY
- If you cannot verify cheaper alternatives, return an empty alternatives list

Format:
{{
 "alternatives": [
   {{
     "provider": "...",
     "plan": "...",
     "price": 0.0
   }}
 ]
}}
"""

    response = client.responses.create(
        model="gpt-4o-mini",
        tools=[{"type": "web_search_preview"}],
        input=prompt,
    )

    try:
        data = extract_json(response.output_text)
        alternatives = data.get("alternatives", [])

        if not isinstance(alternatives, list):
            return []

        return alternatives

    except Exception:
        return []
