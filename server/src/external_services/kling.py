import json
import httpx
import asyncio
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# Constants for Kling AI API
KLING_API_BASE_URL = "https://api.kling.ai"
KLING_IMAGE_GEN_ENDPOINT = "/v1/images/generations"

class KlingImageRequest(BaseModel):
    """
    Request model for Kling image generation
    """
    model_name: str = "kling-v1"
    prompt: str
    negative_prompt: Optional[str] = None
    n: Optional[int] = 1
    reference_image: Optional[str] = None
    size: Optional[str] = "1024x1024"
    response_format: Optional[str] = "url"
    aspect_ratio: Optional[str] = "9:16"

class KlingTaskResponse(BaseModel):
    """
    Response model for initial task creation
    """
    code: int
    message: str
    request_id: str
    data: Dict[str, Any]

class KlingImageInfo(BaseModel):
    """
    Model for individual image information
    """
    index: int
    url: str

class KlingTaskResult(BaseModel):
    """
    Model for task result containing images
    """
    images: List[KlingImageInfo]

class KlingTaskStatusResponse(BaseModel):
    """
    Response model for task status check
    """
    code: int
    message: str
    request_id: str
    data: Dict[str, Any]

class KlingImageResponse(BaseModel):
    """
    Final response model for image generation
    """
    task_id: str
    images: List[str]
    status: str
    created_at: int
    updated_at: int

async def generate_image_with_kling(request: KlingImageRequest, access_token: str) -> KlingImageResponse:
    """
    Generate image using Kling AI API with two-step process:
    1. Submit task and get task_id
    2. Poll for task completion and get images
    """
    api_url = f"{KLING_API_BASE_URL}{KLING_IMAGE_GEN_ENDPOINT}"
    payload = request.model_dump(exclude_none=True)

    async with httpx.AsyncClient() as client:
        try:
            # Step 1: Submit task
            response = await client.post(
                f"{api_url}?access_token={access_token}",
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            task_data = response.json()

            if task_data.get("code") != 0:
                raise ValueError(f"Task creation failed: {task_data.get('message')}")

            task_id = task_data["data"]["task_id"]
            created_at = task_data["data"]["created_at"]

            # Step 2: Poll for task completion
            max_attempts = 30  # Maximum number of polling attempts
            poll_interval = 2  # Seconds between polling attempts

            for _ in range(max_attempts):
                status_response = await client.get(
                    f"{api_url}/{task_id}?access_token={access_token}",
                    timeout=30
                )
                status_response.raise_for_status()
                status_data = status_response.json()

                if status_data.get("code") != 0:
                    raise ValueError(f"Status check failed: {status_data.get('message')}")

                task_status = status_data["data"]["task_status"]
                updated_at = status_data["data"]["updated_at"]

                if task_status == "failed":
                    raise ValueError(f"Task failed: {status_data['data'].get('task_status_msg', 'Unknown error')}")
                
                if task_status == "succeed":
                    # Extract image URLs from task_result
                    images = []
                    if "task_result" in status_data["data"] and "images" in status_data["data"]["task_result"]:
                        for image_info in status_data["data"]["task_result"]["images"]:
                            images.append(image_info["url"])
                    
                    return KlingImageResponse(
                        task_id=task_id,
                        images=images,
                        status=task_status,
                        created_at=created_at,
                        updated_at=updated_at
                    )

                await asyncio.sleep(poll_interval)

            raise ValueError("Task timed out")

        except httpx.HTTPStatusError as e:
            raise ValueError(f"Kling AI API error: {e}")
        except httpx.RequestError as e:
            raise ValueError("Failed to connect to Kling AI API")
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON response from Kling AI API")
        except Exception as e:
            raise ValueError(f"An unexpected error occurred: {e}")
