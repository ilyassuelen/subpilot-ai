from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.user import UserRegisterRequest, UserResponse
from app.services.user_service import create_user


router = APIRouter(prefix="/auth", tags=["Auth"])


def get_db():
    """Provide a database session for each request and close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=UserResponse, status_code=201)
def register_user(user_data: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    try:
        user = create_user(db, user_data)
        return user
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception)) from exception
