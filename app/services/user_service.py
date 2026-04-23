from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserRegisterRequest, UserUpdateRequest


def normalize_email(email: str) -> str:
    """Normalize an email address for consistent storage."""
    return email.strip().lower()


def get_user_by_email(db: Session, email: str) -> User | None:
    """Return a user by email or None if not found."""
    normalized_email = normalize_email(email)

    return db.query(User).filter(User.email == normalized_email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """Return a user by ID or None if not found."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserRegisterRequest) -> User:
    """Create and persist a new user account."""
    normalized_email = normalize_email(user_data.email)

    existing_user = get_user_by_email(db, normalized_email)
    if existing_user:
        raise ValueError("A user with this email already exists.")

    new_user = User(
        full_name=user_data.full_name.strip(),
        email=normalized_email,
        password_hash=hash_password(user_data.password),
        address=user_data.address.strip(),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """Authenticate a user by email and password."""
    user = get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


def update_user_profile(
    db: Session,
    user: User,
    user_data: UserUpdateRequest,
) -> User:
    """Update the current user's profile data."""
    normalized_email = normalize_email(user_data.email)

    existing_user = get_user_by_email(db, normalized_email)
    if existing_user and existing_user.id != user.id:
        raise ValueError("A user with this email already exists.")

    user.full_name = user_data.full_name.strip()
    user.email = normalized_email
    user.address = user_data.address.strip()

    db.commit()
    db.refresh(user)

    return user
