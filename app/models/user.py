from datetime import datetime

from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    """Represents a registered user account."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
