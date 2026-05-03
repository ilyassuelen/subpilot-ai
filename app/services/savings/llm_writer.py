from openai import OpenAI

from app.models.contract import Contract

client = OpenAI()


def generate_text(
    contract: Contract,
    contract_profile: dict,
    best_option: dict,
    saving: float,
    current_monthly_cost: float,
) -> str:
    """Generate a user-friendly recommendation without changing validated numbers."""
    recommendation_type = best_option.get("recommendation_type", "equivalent_alternative")
    tradeoff = best_option.get("tradeoff") or "No major tradeoff identified"

    prompt = f"""
You are SubPilot's Smart Savings Agent.

Write a concise recommendation for the user.

Rules:
- Do not change any numbers.
- Do not invent additional alternatives.
- Explain whether this is an equivalent alternative or a downgrade option.
- If it is a downgrade option, clearly mention the tradeoff.
- Mention that the user should verify availability before switching.
- Keep it practical and trustworthy.

Contract:
- Title: {contract.title}
- Provider: {contract.provider_name}
- Current monthly cost: {current_monthly_cost:.2f} {contract.currency}

Contract profile:
{contract_profile}

Validated savings option:
- Provider: {best_option.get("provider")}
- Plan: {best_option.get("plan")}
- Price: {best_option.get("price")} {best_option.get("currency", contract.currency)}
- Saving: {saving:.2f} {contract.currency}
- Recommendation type: {recommendation_type}
- Tradeoff: {tradeoff}
- Source: {best_option.get("source_name")}
- Reason: {best_option.get("reason")}

Return only the recommendation text.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content or ""
