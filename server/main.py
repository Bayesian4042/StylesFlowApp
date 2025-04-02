import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise

from src.config import settings, constants
import datetime
import os
from pathlib import Path
from dotenv import load_dotenv
from src.modules.image_generation.router import router as image_generation_router
from src.modules.routers.generated_images import generated_images_router
from src.modules.routers.admin import router as admin_router
from src.modules.auth.router import router as auth_router

load_dotenv('.env')
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Virtual Cloth Try-On",
    description="virtual try-on using both external services and local pipeline",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS middleware
origins = [
    "http://localhost:3000",    # Next.js dev server
    "https://production-domain.com",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]  # For file downloads if needed
)

# Add generated images router
app.include_router(image_generation_router, prefix=settings.API_V1_PREFIX)


app.include_router(
    generated_images_router,
    prefix="/api",
    tags=["Generated Images"]
)

# Add admin router
app.include_router(
    admin_router,
    prefix="/api",
    tags=["Admin"]
)

# Add auth router
app.include_router(
    auth_router,
    prefix="/api",
    tags=["Auth"]
)

# Register Tortoise ORM
register_tortoise(
    app,
    config=settings.TORTOISE_ORM,
    generate_schemas=True,
    add_exception_handlers=True,
)

# Ensure output directory exists at startup
os.makedirs(constants.OUTPUT_DIR, exist_ok=True)
print(f"Debug - Ensuring output directory exists: {constants.OUTPUT_DIR}")

# Health check endpoints
@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Virtual Try-On API Service"}

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "OK",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now(datetime.UTC).isoformat()
    }

if __name__ == "__main__":
    print(f"Starting server with output directory: {constants.OUTPUT_DIR}")
    
    # Run the server
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
