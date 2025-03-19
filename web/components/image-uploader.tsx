'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
	singleImage?: boolean;
	onImageUpload?: (image: string | null) => void;
}

export default function ImageUploader({ singleImage = false, onImageUpload }: ImageUploaderProps) {
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		if (onImageUpload) {
			onImageUpload(uploadedImages[0] || null);
		}
	}, [uploadedImages, onImageUpload]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
			const newImages = files.map((file) => URL.createObjectURL(file));
			
			if (singleImage) {
				// Clear previous images and only use the latest one
				setUploadedImages([newImages[0]]);
			} else {
				setUploadedImages((prev) => [...prev, ...newImages]);
			}
		}
	};

	const removeImage = (index: number) => {
		setUploadedImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
			const newImages = files.map((file) => URL.createObjectURL(file));
			
			if (singleImage) {
				// Clear previous images and only use the latest one
				setUploadedImages([newImages[0]]);
			} else {
				setUploadedImages((prev) => [...prev, ...newImages]);
			}
		}
	};

	return (
		<div className='space-y-4'>
			<div
				className={`rounded-lg border-2 border-dashed p-6 text-center ${
					isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
				}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<Upload className='mx-auto h-12 w-12 text-muted-foreground' />
				<h3 className='mt-2 text-sm font-medium'>Drag & drop a clothing image</h3>
				<p className='mt-1 text-xs text-muted-foreground'>Or click to browse from your device</p>
				<input 
					type='file' 
					accept='image/*' 
					multiple={!singleImage} 
					className='hidden' 
					id='file-upload' 
					onChange={handleFileChange} 
				/>
				<Button variant='outline' className='mt-4' onClick={() => document.getElementById('file-upload')?.click()}>
					Select Files
				</Button>
			</div>

			{uploadedImages.length > 0 && (
				<div className={singleImage ? 'w-full' : 'grid grid-cols-2 gap-2'}>
					{uploadedImages.map((image, index) => (
						<div key={index} className='group relative'>
							<img
								src={image || '/placeholder.svg'}
								alt={`Uploaded clothing ${index + 1}`}
								className={`rounded-md object-cover ${singleImage ? 'h-48 w-full' : 'h-32 w-full'}`}
							/>
							<button
								className='absolute right-1 top-1 rounded-full bg-black/70 p-1 opacity-0 transition-opacity group-hover:opacity-100'
								onClick={() => removeImage(index)}
							>
								<X className='h-4 w-4 text-white' />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
