"""
Service layer for auth module
"""

from typing import Optional, Tuple
from datetime import timedelta, datetime, UTC
import secrets
from jose import jwt
import requests
from fastapi import HTTPException, status
from src.models.user import User
from .schemas import UserCreate, UserUpdate, Token, UserResponse
from src.config.settings import GOOGLE_CLIENT_ID, ADMIN_EMAILS
from .jwt import create_access_token
from .constants import (
    ACCESS_TOKEN_EXPIRE_DAYS,
    INVALID_CREDENTIALS_ERROR,
    INACTIVE_USER_ERROR,
    UNVERIFIED_USER_ERROR,
)


class UserService:
    """Service class for user operations"""

    @staticmethod
    async def authenticate_user(email: str, password: str) -> Token:
        """
        Authenticate user and return JWT token

        Args:
            email: User's email
            password: User's password

        Returns:
            Token: JWT access token

        Raises:
            HTTPException: If authentication fails
        """
        user = await UserService.get_user_by_email(email)
        if not user or not user.verify_password(password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=INVALID_CREDENTIALS_ERROR,
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=INACTIVE_USER_ERROR,
            )
        if not user.verified:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=UNVERIFIED_USER_ERROR,
            )

        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS),
        )

        return Token(access_token=access_token, user=UserResponse.model_validate(user))

    @staticmethod
    def generate_verification_code() -> Tuple[str, datetime]:
        """Generate a verification code and its expiration time"""
        code = "".join(secrets.choice("0123456789") for _ in range(6))
        expires_at = datetime.now(UTC) + timedelta(minutes=30)
        return code, expires_at

    @staticmethod
    async def create_user(user_data: UserCreate) -> User:
        """Create a new user"""
        # Check if user already exists
        existing_user = await User.get_or_none(email=user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Generate verification code
        code, expires_at = UserService.generate_verification_code()

        # Create user
        user = await User.create(
            name=user_data.name,
            email=user_data.email,
            password_hash=User.hash_password(user_data.password),
            avatar=user_data.avatar,
            is_active=True,
            verified=False,
            verification_code=code,
            verification_code_expires_at=expires_at,
            is_admin=user_data.email in ADMIN_EMAILS,
        )

        # For now, auto-verify the user since email service is not set up
        user.verified = True
        await user.save()

        return user
    #
    @staticmethod
    async def verify_email(email: str, code: str) -> bool:
        """Verify user's email with verification code"""
        user = await User.get_or_none(email=email, verification_code=code)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code",
            )

        if user.verification_code_expires_at < datetime.now(UTC):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired",
            )

        # Update user verification status
        user.verified = True
        user.verification_code = None
        user.verification_code_expires_at = None
        await user.save()

        return True

    @staticmethod
    async def get_user(user_id: str) -> Optional[User]:
        """Get user by ID"""
        return await User.get_or_none(id=user_id)

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email"""
        return await User.get_or_none(email=email)

    @staticmethod
    async def update_user(user_id: str, user_data: UserUpdate) -> Optional[User]:
        """Update user"""
        user = await User.get_or_none(id=user_id)
        if not user:
            return None

        update_data = user_data.model_dump(exclude_unset=True)

        await user.update_from_dict(update_data)
        await user.save()
        return user

    @staticmethod
    async def delete_user(user_id: str) -> bool:
        """Delete user"""
        user = await User.get_or_none(id=user_id)
        if not user:
            return False
        await user.delete()
        return True

    @staticmethod
    async def google_auth(token: str) -> Token:
        """Authenticate with Google and return JWT token"""
        try:
            # Get user info using the access token
            response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {token}'}
            )
            response.raise_for_status()
            google_user = response.json()
            
            if not google_user.get("email"):
                raise ValueError("Email not found in Google user info")

            # Check if user exists
            user = await User.get_or_none(email=google_user["email"])
            
            if not user:
                # Create new user
                user = await User.create(
                    name=google_user.get("name", ""),
                    email=google_user["email"],
                    google_id=google_user.get("sub"),
                    google_email=google_user["email"],
                    google_picture=google_user.get("picture"),
                    is_active=True,
                    verified=True,  # Google accounts are pre-verified
                    is_admin=google_user["email"] in ADMIN_EMAILS,
                )
            else:
                # Update existing user's Google info
                user.google_id = google_user.get("sub")
                user.google_email = google_user["email"]
                user.google_picture = google_user.get("picture")
                user.is_admin = google_user["email"] in ADMIN_EMAILS
                await user.save()

            # Create access token
            access_token = create_access_token(
                data={"sub": str(user.id)},
                expires_delta=timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS),
            )

            return Token(access_token=access_token, user=UserResponse.model_validate(user))

        except (requests.RequestException, ValueError) as e:
            print("Google auth error:", str(e))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )
