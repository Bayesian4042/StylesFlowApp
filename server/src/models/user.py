"""
User model for the application
"""
from datetime import datetime
from tortoise import fields, models
import bcrypt
from uuid import uuid4

class User(models.Model):
    """User model"""
    id = fields.UUIDField(pk=True, default=uuid4)
    name = fields.CharField(max_length=255)
    email = fields.CharField(max_length=255, unique=True)
    password_hash = fields.CharField(max_length=255, null=True)  # Optional for Google auth users
    avatar = fields.CharField(max_length=255, null=True)
    is_active = fields.BooleanField(default=True)
    verified = fields.BooleanField(default=False)
    verification_code = fields.CharField(max_length=6, null=True)
    verification_code_expires_at = fields.DatetimeField(null=True)
    
    # Google OAuth fields
    google_id = fields.CharField(max_length=255, unique=True, null=True)
    google_email = fields.CharField(max_length=255, null=True)
    google_picture = fields.CharField(max_length=255, null=True)
    
    # Admin flag
    is_admin = fields.BooleanField(default=False)
    
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def verify_password(self, password: str) -> bool:
        """Verify password"""
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode(), self.password_hash.encode())

    class Meta:
        table = "users"
