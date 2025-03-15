'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PromptInput from '@/components/prompt-input';
import ReferenceUpload from '@/components/reference-upload';
import ImagePreview from '@/components/image-preview';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function AIVirtualTryOn() {
	const [prompt, setPrompt] = useState('');
	const [generatedImage, setGeneratedImage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleGenerate = async () => {
		if (!prompt.trim()) return;

		setIsLoading(true);
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/image-generation/generate-image`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					prompt: prompt,
					provider: 'replicate', // or "kling" based on your preference
					model: 'flux-dev',
					num_images: 1,
				}),
			});

			const data = await response.json();

			if (data.code === 0 && data.data?.images?.[0]) {
				// Set the image URL from the API response
				const imageUrl = data.data.images[0];
				console.log('Setting image URL:', imageUrl);
				setGeneratedImage(imageUrl);
			} else {
				console.error('Image generation failed:', data.message);
			}
		} catch (error) {
			console.error('Failed to generate image:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='relative flex h-screen bg-background'>
			<div className='absolute left-4 top-4 z-50 md:hidden'>
				<SidebarTrigger />
			</div>
			{/* Controls Panel */}
			<div className='flex w-[370px] min-w-[370px] flex-col border-r border-border transition-all duration-300 md:group-data-[collapsible=icon]:w-[48px] md:group-data-[collapsible=icon]:min-w-[48px]'>
				{/* AI Virtual Try-On Title */}
				<div className='border-b border-border p-4 transition-opacity duration-300 md:group-data-[collapsible=icon]:opacity-0'>
					<h1 className='text-lg font-medium'>AI Virtual Try-On</h1>
				</div>

				{/* Content Sections */}
				<div className='flex-1 overflow-y-auto transition-opacity duration-300 md:group-data-[collapsible=icon]:opacity-0'>
					{/* Prompt Section */}
					<PromptInput value={prompt} onChange={setPrompt} />

					{/* Reference Upload Section */}
					<ReferenceUpload />

					{/* Generate Button */}
					<div className='border-t border-border p-4'>
						<Button
							className='w-full bg-gradient-to-r from-[#4caf50] to-[#2e7d32] py-6 font-medium text-white hover:from-[#43a047] hover:to-[#2e7d32]'
							onClick={handleGenerate}
							disabled={isLoading || !prompt.trim()}
						>
							{isLoading ? 'Generating...' : 'Generate'}
						</Button>
					</div>
				</div>
			</div>

			{/* Preview Area */}
			<div className='relative flex flex-1 items-center justify-center p-4 transition-all duration-300'>
				<ImagePreview imageUrl={generatedImage} />
			</div>
		</div>
	);
}
