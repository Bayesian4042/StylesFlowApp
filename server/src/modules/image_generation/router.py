from fastapi import APIRouter, HTTPException, Response
from typing import List, Optional
from pydantic import BaseModel, Field
import time
import aiohttp

from .service import generate_image, ImageGenerationResult, virtual_try_on_with_fal
from ...config import settings


import base64

async def fetch_image(url: str) -> tuple[str, str]:
    """Fetch image from URL and return as base64 data URL"""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            content_type = response.headers.get('Content-Type', 'image/png')
            image_data = await response.read()
            base64_data = base64.b64encode(image_data).decode('utf-8')
            return f"data:{content_type};base64,{base64_data}", content_type


router = APIRouter(prefix="/image-generation", tags=["image-generation"])


@router.get("/view-image")
async def view_image(url: str):
    """
    Convert an image URL to base64 data URL
    """
    try:
        data_url, _ = await fetch_image(url)
        return {"data_url": data_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch image: {str(e)}")


class ImageGenerationRequest(BaseModel):
    """
    Request model for image generation
    """
    prompt: str = Field(..., description="Text description of the image to generate")
    provider: str = Field(..., description="Image generation provider (kling or replicate)")
    model: Optional[str] = Field(None, description="Model to use (for replicate, only 'flux-dev' is supported)")
    num_images: Optional[int] = Field(1, description="Number of images to generate", ge=1, le=10)
    width: Optional[int] = Field(1024, description="Image width (for Kling only)", ge=256, le=2048)
    height: Optional[int] = Field(1024, description="Image height (for Kling only)", ge=256, le=2048)
    negative_prompt: Optional[str] = Field(None, description="Negative prompt for image generation (Kling only)")
    reference_image: Optional[str] = Field(None, description="Reference image URL for image generation (Kling only)")
    aspect_ratio: Optional[str] = Field(None, description="Aspect ratio for the generated image (Kling only)")
    guidance: Optional[float] = Field(3.5, description="Guidance scale for Replicate flux-dev model", ge=1.0, le=20.0)


class VirtualTryOnRequest(BaseModel):
    """
    Request model for virtual try-on
    """
    human_image_url: str = Field(..., description="URL of the person image")
    garment_image_url: str = Field(..., description="URL of the garment image to try on")


class ImageGenerationResponse(BaseModel):
    """
    Response model for image operations
    """
    code: int = Field(0, description="Error code (0 for success)")
    message: str = Field("Success", description="Error message or success status")
    request_id: str = Field(..., description="Unique request identifier")
    data: Optional[ImageGenerationResult] = Field(None, description="Result data (null if error)")


@router.post("/virtual-try-on", response_model=ImageGenerationResponse)
async def virtual_try_on_endpoint(
        request: VirtualTryOnRequest
) -> ImageGenerationResponse:
    """
    Perform virtual try-on with FAL.AI.
    
    This endpoint uses FAL.AI's virtual try-on service to generate an image of a person
    wearing a specified garment. The service processes the request asynchronously and
    provides real-time logs of the generation process.
    
    Parameters:
    - human_image_url: URL of the person image
    - garment_image_url: URL of the garment to try on
    """
    try:
        result = await virtual_try_on_with_fal(
            human_image_url=request.human_image_url,
            garment_image_url=request.garment_image_url,
            api_key=settings.FAL_API_KEY
        )

        request_id = f"vton_{int(time.time() * 1000)}_{hash(request.human_image_url) % 10000:04d}"

        return ImageGenerationResponse(
            code=0,
            message="Success",
            request_id=request_id,
            data=result
        )

    except HTTPException as e:
        return ImageGenerationResponse(
            code=e.status_code,
            message=str(e.detail),
            request_id=f"vton_{int(time.time() * 1000)}_{hash(str(e.detail)) % 10000:04d}",
            data=None
        )
    except Exception as e:
        return ImageGenerationResponse(
            code=500,
            message=str(e),
            request_id=f"vton_{int(time.time() * 1000)}_{hash(str(e)) % 10000:04d}",
            data=None
        )


@router.post("/generate-image", response_model=ImageGenerationResponse)
async def generate_image_endpoint(
        request: ImageGenerationRequest
) -> ImageGenerationResponse:
    """
    Generate images using specified provider.
    
    Currently supports:
    1. Kling AI:
       - Full feature set including negative prompts, reference images, and aspect ratios
       - Configurable image dimensions
       - Asynchronous processing with status updates
    
    2. Replicate (flux-dev):
       - Simple text-to-image generation
       - Adjustable guidance scale (default: 3.5)
       - Immediate URL response
    """
    try:
        result = await generate_image(
            prompt=request.prompt,
            provider=request.provider,
            model=request.model,
            num_images=request.num_images,
            width=request.width,
            height=request.height,
            negative_prompt=request.negative_prompt if request.negative_prompt else 'low quality, unrealistic, no cloths',
            reference_image=request.reference_image,
            aspect_ratio=request.aspect_ratio,
            guidance=request.guidance,
            access_token=settings.KLING_API_KEY if request.provider.lower() == "kling" else settings.REPLICATE_API_TOKEN
        )

        # Generate a unique request ID using timestamp and random suffix
        request_id = f"req_{int(time.time() * 1000)}_{hash(request.prompt) % 10000:04d}"

        return ImageGenerationResponse(
            code=0,
            message="Success",
            request_id=request_id,
            data=result
        )

    except HTTPException as e:
        # Convert HTTPException to our response format
        return ImageGenerationResponse(
            code=e.status_code,
            message=str(e.detail),
            request_id=f"req_{int(time.time() * 1000)}_{hash(str(e.detail)) % 10000:04d}",
            data=None
        )
    except Exception as e:
        # Handle unexpected errors
        return ImageGenerationResponse(
            code=500,
            message=str(e),
            request_id=f"req_{int(time.time() * 1000)}_{hash(str(e)) % 10000:04d}",
            data=None
        )
