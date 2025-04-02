"""
Migration script to set admin flag for existing users
Run this script to set the admin flag for a specific user by email
"""
import asyncio
import sys
from tortoise import Tortoise
from src.config.settings import TORTOISE_ORM
from src.models.user import User

async def set_admin_by_email(email: str):
    # Connect to the database
    await Tortoise.init(config=TORTOISE_ORM)
    
    # Find user by email
    user = await User.filter(email=email).first()
    if user:
        user.is_admin = True
        await user.save()
        print(f"Successfully set user {user.email} as admin")
    else:
        print(f"No user found with email {email}")
    
    # Close database connections
    await Tortoise.close_connections()

def print_usage():
    print("Usage: python set_admin.py <email>")
    print("Example: python set_admin.py admin@example.com")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print_usage()
        sys.exit(1)
    
    email = sys.argv[1]
    asyncio.run(set_admin_by_email(email))
