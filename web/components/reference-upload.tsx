'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Plus } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ReferenceUploadProps {
	onImagesChange: (humanImage: string | null, garmentImage: string | null) => void;
	onTabChange: (tab: string) => void;
	generatedImage: string | null;
}

const DEFAULT_GARMENTS = [
	{ id: 'skirt', src: '/images/garments/skirt.jpg', name: 'Black Skirt' },
	{ id: 'hoodie', src: '/images/garments/hoodie.jpg', name: 'Grey Hoodie' },
	{ id: 'sweater', src: '/images/garments/sweater.jpg', name: 'Striped Sweater' },
	{ id: 'jacket', src: '/images/garments/jacket.jpg', name: 'Mint Jacket' },
	{ id: 'blouse', src: '/images/garments/blouse.jpg', name: 'White Blouse' },
];

export default function ReferenceUpload({ onImagesChange, onTabChange, generatedImage }: ReferenceUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [humanImage, setHumanImage] = useState<string | null>(null);
	const [garmentImage, setGarmentImage] = useState<string | null>(null);
	const [activeUpload, setActiveUpload] = useState<'human' | 'garment' | null>(null);
	const [garmentTab, setGarmentTab] = useState<'default' | 'upload'>('upload');

	const handleFileUpload = useCallback((file: File, type: 'human' | 'garment') => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const imageUrl = e.target?.result as string;
			if (type === 'human') {
				setHumanImage(imageUrl);
			} else {
				setGarmentImage(imageUrl);
			}
			onImagesChange(
				type === 'human' ? imageUrl : humanImage,
				type === 'garment' ? imageUrl : garmentImage
			);
		};
		reader.readAsDataURL(file);
	}, [humanImage, garmentImage, onImagesChange]);

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
		
		if (!activeUpload) return;
		
		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith('image/')) {
			handleFileUpload(file, activeUpload);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'human' | 'garment') => {
		const file = e.target.files?.[0];
		if (file && file.type.startsWith('image/')) {
			handleFileUpload(file, type);
		}
	};

	const handleRemoveImage = (type: 'human' | 'garment') => {
		if (type === 'human') {
			setHumanImage(null);
		} else {
			setGarmentImage(null);
		}
		onImagesChange(
			type === 'human' ? null : humanImage,
			type === 'garment' ? null : garmentImage
		);
	};

	const handleSelectGarment = (imageUrl: string) => {
		setGarmentImage(imageUrl);
		onImagesChange(humanImage, imageUrl);
	};

	const renderImageUpload = (type: 'human' | 'garment') => (
		<div>
			<div className='mb-4 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Upload className='h-5 w-5 text-primary' />
					<h2 className='text-sm font-medium'>Upload {type === 'human' ? 'Human' : 'Garment'} Image</h2>
				</div>
			</div>

			{(type === 'human' ? humanImage : garmentImage) ? (
				<div className='relative rounded-lg overflow-hidden mb-4'>
					<img 
						src={type === 'human' ? humanImage! : garmentImage!} 
						alt={type === 'human' ? 'Human' : 'Garment'} 
						className='w-full h-48 object-cover' 
					/>
					<button
						onClick={() => handleRemoveImage(type)}
						className='absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70'
					>
						<X className='h-4 w-4 text-white' />
					</button>
				</div>
			) : (
				<div
					className={`border border-dashed ${isDragging && activeUpload === type ? 'border-primary' : 'border-gray-700'} rounded-lg bg-card p-4 text-center cursor-pointer`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={() => setActiveUpload(type)}
				>
					<input
						type="file"
						accept="image/*"
						className="hidden"
						onChange={(e) => handleFileSelect(e, type)}
						id={`${type}-upload`}
					/>
					<label htmlFor={`${type}-upload`} className='cursor-pointer'>
						<div className='flex flex-col items-center gap-2'>
							<Upload className='h-5 w-5 text-primary' />
							<div className='text-sm'>
								<span className='text-primary'>Click / Drop / Paste</span>
							</div>
							<div className='text-xs text-gray-500'>Support JPG/PNG Files</div>
						</div>
					</label>
				</div>
			)}
		</div>
	);

	return (
		<div className='p-4 space-y-4'>
			{/* Human Image Section */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
						<span className="text-sm">1</span>
					</div>
					<h2 className="text-sm font-medium">Select a Model</h2>
				</div>
				<div className="aspect-[3/4] bg-card rounded-lg overflow-hidden">
					{generatedImage ? (
						<div className="relative h-full w-full group">
							<img 
								src={generatedImage} 
								alt="Generated model" 
								className="h-full w-full object-cover"
							/>
							<div 
								className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
								onClick={() => onTabChange('ai-model')}
							>
								<Button variant="outline" className="text-white border-white hover:text-white">
									Generate New
								</Button>
							</div>
						</div>
					) : (
						<div 
							className="h-full w-full flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
							onClick={() => onTabChange('ai-model')}
						>
							<Button
								variant="outline"
								className='flex flex-col items-center gap-4 p-8'
							>
								<Plus className='h-8 w-8' />
								<span>Generate</span>
							</Button>
						</div>
					)}
				</div>
				<div className="text-xs text-gray-400">
					Images up to 50MB, with short side &gt;= 512px, long side &lt;= 4096px and formats JPG/PNG.
				</div>
			</div>

			{/* Garment Image Section */}
			<div className="mt-8">
				<div className="flex items-center gap-2 mb-4">
					<div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
						<span className="text-sm">2</span>
					</div>
					<h2 className="text-sm font-medium">Upload a Garment Image</h2>
				</div>
				<Tabs value={garmentTab} onValueChange={(value) => setGarmentTab(value as 'default' | 'upload')} className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="default">Default</TabsTrigger>
						<TabsTrigger value="upload">Upload</TabsTrigger>
					</TabsList>
					<TabsContent value="default">
						<div className="p-4 space-y-4">
							<div>
								<h3 className="text-sm font-medium mb-1">Default Garments</h3>
								<p className="text-sm text-gray-400 mb-4">Select from our collection of pre-defined garments</p>
							</div>
							<div className="grid grid-cols-3 gap-4">
								{DEFAULT_GARMENTS.map((garment) => (
									<div 
										key={garment.id}
										className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${garmentImage === garment.src ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary'}`}
										onClick={() => handleSelectGarment(garment.src)}
									>
										<img src={garment.src} alt={garment.name} className="w-full h-full object-cover" />
										<div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 translate-y-full transition-transform group-hover:translate-y-0">
											{garment.name}
										</div>
									</div>
								))}
							</div>
						</div>
					</TabsContent>
					<TabsContent value="upload">
						<div>
							{renderImageUpload('garment')}
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
