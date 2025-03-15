import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	console.log('Received virtual try-on request');
	try {
		const body = await req.json();
		const { human_image_url, garment_image_url } = body;

		if (!human_image_url || !garment_image_url) {
			return NextResponse.json(
				{
					code: 400,
					message: 'Both model and garment images are required',
					data: null,
				},
				{ status: 400 }
			);
		}

		console.log('Received request with body:', { human_image_url, garment_image_url });
		
		const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/image-generation/virtual-try-on`;
		console.log('Making request to backend API:', apiUrl);
		
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				human_image_url,
				garment_image_url,
			}),
		});

		const data = await response.json();
		console.log('Backend API Response:', {
			code: data.code,
			message: data.message,
			hasImages: Boolean(data.data?.images?.length),
			imageCount: data.data?.images?.length
		});

		if (!response.ok) {
			throw new Error(data.message || 'Failed to generate overlay');
		}

		// If overlay generation was successful, validate the image URL
		if (data.code === 0 && data.data?.images?.[0]) {
			const imageUrl = data.data.images[0];
			console.log('Received image URL from backend:', imageUrl);
			
			if (!imageUrl.startsWith('https://')) {
				throw new Error('Invalid image URL received from backend');
			}
		}

		console.log('Final response data:', data);
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error generating overlay:', error);
		return NextResponse.json(
			{
				code: 500,
				message: error instanceof Error ? error.message : 'Internal server error',
				data: null,
			},
			{ status: 500 }
		);
	}
}
