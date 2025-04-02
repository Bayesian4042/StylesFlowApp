"""
Dependencies for auth module
"""

from functools import wraps
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from src.models.user import User
from .service import UserService
from .exceptions import UserNotFoundException
from .jwt import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def require_auth(func):
    """Decorator to require authentication"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        if 'current_user' not in kwargs or not kwargs['current_user']:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        return await func(*args, **kwargs)
    return wrapper

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Get current authenticated user from JWT token"""
    payload = verify_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )
    
    return user

async def get_user_or_404(user_id: str) -> User:
    """Dependency to get user by ID or raise 404"""
    user = await UserService.get_user(user_id)
    if not user:
        raise UserNotFoundException(user_id=user_id)
    return user


async def get_user_by_email_or_404(email: str) -> User:
    """Dependency to get user by email or raise 404"""
    user = await UserService.get_user_by_email(email)
    if not user:
        raise UserNotFoundException(email=email)
    return user
