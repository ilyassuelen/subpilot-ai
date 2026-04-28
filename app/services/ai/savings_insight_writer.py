import json
import os
import re

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


class SavingsInsightAIError(Exception):
    """Raised when AI savings insight generation fails."""


def extract_json_array(text: str) -> list[dict]:
    """Extract a JSON array from a model response."""
    cleaned = text.strip()

    cleaned = re.sub(r"^```json\s*", "", cleaned)
    cleaned = re.sub(r"^```\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    start = cleaned.find("[")
    end = cleaned.rfind("]")

    if start == -1 or end == -1:
        raise SavingsInsightAIError("AI response did not contain a JSON array.")

    return json.loads(cleaned[start : end + 1])


def generate_ai_savings_insights(
    contracts_payload: list[dict],
    total_monthly_cost: float,
) -> list[dict]:
    """Generate personalized savings insights using an LLM."""
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise SavingsInsightAIError("OPENAI_API_KEY is not configured.")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    client = OpenAI(api_key=api_key)

    system_prompt = """
You are SubPilot's Smart Savings Agent.

Your task:
Analyze a user's active subscriptions/contracts and generate useful, personalized savings recommendations.

Important rules:
- Do not invent exact competitor prices.
- Do not claim that a cheaper plan exists unless it is clearly implied by the contract name or notes.
- You may suggest checking lower tiers, annual billing, cancellation, renegotiation, or comparison before renewal.
- Be specific and practical.
- Avoid generic advice.
- Return ONLY valid JSON.
- Output must be a JSON array.
- Maximum 5 insights.

Each insight must have:
{
  "type": "cost_optimization" | "upcoming_cancellation_window" | "subscription_review" | "contract_renegotiation",
  "priority": "high" | "medium" | "low",
  "title": string,
  "message": string,
  "estimated_monthly_saving": number,
  "contract_id": number,
  "action": "review_contract" | "generate_cancellation_draft" | "compare_alternatives" | "renegotiate_contract"
}
"""

    user_prompt = {
        "total_monthly_cost": total_monthly_cost,
        "contracts": contracts_payload,
    }

    response = client.chat.completions.create(
        model=model,
        temperature=0.3,
        messages=[
            {"role": "system", "content": system_prompt.strip()},
            {
                "role": "user",
                "content": json.dumps(user_prompt, ensure_ascii=False),
            },
        ],
    )

    content = response.choices[0].message.content

    if not content:
        raise SavingsInsightAIError("AI returned an empty response.")

    return extract_json_array(content)
