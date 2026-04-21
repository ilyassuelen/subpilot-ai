from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    """Schema for registering a new user account."""

    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=255)
    address: str = Field(min_length=1, max_length=500)


class UserLoginRequest(BaseModel):
    """Schema for logging in with email and password."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=255)


class TokenResponse(BaseModel):
    """Schema returned after successful login."""

    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Schema returned by the API for user data."""

    id: int
    full_name: str
    email: EmailStr
    address: str
    created_at: datetime

    class Config:
        from_attributes = True
