from openai import OpenAI

from app.models.contract import Contract

client = OpenAI()


def generate_text(contract: Contract, best_option: dict, saving: float) -> str:
    """Generate a user-friendly recommendation without changing validated numbers."""
    prompt = f"""
You are a financial assistant.

Contract: {contract.title}
Current price: {contract.monthly_cost} EUR
Better option: {best_option["provider"]} ({best_option["price"]} EUR)
Saving: {saving} EUR

Write a short recommendation.
Do NOT change numbers.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.2,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content or ""
