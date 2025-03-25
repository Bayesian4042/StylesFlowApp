import { ApiClient } from '@/lib/api-client';

interface CampaignGenerationResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    campaign_content: string;
    status: string;
    created_at: number;
    updated_at: number;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, garment_image_url } = body;

    // Call the campaign generation API
    const result = await ApiClient.post<CampaignGenerationResponse>('/api/image-generation/generate-campaign', {
      prompt,
      garment_image_url
    });

    // Check if we have a valid response
    if (!result.data) {
      throw new Error('Invalid response from server');
    }

    // Log the response from the backend
    console.log('Backend response:', result);

    // Return the response directly since the frontend expects the same structure
    return Response.json(result.data);
  } catch (error) {
    console.error('Campaign generation error:', error);
    return Response.json(
      { 
        success: false,
        error: 'Failed to generate campaign content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
