from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.savings_insight import SavingsInsightsSummaryResponse
from app.services.savings_insight_service import (
    generate_savings_insights_for_user,
    refresh_savings_insights_for_user,
)

router = APIRouter(prefix="/savings-insights", tags=["Savings Insights"])


def get_db():
    """Provide a database session for each request and close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=SavingsInsightsSummaryResponse)
def get_my_savings_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return persisted smart savings insights for the current user."""
    return generate_savings_insights_for_user(db, current_user.id)


@router.post("/refresh", response_model=SavingsInsightsSummaryResponse)
def refresh_my_savings_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Force a fresh Smart Savings Agent research run for the current user."""
    return refresh_savings_insights_for_user(db, current_user.id)
