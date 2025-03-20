# src/modules/services/local_service.py

import logging
import torch
from io import BytesIO
from PIL import Image

from diffusers import FluxPipeline
# CatVTON pipeline & automasker from your "model" folder
from src.checkpoints.model.pipeline import CatVTONPipeline
from src.checkpoints.model.cloth_masker import AutoMasker, vis_mask
from src.checkpoints.utils import init_weight_dtype, resize_and_crop, resize_and_padding
from transformers import T5EncoderModel
from diffusers import FluxPipeline, FluxTransformer2DModel
from utils import (
    image_grid,
    VaeImageProcessor
)

from services import ai_services, storage_service
from config.settings import settings

logger = logging.getLogger(__name__)
ckpt_4bit_id = "sayakpaul/flux.1-dev-nf4-pkg"

text_encoder_2_4bit = T5EncoderModel.from_pretrained(
    ckpt_4bit_id,
    subfolder="text_encoder_2",
)

class TryOnPipeline:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.weight_dtype = init_weight_dtype(settings.MIXED_PRECISION)
        self._init_models()

    def _init_models(self):
        logger.info("Initializing local pipelines (CatVTON, AutoMasker, Flux)...")

        self.mask_processor = VaeImageProcessor(
            vae_scale_factor=8,
            do_normalize=False,
            do_binarize=True,
            do_convert_grayscale=True
        )

        self.automasker = AutoMasker(
            densepose_ckpt=settings.DENSEPOSE_CHECKPOINT,
            schp_ckpt=settings.SCHP_CHECKPOINT,
            device=self.device
        )

        self.catvton = CatVTONPipeline(
            base_ckpt=settings.BASE_MODEL_PATH,    
            attn_ckpt=settings.CATVTON_CHECKPOINT, 
            attn_ckpt_version="mix",
            weight_dtype=self.weight_dtype,
            use_tf32=settings.ALLOW_TF32,
            device=self.device
        )

        self.flux_pipeline = FluxPipeline.from_pretrained(
            settings.FLUX_MODEL_ID,   
            text_encoder_2=text_encoder_2_4bit,
            transformer=None,
            vae=None,
            torch_dtype=torch.float16
        )
        self.flux_pipeline.enable_model_cpu_offload()

        logger.info("All models initialized (CatVTON, AutoMasker, Flux).")

    async def generate_product_description(self, cloth_bytes: bytes, cloth_type: str) -> str:
        try:
            cloth_img = self._bytes_to_image(cloth_bytes)
            cloth_img = resize_and_padding(cloth_img, (settings.IMG_WIDTH, settings.IMG_HEIGHT))

            # This calls the new function in ai_services that has the same system prompts that we used in our app.py file
            description = await ai_services.generate_product_description(cloth_img, cloth_type)
            return description
        except Exception as e:
            logger.error(f"Error generating product description: {e}", exc_info=True)
            raise

    async def generate_human_model_endpoint(
        self,
        model_prompt: str,
        product_description: str,
        steps: int,
        guidance: float,
        seed: int
    ) -> str:
        try:
            full_prompt = f"{model_prompt} wearing {product_description}, full body, photorealistic"
            logger.info(f"Generating human model with prompt: {full_prompt}")

            generator = None
            if seed != -1:
                generator = torch.Generator(device=self.device).manual_seed(seed)

            result = self.flux_pipeline(
                prompt=full_prompt,
                num_inference_steps=steps,
                guidance_scale=guidance,
                generator=generator,
                height=settings.IMG_HEIGHT,
                width=settings.IMG_WIDTH
            )
            human_img = result.images[0]

            image_bytes = self._image_to_bytes(human_img)
            image_url = storage_service.upload_image(image_bytes)
            return image_url
        except Exception as e:
            logger.error(f"Failed generating human model: {str(e)}", exc_info=True)
            raise

    async def apply_catvton_and_captions(
        self,
        cloth_bytes: bytes,
        cloth_type: str,
        human_model_url: str,
        campaign_context: str
    ) -> dict:
        try:
            cloth_img = self._bytes_to_image(cloth_bytes)
            cloth_img = resize_and_padding(cloth_img, (settings.IMG_WIDTH, settings.IMG_HEIGHT))

            human_img = self._download_image(human_model_url)
            human_img = resize_and_crop(human_img, (settings.IMG_WIDTH, settings.IMG_HEIGHT))

            mask = self.automasker(human_img, cloth_type)["mask"]
            mask = self.mask_processor.blur(mask, blur_factor=9)

            result_img = self.catvton(
                image=human_img,
                condition_image=cloth_img,
                mask=mask,
                num_inference_steps=settings.CATVTON_STEPS,
                guidance_scale=settings.CATVTON_GUIDANCE
            )[0]

            captions = await ai_services.generate_captions("the garment", campaign_context)

            # Upload final image to storage
            final_bytes = self._image_to_bytes(result_img)
            tryon_image_url = storage_service.upload_image(final_bytes)

            return {
                "tryon_image_url": tryon_image_url,
                "captions": captions
            }
        except Exception as e:
            logger.error(f"Failed final tryon step: {str(e)}", exc_info=True)
            self._cleanup()
            raise

    def _download_image(self, image_url: str) -> Image.Image:
        import requests
        resp = requests.get(image_url)
        resp.raise_for_status()
        return Image.open(BytesIO(resp.content)).convert("RGB")

    def _bytes_to_image(self, image_bytes: bytes) -> Image.Image:
        return Image.open(BytesIO(image_bytes)).convert("RGB")

    def _image_to_bytes(self, img: Image.Image) -> bytes:
        buf = BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()

    def _cleanup(self):
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            logger.info("CUDA cache cleared.")


tryon_service = TryOnPipeline()
