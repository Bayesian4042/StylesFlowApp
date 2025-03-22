'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface PromptInputProps {
	value: string;
	onChange: (value: string) => void;
	type: 'pose' | 'background';
	modelSettings?: string;
}

export default function PromptInput({ value, onChange, type, modelSettings }: PromptInputProps) {
	const getPlaceholder = () => {
		switch (type) {
			case 'pose':
				return 'Describe the model pose (e.g., standing with hands on hips, sitting casually)';
			case 'background':
				return 'Describe the background setting (e.g., modern office, nature backdrop)';
			default:
				return '';
		}
	};

	const getIcon = () => {
		if (type === 'pose') {
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="text-primary"
				>
					<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
					<path d="m15 5 4 4" />
				</svg>
			);
		}
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="text-primary"
			>
				<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
				<circle cx="9" cy="9" r="2" />
				<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
			</svg>
		);
	};

	return (
		<div className='border-b border-border p-4 relative z-10'>
			<div className='mb-4 flex items-center gap-2'>
				{getIcon()}
				<h2 className='text-sm font-medium'>{type === 'pose' ? 'Model Pose' : 'Background Setting'}</h2>
			</div>

			<div className='mb-4 rounded-lg bg-card p-4 relative'>
				<textarea
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className='h-24 w-full resize-none border-none bg-transparent text-foreground focus:outline-none relative z-10'
					placeholder={getPlaceholder()}
				/>
				{modelSettings && (
					<div className='mt-2 text-sm text-muted-foreground'>
						Will be appended: {modelSettings}
					</div>
				)}
				<div className='mt-2 text-xs text-muted-foreground'>
					<span>or view </span>
					<a href='#' className='text-primary'>
						Help Center
					</a>
					<span> for a quick start.</span>
				</div>
			</div>

			<div className='flex items-center justify-between'>
				{/* <div className="text-xs text-gray-400">Hints:</div> */}
				{/* <div className="flex gap-2">
          {hints.map((hint, index) => (
            <Button
              key={index}
              variant="outline"
              className="text-xs py-1 h-auto border-border bg-card hover:bg-accent text-foreground"
            >
              {hint}
            </Button>
          ))}
          <Button variant="outline" size="icon" className="h-6 w-6 border-border bg-card hover:bg-accent">
            <RefreshCcw className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div> */}
			</div>
		</div>
	);
}
