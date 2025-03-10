# src/modules/services/ai_services.py

import os
import logging
import base64
import openai
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)

async def generate_product_description(cloth_img: Image.Image, cloth_type: str) -> str:
    try:
        base_64_image = pil_image_to_base64(cloth_img)

        if cloth_type == "upper":
            system_prompt = """
                You are world class fahsion designer
                Your task is to Write a detailed description of the upper body garment shown in the image, focusing on its fit, sleeve style, fabric type, neckline, and any notable design elements or features in one or two lines for given image.
                Don't start with "This image shows a pair of beige cargo ..." but instead start with "a pair of beige cargo ..."
            """
        elif cloth_type == "lower":
            system_prompt = """
                You are world class fahsion designer
                Your task is to Write a detailed description of the lower body garment shown in the image, focusing on its fit, fabric type, waist style, and any notable design elements or features in one or two lines for given image.
                Don't start with "This image shows a pair of beige cargo ..." but instead start with "a pair of beige cargo ..."
            """
        elif cloth_type == "overall":
            system_prompt = """
                You are world class fahsion designer
                Your task is to Write a detailed description of the overall garment shown in the image, focusing on its fit, fabric type, sleeve style, neckline, and any notable design elements or features in one or two lines for given image.
                Don't start with "This image shows a pair of beige cargo ..." but instead start with "a pair of beige cargo ..."
            """
        else:
            system_prompt = """
                You are world class fahsion designer
                Your task is to Write a detailed description of the upper body garment shown in the image, focusing on its fit, sleeve style, fabric type, neckline, and any notable design elements or features in one or two lines for given image.
                Don't start with "This image shows a pair of beige cargo ..." but instead start with "a pair of beige cargo ..."
            """

        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": [
                    {
                       "type": "image_url",
                       "image_url": {
                            "url": f"data:image/jpeg;base64,{base_64_image}"
                       }
                    }
                ]},
            ],
        )

        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error generating product description: {e}", exc_info=True)
        return "Failed to generate product description."

async def generate_captions(product_description: str, campaign_context: str) -> str:
    #system prompt
    system_prompt = """
        You are a world-class marketing expert.
        Your task is to create engaging, professional, and contextually relevant campaign captions based on the details provided.
        Use creative language to highlight the product's key features and align with the campaign's goals.
        Ensure the captions are tailored to the specific advertising context provided.
    """

    #  user prompt
    user_prompt = f"""
    Campaign Context: {campaign_context}
    Product Description: {product_description}
    Generate captivating captions for this campaign that align with the provided context.
    """
    
    # Call OpenAI API
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )

    return response.choices[0].message.content.strip()


def pil_image_to_base64(image, format: str = "PNG") -> str:
    try:
        # If image is a file path, open it
        if isinstance(image, str):
            image = Image.open(image)
        elif not isinstance(image, Image.Image):
            raise ValueError("Input must be either a file path or a PIL Image object")
        
        # Convert the image to Base64
        buffered = BytesIO()
        image.save(buffered, format=format)
        buffered.seek(0)  # Go to the start of the BytesIO stream
        image_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return image_base64
    except Exception as e:
        print(f"Error converting image to Base64: {e}")
        raise e


