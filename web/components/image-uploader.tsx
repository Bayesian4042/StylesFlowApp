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

	// Remove the useEffect since we're calling onImageUpload directly in the handlers

	const convertToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			// Validate file type
			const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
			if (!validImageTypes.includes(file.type)) {
				reject(new Error('Invalid image format. Please upload a JPEG, PNG, or WebP image.'));
				return;
			}

			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				const result = reader.result as string;
				if (!result.startsWith('data:image/')) {
					reject(new Error('Invalid image data format'));
					return;
				}
				resolve(result);
			};
			reader.onerror = error => reject(new Error('Failed to read image file'));
		});
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		console.log('File change event triggered');
		if (e.target.files && e.target.files.length > 0) {
			try {
				const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
				console.log('Valid image files:', files.length);
				
				if (files.length === 0) {
					throw new Error('Please select a valid image file');
				}

				const newImages = await Promise.all(files.map(convertToBase64));
				console.log('Converted images to base64');
				
				if (singleImage) {
					console.log('Setting single image');
					const newImage = newImages[0];
					console.log('New image data:', newImage ? 'Present' : 'Not present');
					setUploadedImages([newImage]);
					if (onImageUpload) {
						console.log('Calling onImageUpload with new image');
						onImageUpload(newImage);
					}
				} else {
					console.log('Adding to existing images');
					setUploadedImages((prev) => {
						const updatedImages = [...prev, ...newImages];
						if (onImageUpload) {
							onImageUpload(updatedImages[0]);
						}
						return updatedImages;
					});
				}
			} catch (error) {
				console.error('Error in handleFileChange:', error);
				setUploadedImages([]);
				if (onImageUpload) {
					onImageUpload(null);
				}
				if (error instanceof Error) {
					throw error;
				} else {
					throw new Error('Failed to process image');
				}
			}
		}
	};

	const removeImage = (index: number) => {
		console.log('Removing image at index:', index);
		setUploadedImages([]);
		if (onImageUpload) {
			console.log('Calling onImageUpload with null after remove');
			onImageUpload(null);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = async (e: React.DragEvent) => {
		console.log('Drop event triggered');
		e.preventDefault();
		setIsDragging(false);

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			try {
				const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
				console.log('Valid dropped image files:', files.length);
				
				if (files.length === 0) {
					throw new Error('Please drop a valid image file');
				}

				const newImages = await Promise.all(files.map(convertToBase64));
				console.log('Converted dropped images to base64');
				
				if (singleImage) {
					console.log('Setting single dropped image');
					const newImage = newImages[0];
					console.log('New dropped image data:', newImage ? 'Present' : 'Not present');
					setUploadedImages([newImage]);
					if (onImageUpload) {
						console.log('Calling onImageUpload with new dropped image');
						onImageUpload(newImage);
					}
				} else {
					console.log('Adding dropped images to existing');
					setUploadedImages((prev) => {
						const updatedImages = [...prev, ...newImages];
						if (onImageUpload) {
							onImageUpload(updatedImages[0]);
						}
						return updatedImages;
					});
				}
			} catch (error) {
				console.error('Error in handleDrop:', error);
				setUploadedImages([]);
				if (onImageUpload) {
					onImageUpload(null);
				}
				if (error instanceof Error) {
					throw error;
				} else {
					throw new Error('Failed to process image');
				}
			}
		}
	};

	return (
		<div className='w-full'>
			{uploadedImages.length === 0 ? (
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
			) : (
				<div className='relative w-full'>
					<img
						src={uploadedImages[0] || '/placeholder.svg'}
						alt='Uploaded clothing'
						className='w-full h-[300px] rounded-lg object-contain'
					/>
					<button
						className='absolute right-2 top-2 rounded-full bg-black/70 p-2 transition-opacity hover:bg-black/90'
						onClick={() => removeImage(0)}
					>
						<X className='h-5 w-5 text-white' />
					</button>
				</div>
			)}
		</div>
	);
}
