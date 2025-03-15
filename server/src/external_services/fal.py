from typing import List, Optional
from pydantic import BaseModel
import fal_client
import asyncio
import os
class FalVirtualTryOnRequest(BaseModel):
    """
    Request model for FAL.AI virtual try-on
    """
    human_image_url: str
    garment_image_url: str

class FalVirtualTryOnResponse(BaseModel):
    """
    Response model for FAL.AI virtual try-on
    """
    task_id: str
    result_images: List[str]
    logs: List[str]

async def virtual_try_on(request: FalVirtualTryOnRequest, api_key: str) -> FalVirtualTryOnResponse:
    """
    Perform virtual try-on using FAL.AI API
    """
    try:
        fal_client.api_key = os.getenv("FAL_KEY", api_key)

        # Submit the request
        handler = await fal_client.submit_async(
            "fal-ai/leffa/virtual-tryon",
            arguments={
                "human_image_url": request.human_image_url,
                "garment_image_url": request.garment_image_url
            },
        )

        # Collect logs during processing
        logs = []
        async for event in handler.iter_events(with_logs=True):
            if isinstance(event, dict) and 'log' in event:
                logs.append(event['log'])

        # Get the final result
        result = await handler.get()

        # Extract image URLs correctly based on API response
        result_images = [result["image"]["url"]] if "image" in result and "url" in result["image"] else []

        return FalVirtualTryOnResponse(
            task_id=f"fal_{hash(request.human_image_url + request.garment_image_url) % 10000:04d}",
            result_images=result_images,
            logs=logs
        )

    except Exception as e:
        raise ValueError(f"FAL.AI virtual try-on error: {str(e)}")
"""

        # Get the final result
        result = await handler.get()

        # Extract image URLs from result
        # Note: Adjust this based on actual FAL.AI API response structure
        result_images = [result['image_url']] if 'image_url' in result else []

        return FalVirtualTryOnResponse(
            task_id=f"fal_{hash(request.human_image_url + request.garment_image_url) % 10000:04d}",
            result_images=result_images,
            logs=logs
        )

"""
