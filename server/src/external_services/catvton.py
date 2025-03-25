from typing import List, Optional
from pydantic import BaseModel
import os
import aiohttp
from fastapi import UploadFile
import base64
from aiohttp import FormData
from ..config.constants import OUTPUT_DIR


class CatVTONRequest(BaseModel):
    """
    Request model for CatVTON virtual try-on
    """
    human_image_url: str
    garment_image_url: str
    garment_type: str = "overall"

class CatVTONResponse(BaseModel):
    """
    Response model for CatVTON virtual try-on
    """
    task_id: str
    image_path: str  # Path to the saved image
    logs: List[str]

async def base64_to_uploadfile(base64_url: str, filename: str = "image.png") -> UploadFile:
    # Extract the Base64 part from the URL (e.g., "data:image/png;base64,...")
    base64_data = base64_url.split(",")[1]

    # Decode the Base64 string into binary data
    image_data = base64.b64decode(base64_data)

    # Create an UploadFile object
    upload_file = UploadFile(filename=filename, file=BytesIO(image_data))

    return upload_file

from fastapi import UploadFile
from io import BytesIO
import httpx
import mimetypes

async def url_to_uploadfile(image_url: str) -> UploadFile:
    # Download the image from the URL
    async with httpx.AsyncClient() as client:
        response = await client.get(image_url)
        response.raise_for_status()  # Raise an error for bad responses

        # Determine the file extension
        content_type = response.headers.get("Content-Type")
        if content_type:
            # Map MIME type to file extension (e.g., "image/webp" -> ".webp")
            file_extension = mimetypes.guess_extension(content_type) or ".bin"
        else:
            # Fallback: Extract extension from the URL
            file_extension = "." + image_url.split(".")[-1].lower()

        # Create a filename with the correct extension
        filename = f"image{file_extension}"

        # Create an UploadFile object
        image_data = BytesIO(response.content)
        upload_file = UploadFile(filename=filename, file=image_data)

        return upload_file

async def virtual_try_on(request: CatVTONRequest) -> CatVTONResponse:
    """
    Perform virtual try-on using CatVTON API
    """
    try:
        logs = ["Starting CatVTON API request"]
        
        api_url = "https://catcontainer.calmpebble-9c79c8f4.westus3.azurecontainerapps.io/tryon"
        
        async with aiohttp.ClientSession() as session:
            logs.append("Sending request to CatVTON API")

            person_image = await url_to_uploadfile(request.human_image_url)
            cloth_image = await base64_to_uploadfile(request.garment_image_url)

            # Prepare FormData for multipart upload
            form_data = FormData()

            # Add files
            form_data.add_field(
                name="person_image",
                value=person_image.file.read(),
                filename=person_image.filename,
                content_type="image/jpeg"
            )
            form_data.add_field(
                name="cloth_image",
                value=cloth_image.file.read(),
                filename=cloth_image.filename,
                content_type="image/png"
            )

            # Add other form fields
            form_data.add_field("cloth_type", request.garment_type)
            form_data.add_field("num_inference_steps", "50")
            form_data.add_field("guidance_scale", "3")
            form_data.add_field("seed", "42")
            form_data.add_field("show_type", "result only")

            # Make API request
            async with session.post(
                    api_url,
                    data=form_data,
            ) as response:
                logs.append(f"Received response from CatVTON API: {response.status}")

                if response.status == 200:
                    # Parse the API response
                    result = await response.json()
                    result_image = result.get("result_image", [])  # List of Base64-encoded image strings
                    
                    # Generate task_id
                    task_id = f"catvton_{hash(request.human_image_url + request.garment_image_url) % 10000:04d}"
                    
                    # Ensure output directory exists
                    os.makedirs(OUTPUT_DIR, exist_ok=True)
                    
                    # Save image with task_id in filename
                    image_path = os.path.join(OUTPUT_DIR, f"{task_id}.png")
                    image_data = base64.b64decode(result_image)
                    
                    print(f"Debug - Saving image to: {image_path}")
                    print(f"Debug - Output directory: {OUTPUT_DIR}")
                    print(f"Debug - Current directory: {os.getcwd()}")
                    
                    with open(image_path, "wb") as f:
                        f.write(image_data)

                    logs.append(f"Successfully processed and saved image to {image_path}")
                    print(f"Debug - After save, file exists: {os.path.exists(image_path)}")
                else:
                    raise ValueError(f"API request failed with status {response.status}")

        return CatVTONResponse(
            task_id=task_id,
            image_path=image_path,
            logs=logs
        )

    except Exception as e:
        raise ValueError(f"CatVTON virtual try-on error: {str(e)}")
