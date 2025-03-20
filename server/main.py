"""
FastAPI Template Application
This is a template for FastAPI applications following best practices.
"""
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from starlette.responses import RedirectResponse
from tortoise.exceptions import BaseORMException
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv('.env')

from src.config import  settings
from src.database import init_db, close_db
from src.modules.auth.router import router as user_router
from src.modules.image_generation.router import router as image_generation_router
from src.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
    database_exception_handler,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events."""
    await init_db()
    yield
    await close_db()

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="A template FastAPI application with best practices",
    lifespan=lifespan
)

# Register exception handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(BaseORMException, database_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers with API versioning
app.include_router(user_router, prefix=settings.API_V1_PREFIX)
app.include_router(image_generation_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    """
    Root endpoint that redirects to the API documentation.
    Returns:
        RedirectResponse: Redirects to the /docs endpoint
    """
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify the API is running.
    Returns:
        dict: A simple message indicating the API is healthy
    """
    return {"version": settings.VERSION, "status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.modules.routers import external_tryon, local_tryon
import datetime
from dotenv import load_dotenv

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

# Include routers with API prefix
app.include_router(
    local_tryon.router,
    prefix="/api/local",
    tags=["Local TryOn"]
)

app.include_router(
    external_tryon.router,
    prefix="/api/external",
    tags=["External TryOn"]
)

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




"""