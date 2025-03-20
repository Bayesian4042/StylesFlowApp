import { NextRequest, NextResponse } from 'next/server';

async function fetchImageAsBase64(url: string): Promise<string> {
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	const contentType = response.headers.get('content-type') || 'image/webp';
	return `data:${contentType};base64,${buffer.toString('base64')}`;
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		
		// If garment_image_url is a blob URL, convert it to base64
		if (body.garment_image_url?.startsWith('blob:')) {
			try {
				body.garment_image_url = await fetchImageAsBase64(body.garment_image_url);
			} catch (error) {
				console.error('Error converting blob to base64:', error);
				return NextResponse.json(
					{
						code: 400,
						message: 'Failed to process garment image',
						data: null,
					},
					{ status: 400 }
				);
			}
		}

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/image-generation/generate-image`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || 'Failed to generate image');
		}

		// If image generation was successful, fetch the image and convert to base64
		if (data.code === 0 && data.data?.images?.[0]) {
			const imageUrl = data.data.images[0];
			const base64Image = await fetchImageAsBase64(imageUrl);
			data.data.images[0] = base64Image;
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error('Error generating image:', error);
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
