from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jwt import ExpiredSignatureError, InvalidTokenError

from app.core.database import SessionLocal
from app.core.security import create_access_token, decode_access_token
from app.schemas.user import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
    UserUpdateRequest,
)
from app.services.user_service import (
    authenticate_user,
    create_user,
    get_user_by_id,
    update_user_profile,
)

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()


def get_db():
    """Provide a database session for each request and close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Return the currently authenticated user from the bearer token."""
    token = credentials.credentials

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")

    except ExpiredSignatureError as exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        ) from exception

    except InvalidTokenError as exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exception

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    user = get_user_by_id(db, int(user_id))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


@router.post("/register", response_model=UserResponse, status_code=201)
def register_user(user_data: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    try:
        user = create_user(db, user_data)
        return user
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception)) from exception


@router.post("/login", response_model=TokenResponse)
def login_user(user_data: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT access token."""
    user = authenticate_user(db, user_data.email, user_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token({"sub": str(user.id)})

    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    user_data: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Update the currently authenticated user's profile."""
    try:
        user = update_user_profile(db, current_user, user_data)
        return user
    except ValueError as exception:
        raise HTTPException(status_code=400, detail=str(exception)) from exception
