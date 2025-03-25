import { ApiClient } from '@/lib/api-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, garment_image_url } = body;

    // Call the campaign generation API
    const result = await ApiClient.post('/api/image-generation/generate-campaign', {
      prompt,
      garment_image_url
    });

    return Response.json(result.data);
  } catch (error) {
    console.error('Campaign generation error:', error);
    return Response.json(
      { error: 'Failed to generate campaign images' },
      { status: 500 }
    );
  }
}
