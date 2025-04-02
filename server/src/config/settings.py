"""
Application settings and configuration.
Load environment variables and define app-wide settings.
"""

from typing import List
from dotenv import load_dotenv, dotenv_values

load_dotenv('.env')
config = dotenv_values('.env')

# Application Constants
APP_NAME = "FastAPI Template"
VERSION = "1.0.0"
API_V1_PREFIX: str = "/api"
ALLOWED_HOSTS: List[str] = ["*"]

# Environment
ENV: str = config.get("ENV", "development")

# API Keys
KLING_API_KEY: str = config.get("KLING_API_KEY", "")
OPENAI_API_KEY: str = config.get("OPENAI_API_KEY", "")
REPLICATE_API_TOKEN: str = config.get("REPLICATE_API_TOKEN", "")
FAL_API_KEY: str = config.get("FAL_API_KEY", "")

# Database Settings
DATABASE_URL: str = config.get("DATABASE_URL", "")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Admin Configuration
ADMIN_EMAILS: list[str] = config.get("ADMIN_EMAILS", "").split(",")

# Convert postgresql:// to postgres:// for Tortoise ORM compatibility
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgres://" + DATABASE_URL[len("postgresql://"):]

# Google OAuth Settings
GOOGLE_CLIENT_ID: str = config.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET: str = config.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI: str = config.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

# JWT Settings
JWT_SECRET_KEY: str = config.get("JWT_SECRET_KEY", "your-secret-key")
JWT_ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

# Tortoise ORM Config
TORTOISE_ORM = {
    "connections": {"default": DATABASE_URL},
    "apps": {
        "models": {
            "models": ["src.models.user", "aerich.models"],
            "default_connection": "default",
        },
    },
}
