from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Reminder(Base):
    """Represents a scheduled reminder for a contract-related action."""
    __tablename__ = "reminders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    contract_id: Mapped[int] = mapped_column(ForeignKey("contracts.id"), nullable=False)

    reminder_type: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(String(255), nullable=False)

    scheduled_for: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    status: Mapped[str] = mapped_column(String(50), default="pending")
    channel: Mapped[str] = mapped_column(String(50), default="app")

    sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract")
