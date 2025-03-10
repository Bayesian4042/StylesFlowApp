# src/modules/routers/local_tryon.py

import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from src.modules.services.local_service import tryon_service
from src.modules.services import ai_services

router = APIRouter(tags=["Local TryOn"])
logger = logging.getLogger(__name__)

@router.post("/description")
async def generate_cloth_description(
    cloth_image: UploadFile = File(..., description="Product image (JPEG/PNG)"),
    cloth_type: str = Form("upper", description="Type of garment: upper/lower/overall")
):
    try:
        if not cloth_image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Invalid image format")

        cloth_bytes = await cloth_image.read()
        product_description = await tryon_service.generate_product_description(cloth_bytes, cloth_type)

        return JSONResponse({
            "product_description": product_description
        })
    except Exception as e:
        logger.error(f"Failed to generate cloth description: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/human-model")
async def generate_human_model(
    model_prompt: str = Form(..., description="User prompt for the human model"),
    product_description: str = Form(..., description="Product description from the previous step"),
    steps: int = Form(20, description="Num inference steps for the diffusion model"),
    guidance: float = Form(2.5, description="CFG scale"),
    seed: int = Form(-1, description="Random seed, -1 means random")
):
    try:
        human_image_url = await tryon_service.generate_human_model_endpoint(
            model_prompt=model_prompt,
            product_description=product_description,
            steps=steps,
            guidance=guidance,
            seed=seed
        )

        return JSONResponse({
            "human_model_url": human_image_url
        })
    except Exception as e:
        logger.error(f"Failed to generate human model: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/final-tryon")
async def final_tryon(
    cloth_image_url: str = Form(..., description="URL/path for the cloth image (from step #1)"),
    cloth_type: str = Form("upper", description="Type of garment: upper/lower/overall"),
    human_model_url: str = Form(..., description="URL of the previously generated human model"),
    campaign_context: str = Form(..., description="Additional prompt for campaign caption")
):
    try:

        cloth_bytes = await tryon_service.load_cloth_image(cloth_image_url)
        result = await tryon_service.apply_catvton_and_captions(
            cloth_bytes=cloth_bytes,
            cloth_type=cloth_type,
            human_model_url=human_model_url,
            campaign_context=campaign_context
        )

        return JSONResponse({
            "tryon_image_url": result["tryon_image_url"],
            "captions": result["captions"]
        })
    except Exception as e:
        logger.error(f"Failed to perform final try-on: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))




