from typing import List, Optional
from pydantic import BaseModel
from fastapi import HTTPException
import time

from src.external_services.kling import (
    generate_image_with_kling,
    KlingImageRequest,
)
from src.external_services.replicate import (
    generate_image_with_replicate,
    ReplicateImageRequest,
)
from src.external_services.fal import (
    virtual_try_on,
    FalVirtualTryOnRequest,
)

class ImageGenerationResult(BaseModel):
    """
    Unified response model for image generation
    """
    task_id: str
    images: List[str]
    status: str
    created_at: int
    updated_at: int
    logs: Optional[List[str]] = None

async def virtual_try_on_with_fal(
    human_image_url: str,
    garment_image_url: str,
    api_key: str,
) -> ImageGenerationResult:
    """
    Perform virtual try-on with FAL.AI
    """
    try:
        current_time = int(time.time() * 1000)

        # Create request for FAL.AI
        vton_request = FalVirtualTryOnRequest(
            human_image_url=human_image_url,
            garment_image_url=garment_image_url,
        )
        
        # Perform virtual try-on
        vton_result = await virtual_try_on(vton_request, api_key)

        return ImageGenerationResult(
            task_id=vton_result.task_id,
            images=vton_result.result_images,
            status="succeed",
            created_at=current_time,
            updated_at=current_time,
            logs=vton_result.logs
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to perform virtual try-on: {str(e)}")

async def generate_image(
    prompt: str,
    provider: str,
    model: Optional[str] = None,
    num_images: Optional[int] = 1,
    width: Optional[int] = 1024,
    height: Optional[int] = 1024,
    negative_prompt: Optional[str] = None,
    reference_image: Optional[str] = None,
    aspect_ratio: Optional[str] = None,
    guidance: Optional[float] = 3.5,
    access_token: str = None,
) -> ImageGenerationResult:
    """
    Generate images using the specified provider and model
    """
    try:
        current_time = int(time.time() * 1000)  # Convert to milliseconds

        if provider.lower() == "kling":
            # Use Kling AI service
            request = KlingImageRequest(
                prompt=prompt,
                n=num_images,
                size=f"{width}x{height}",
                negative_prompt=negative_prompt,
                reference_image=reference_image,
                aspect_ratio=aspect_ratio
            )
            result = await generate_image_with_kling(request, access_token)
            
            return ImageGenerationResult(
                task_id=result.task_id,
                images=result.images,
                status=result.status,
                created_at=result.created_at,
                updated_at=result.updated_at
            )
            
        elif provider.lower() == "replicate":
            if not model or model.lower() != "flux-dev":
                raise ValueError("Only 'flux-dev' model is currently supported for Replicate provider")
            
            # Use Replicate service with flux-dev model
            request = ReplicateImageRequest(
                prompt=prompt,
                guidance=guidance,
                num_outputs=num_images
            )
            result = await generate_image_with_replicate(request, access_token)
            
            return ImageGenerationResult(
                task_id=result.task_id,
                images=result.images,
                status="succeed",  # Replicate returns immediately with URLs
                created_at=current_time,
                updated_at=current_time
            )
            
        else:
            raise ValueError(f"Unsupported provider: {provider}. Supported providers: kling, replicate")

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate image: {str(e)}")
