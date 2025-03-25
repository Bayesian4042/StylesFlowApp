"""
OpenAI service for image analysis and campaign generation
"""
from typing import Optional
from openai import AsyncOpenAI, BadRequestError
from fastapi import HTTPException

from src.config.settings import OPENAI_API_KEY

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

async def analyze_image(image_url: str) -> str:
    """
    Analyze clothing image using GPT-4 Vision API
    Args:
        image_url: URL or base64 data of the clothing image to analyze
    Returns:
        str: Detailed description of the clothing
    """
    try:
        print(f"Analyzing image. Format: {'base64' if image_url.startswith('data:') else 'url'}")
        print(f"Image data length: {len(image_url)}")
        
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Describe this clothing item in detail, focusing on its style, color, pattern, material, and any distinctive features. Keep the description concise but comprehensive."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                'url': image_url
                            }
                        }
                    ],
                }
            ],
            max_tokens=800
        )
        
        # Extract the description from the response
        description = response.choices[0].message.content.strip()
        print(f"Generated description: {description}")
        return description

    except BadRequestError as e:
        print(f"OpenAI BadRequestError: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"OpenAI request failed: {str(e)}"
        )
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze image with OpenAI: {str(e)}"
        )

async def generate_campaign(image_url: str, prompt: str) -> str:
    """
    Generate campaign content using GPT-4 Vision API
    Args:
        image_url: Base64 data of the garment image
        prompt: Campaign type/theme
    Returns:
        str: Generated campaign content
    """
    try:
        print(f"Generating campaign for prompt: {prompt}")
        print(f"Image data length: {len(image_url)}")
        
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Generate a creative and engaging campaign for this clothing item. The campaign theme is: {prompt}. Focus on highlighting the unique features and appeal of the garment. The campaign should be catchy, memorable, and suitable for marketing purposes."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                'url': image_url
                            }
                        }
                    ],
                }
            ],
            max_tokens=1000
        )
        
        # Extract the campaign content from the response
        campaign_content = response.choices[0].message.content.strip()
        print(f"Generated campaign: {campaign_content}")
        return campaign_content

    except BadRequestError as e:
        print(f"OpenAI BadRequestError: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"OpenAI request failed: {str(e)}"
        )
    except Exception as e:
        print(f"Error generating campaign: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate campaign with OpenAI: {str(e)}"
        )
