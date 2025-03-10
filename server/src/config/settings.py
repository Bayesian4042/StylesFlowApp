"""
Application settings and configuration.
Load environment variables and define app-wide settings.
"""

from typing import List, Optional
from dotenv import load_dotenv,dotenv_values
load_dotenv('.env')
config = dotenv_values('.env')

# Application Constants
APP_NAME = "FastAPI Template"
VERSION = "1.0.0"
API_V1_PREFIX: str = "/api"
ALLOWED_HOSTS: List[str] = ["*"]

ENV: str = config.get("ENV", "development")
KLING_API_KEY: str = config.get("KLING_API_KEY", "")
REPLICATE_API_TOKEN: str = config.get("REPLICATE_API_TOKEN", "")
FAL_API_KEY: str = config.get("FAL_API_KEY", "")
DATABASE_URL: str = config.get("DATABASE_URL", "sqlite://db.sqlite3")

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
