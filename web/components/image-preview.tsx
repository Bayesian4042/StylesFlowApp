'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImagePreviewProps {
	imageUrl: string | null;
	previewType?: 'ai-model' | 'cloth-overlay';
}

export default function ImagePreview({ imageUrl, previewType = 'ai-model' }: ImagePreviewProps) {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (imageUrl) {
			console.log(`Loading ${previewType} image:`, imageUrl.substring(0, 100) + '...');
			setIsLoading(true);
			setError(null);
		}
	}, [imageUrl, previewType]);

	const handleImageLoad = () => {
		console.log(`${previewType} image loaded successfully`);
		setIsLoading(false);
	};

	const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		const img = e.target as HTMLImageElement;
		console.error(`Error loading ${previewType} image:`, {
			src: img.src,
			naturalWidth: img.naturalWidth,
			naturalHeight: img.naturalHeight,
			complete: img.complete,
			currentSrc: img.currentSrc
		});
		setError('Failed to load image. Please try again.');
		setIsLoading(false);
	};

	return (
		<div className='flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-[#1a1a1f] min-h-[600px]'>
			{imageUrl ? (
				<div className='relative flex h-full w-full items-center justify-center p-4'>
					{isLoading && (
						<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
							<div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
						</div>
					)}
					{error ? (
						<div className='text-center text-red-500'>
							<p>{error}</p>
						</div>
					) : (
						<img
							key={imageUrl} // Force re-render when URL changes
							src={imageUrl}
							alt='Generated image'
							className='w-auto h-auto max-w-full max-h-[600px] rounded-lg object-contain'
							onLoad={handleImageLoad}
							onError={handleImageError}
							crossOrigin="anonymous"
						/>
					)}
				</div>
			) : (
				<div className='p-4 text-center text-gray-500'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='48'
						height='48'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='mx-auto mb-4 text-gray-600'
					>
						<rect width='18' height='18' x='3' y='3' rx='2' ry='2' />
						<circle cx='9' cy='9' r='2' />
						<path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' />
					</svg>
					<p>
						{previewType === 'ai-model' 
							? 'Enter a prompt and click Generate to create an AI model'
							: 'Upload or generate a cloth image for overlay'
						}
						</p>
				</div>
			)}
		</div>
	);
}
