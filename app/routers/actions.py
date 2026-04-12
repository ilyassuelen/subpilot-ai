from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.action_log import ActionLogResponse
from app.services.action_log_service import (
    get_all_action_logs,
    get_action_logs_by_entity,
)

router = APIRouter(prefix="/actions", tags=["Actions"])


def get_db():
    """Provide a database session for each request and close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[ActionLogResponse])
def get_actions(db: Session = Depends(get_db)):
    """Return all action log entries."""
    return get_all_action_logs(db)


@router.get("/entity/{entity_type}/{entity_id}", response_model=list[ActionLogResponse])
def get_actions_for_entity(
    entity_type: str,
    entity_id: int,
    db: Session = Depends(get_db),
):
    """Return all action log entries for a specific entity."""
    return get_action_logs_by_entity(db, entity_type, entity_id)
