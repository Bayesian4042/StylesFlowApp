import os
import httpx
import replicate
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
load_dotenv('.env')

# Load API keys
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
KOLORS_API_KEY = os.getenv("KLING_API_KEY")  # Set this in environment variables

if not REPLICATE_API_TOKEN:
    raise ValueError("Missing Replicate API key. Set REPLICATE_API_TOKEN in environment variables.")
if not KOLORS_API_KEY:
    raise ValueError("Missing Kolors API key. Set KOLORS_API_KEY in environment variables.")

# API Endpoints
KOLORS_TRYON_URL = "https://gateway.appypie.com/kling-ai-vton/v1/getVirtualTryOnTask"
KOLORS_STATUS_URL = "https://gateway.appypie.com/kling-ai-polling/v1/getVirtualTryOnStatus"


router = APIRouter()

class ReplicateInput(BaseModel):
    prompt: str
    seed: Optional[int] = None
    go_fast: bool = True
    guidance: float = 3
    megapixels: str = "1"
    num_outputs: int = 1
    aspect_ratio: str = "1:1"
    output_format: str = "webp"
    output_quality: int = 80
    prompt_strength: float = 0.8
    num_inference_steps: int = 28
    disable_safety_checker: bool = False

class ReplicateOutput(BaseModel):
    output: List[str]  

@router.post("/replicate", response_model=ReplicateOutput)
async def generate_image(input_data: ReplicateInput):
    try:
        output = replicate.run(
            "black-forest-labs/flux-dev",
            input=input_data.dict(),
            use_file_output=True
        )

        return {"output": output}  # List of image URLs

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating image: {str(e)}")


class KolorsInput(BaseModel):
    cloth_image: str  
    human_image: Optional[str] = None  

class KolorsOutput(BaseModel):
    task_id: str
    message: str

@router.post("/kolors", response_model=KolorsOutput)
async def virtual_tryon(input_data: KolorsInput):
    headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": KOLORS_API_KEY
    }

    if not input_data.human_image:
        raise HTTPException(status_code=400, detail="Human image is required.")

    payload = {
        "human_image": input_data.human_image,
        "cloth_image": input_data.cloth_image,
        "callback_url": ""  
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(KOLORS_TRYON_URL, headers=headers, json=payload)
            response_data = response.json()

        if response.status_code != 200 or response_data.get("code") != 0:
            raise HTTPException(status_code=response.status_code, detail=response_data.get("message", "Kolors API error."))

        return {
            "task_id": response_data["data"]["task_id"],
            "message": "Task submitted successfully."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting try-on task: {str(e)}")

class KolorsStatusInput(BaseModel):
    task_id: str

class KolorsStatusOutput(BaseModel):
    task_status: str
    task_result: Optional[List[str]] = None  # URLs of the final images

@router.post("/kolors/status", response_model=KolorsStatusOutput)
async def get_tryon_status(input_data: KolorsStatusInput):
    headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": KOLORS_API_KEY
    }

    payload = {"task_id": input_data.task_id}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(KOLORS_STATUS_URL, headers=headers, json=payload)
            response_data = response.json()

        if response.status_code != 200 or response_data.get("code") != 0:
            raise HTTPException(status_code=response.status_code, detail=response_data.get("message", "Kolors polling error."))

        task_status = response_data["data"]["task_status"]

        # If the task is complete, return the final image URL(s)
        if task_status == "succeed":
            task_result = [img["url"] for img in response_data["data"]["task_result"]["images"]]
            return {"task_status": task_status, "task_result": task_result}

        return {"task_status": task_status,
                "task_result": task_result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching try-on status: {str(e)}")
