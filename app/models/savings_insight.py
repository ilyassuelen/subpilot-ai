from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SavingsInsight(Base):
    """Persisted savings recommendation created by the Smart Savings Agent."""

    __tablename__ = "savings_insights"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    contract_id: Mapped[int | None] = mapped_column(
        ForeignKey("contracts.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    type: Mapped[str] = mapped_column(String(100), nullable=False)
    priority: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    estimated_monthly_saving: Mapped[float] = mapped_column(Float, nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)

    current_monthly_cost: Mapped[float | None] = mapped_column(Float, nullable=True)

    option_provider: Mapped[str | None] = mapped_column(String(255), nullable=True)
    option_plan: Mapped[str | None] = mapped_column(String(255), nullable=True)
    option_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    option_currency: Mapped[str | None] = mapped_column(String(10), nullable=True)

    source_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    contract_profile: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    offer_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    refreshed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
