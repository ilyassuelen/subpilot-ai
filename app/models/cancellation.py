from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CancellationRequest(Base):
    """Represents a generated cancellation draft linked to a contract."""

    __tablename__ = "cancellation_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    contract_id: Mapped[int] = mapped_column(ForeignKey("contracts.id"), nullable=False)

    recipient_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="draft")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract")
