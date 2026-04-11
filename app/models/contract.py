from datetime import datetime, date

from sqlalchemy import String, Float, Integer, Date, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Contract(Base):
    """Represents a contract or subscription with billing and cancellation details."""
    __tablename__ = "contracts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    provider_name: Mapped[str] = mapped_column(String(255), nullable=False)
    provider_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    contract_type: Mapped[str] = mapped_column(String(100), nullable=False, default="subscription")
    monthly_cost: Mapped[float] = mapped_column(Float, nullable=False)
    billing_cycle: Mapped[str] = mapped_column(String(50), nullable=False, default="monthly")
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="EUR")
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    auto_renewal: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    cancellation_notice_days: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
