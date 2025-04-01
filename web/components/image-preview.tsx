'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiUrl } from '@/config';

interface ImagePreviewProps {
	imageUrl: string | null;
	previewType?: 'ai-model';
	onOverlayClick?: () => void;
	isGenerating?: boolean;
	garmentImage?: string | null;
	showOverlayButton?: boolean;
	isOverlaid?: boolean;
}

export default function ImagePreview({ 
	imageUrl, 
	previewType = 'ai-model',
	onOverlayClick,
	isGenerating,
	garmentImage,
	showOverlayButton = false,
	isOverlaid = false
}: ImagePreviewProps) {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (imageUrl) {
			console.log('Loading image:', imageUrl.substring(0, 100) + '...');
			setIsLoading(true);
			setError(null);
		}
	}, [imageUrl]);

	const handleImageLoad = () => {
		console.log('Image loaded successfully');
		setIsLoading(false);
	};

	const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		const img = e.target as HTMLImageElement;
		console.error('Error loading image:', {
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
		<div className='relative w-full h-full overflow-hidden rounded-lg bg-card transition-all duration-300 border border-border'>
			{imageUrl ? (
				<>
				<div className='relative w-full h-[calc(100%-48px)] flex items-center justify-center p-2 bg-background'>
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
						<>
							<img
								key={imageUrl} // Force re-render when URL changes
								src={imageUrl.startsWith('http') ? imageUrl : `${apiUrl}/${imageUrl}`}
								alt='Generated image'
								className='max-w-full h-auto max-h-[720px] rounded-lg object-contain'
								onLoad={handleImageLoad}
								onError={handleImageError}
								crossOrigin="anonymous"
							/>
						</>
					)}
				</div>
				{showOverlayButton && !isOverlaid && (
					<div className="absolute bottom-0 left-0 right-0 h-[48px] px-4 py-2 border-t border-border bg-card">
						<button
							className="w-full px-4 py-2 text-sm font-medium text-center bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={onOverlayClick}
							disabled={isGenerating || !garmentImage}
						>
							{isGenerating ? "Processing..." : "Try On Garment"}
						</button>
					</div>
				)}
				</>
			) : (
				<div className='absolute inset-0 flex flex-col items-center justify-center text-center text-gray-500'>
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
					<p>Enter a prompt and click Generate to create an AI model</p>
				</div>
			)}
		</div>
	);
}
