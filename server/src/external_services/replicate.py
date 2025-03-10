import replicate
from typing import List, Optional
from pydantic import BaseModel

class ReplicateImageRequest(BaseModel):
    """
    Request model for Replicate image generation
    """
    prompt: str
    guidance: Optional[float] = 3.5
    num_outputs: Optional[int] = 1

class ReplicateImageResponse(BaseModel):
    """
    Response model for Replicate image generation
    """
    task_id: str
    images: List[str]

# Available Replicate models
REPLICATE_MODELS = {
    "flux-dev": "black-forest-labs/flux-dev"
}

async def generate_image_with_replicate(request: ReplicateImageRequest, api_token: str) -> ReplicateImageResponse:
    """
    Generate image using Replicate API
    """
    try:
        # Configure Replicate client with API token
        client = replicate.Client(api_token=api_token)

        # Run the model
        output = client.run(
            REPLICATE_MODELS["flux-dev"],
            input={
                "prompt": request.prompt,
                "guidance_scale": request.guidance,
                "num_outputs": request.num_outputs
            }
        )

        # Convert FileOutput objects to URLs
        image_urls = []
        outputs = output if isinstance(output, list) else [output]
        for item in outputs:
            # Get the URL from the FileOutput object
            url = str(item) if hasattr(item, '__str__') else None
            if url and url.endswith('.webp'):
                image_urls.append(url)

        return ReplicateImageResponse(
            task_id=f"replicate_{hash(request.prompt) % 10000:04d}",
            images=image_urls
        )

    except Exception as e:
        raise ValueError(f"Replicate API error: {str(e)}")
