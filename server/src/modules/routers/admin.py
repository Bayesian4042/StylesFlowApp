from fastapi import APIRouter, Depends, HTTPException
from src.models.user import User
from src.modules.auth.dependencies import get_current_user
from typing import List
from tortoise.contrib.pydantic import pydantic_model_creator

router = APIRouter(prefix="/admin", tags=["admin"])

# Create Pydantic model for User
UserPydantic = pydantic_model_creator(
    User,
    name="User",
    exclude=("password_hash", "verification_code", "verification_code_expires_at")
)

async def check_admin_access(current_user: User = Depends(get_current_user)):
    """Check if the current user has admin access"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to access this resource. Only administrators can access this page."
        )
    return current_user

@router.get("/users", response_model=List[UserPydantic])
async def get_users(current_user: User = Depends(check_admin_access)):
    """Get all users in the system"""
    return await UserPydantic.from_queryset(User.all())
