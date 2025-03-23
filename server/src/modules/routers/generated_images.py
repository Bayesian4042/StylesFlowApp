from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from pathlib import Path
from ...config.constants import OUTPUT_DIR

generated_images_router = APIRouter(tags=["generated-images"])

@generated_images_router.get("/generated-images/{image_name}")
async def get_generated_image(image_name: str):
    """
    Serve generated images from the output directory
    """
    # Ensure the image name is safe and doesn't contain path traversal
    safe_name = Path(image_name).name
    image_path = os.path.join(OUTPUT_DIR, safe_name)
    
    print(f"Debug - Looking for image at: {image_path}")
    print(f"Debug - Current directory: {os.getcwd()}")
    print(f"Debug - Directory contents: {os.listdir(OUTPUT_DIR)}")
    
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail=f"Image not found at {image_path}")
    
    # Serve the image file with appropriate content type
    return FileResponse(
        image_path,
        media_type="image/png",
        filename=safe_name
    )
