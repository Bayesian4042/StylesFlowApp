"""
Google OAuth implementation
"""
from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests
from src.config import settings
from src.models.user import User
from .jwt import create_access_token
from datetime import timedelta
from .schemas import Token, UserResponse

class GoogleAuthService:
    """Service for handling Google OAuth authentication"""

    @staticmethod
    async def verify_google_token(token: str) -> Optional[dict]:
        """Verify Google ID token and return user info"""
        try:
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.GOOGLE_CLIENT_ID
            )
            return idinfo
        except ValueError:
            return None

    @staticmethod
    async def authenticate_google_user(google_token: str) -> Token:
        """Authenticate or create user with Google credentials"""
        # Verify the Google token
        google_user = await GoogleAuthService.verify_google_token(google_token)
        if not google_user:
            raise ValueError("Invalid Google token")

        # Check if user exists
        user = await User.get_or_none(google_id=google_user["sub"])
        
        if not user:
            # Create new user if doesn't exist
            user = await User.create(
                name=google_user.get("name", ""),
                email=google_user["email"],
                google_id=google_user["sub"],
                google_email=google_user["email"],
                google_picture=google_user.get("picture"),
                verified=True,  # Google accounts are pre-verified
                is_active=True
            )
        else:
            # Update existing user's Google info
            user.google_email = google_user["email"]
            user.google_picture = google_user.get("picture")
            await user.save()

        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return Token(access_token=access_token, user=UserResponse.model_validate(user))
