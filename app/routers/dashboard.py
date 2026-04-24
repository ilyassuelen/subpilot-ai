from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.routers.auth import get_current_user
from app.schemas.dashboard import DashboardStatsResponse
from app.services.contract_service import get_dashboard_stats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def get_db():
    """Provide a database session for each request and close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/stats", response_model=DashboardStatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Return aggregated dashboard statistics for the current user."""
    return get_dashboard_stats(db, current_user.id)
