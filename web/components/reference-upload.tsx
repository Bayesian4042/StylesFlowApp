'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useState } from 'react';

export default function ReferenceUpload() {
	const [isDragging, setIsDragging] = useState(false);

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
		// Handle file drop logic here
	};

	return (
		<div className='border-b border-gray-800 p-4'>
			<div className='mb-4 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Upload className='h-5 w-5 text-[#4caf50]' />
					<h2 className='text-sm font-medium'>Upload Cloth Image</h2>
				</div>
			</div>

			<div className='mb-2 text-xs text-gray-400'>
				Higher Face Reference means more reference to the face of the subject
			</div>

			<div
				className={`border border-dashed ${isDragging ? 'border-[#4caf50]' : 'border-gray-700'} rounded-lg bg-[#1a1a1f] p-4 text-center`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<div className='flex flex-col items-center gap-2'>
					<Upload className='h-5 w-5 text-[#4caf50]' />
					<div className='text-sm'>
						<span className='text-[#4caf50]'>Click / Drop / Paste</span>
					</div>
					<div className='text-xs'>
						<span>Select from </span>
						<a href='#' className='text-[#4caf50]'>
							History
						</a>
					</div>
					<div className='text-xs text-gray-500'>Support JPG/PNG Files</div>
				</div>
			</div>
		</div>
	);
}
