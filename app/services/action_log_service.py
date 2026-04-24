from sqlalchemy.orm import Session

from app.models.action_log import ActionLog


def create_action_log(
    db: Session,
    user_id: int,
    entity_type: str,
    entity_id: int,
    action_type: str,
    message: str,
) -> ActionLog:
    """Create a new action log entry and attach it to the current database session."""
    action_log = ActionLog(
        user_id=user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        action_type=action_type,
        message=message,
    )

    db.add(action_log)
    db.flush()

    return action_log


def get_all_action_logs(db: Session, user_id: int) -> list[ActionLog]:
    """Return all action log entries for a specific user."""
    return (
        db.query(ActionLog)
        .filter(ActionLog.user_id == user_id)
        .order_by(ActionLog.created_at.desc())
        .all()
    )


def get_action_logs_by_entity(
    db: Session,
    user_id: int,
    entity_type: str,
    entity_id: int,
) -> list[ActionLog]:
    """Return action log entries for a specific entity and user."""
    return (
        db.query(ActionLog)
        .filter(
            ActionLog.user_id == user_id,
            ActionLog.entity_type == entity_type,
            ActionLog.entity_id == entity_id,
        )
        .order_by(ActionLog.created_at.desc())
        .all()
    )
