'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, MountainSnow, Sparkles } from 'lucide-react';

interface PromptInputProps {
	value: string;
	onChange: (value: string) => void;
	type: 'pose' | 'background';
	modelSettings?: string;
}

export default function PromptInput({ value, onChange, modelSettings }: PromptInputProps) {
	const [posePrompt, setPosePrompt] = useState('');
	const [backgroundPrompt, setBackgroundPrompt] = useState('');

	// Split the incoming value into pose and background, handling the model settings prefix
	useEffect(() => {
		if (value) {
			const parts = value.split(',').map(part => part.trim());
			
			// Find where the actual pose/background parts start
			const startIndex = modelSettings && parts[0].toLowerCase().includes(modelSettings.toLowerCase()) ? 1 : 0;
			
			if (parts.length > startIndex) {
				const pose = parts[startIndex];
				const background = parts.slice(startIndex + 1).join(', ');
				
				if (pose !== posePrompt || background !== backgroundPrompt) {
					setPosePrompt(pose);
					setBackgroundPrompt(background);
				}
			} else {
				setPosePrompt('');
				setBackgroundPrompt('');
			}
		} else {
			setPosePrompt('');
			setBackgroundPrompt('');
		}
	}, [value, modelSettings]);

	// Combine prompts and trigger onChange
	const updateCombinedPrompt = (newPose: string, newBackground: string) => {
		const parts = [];
		
		// Add model settings first if available
		if (modelSettings) {
			parts.push(`A person ${modelSettings.toLowerCase()}`);
		}
		
		// Add pose and background
		if (newPose) parts.push(newPose);
		if (newBackground) parts.push(newBackground);
		
		const combinedPrompt = parts.join(', ').trim();
		onChange(combinedPrompt);
	};

	const handlePoseChange = (newPose: string) => {
		setPosePrompt(newPose);
		updateCombinedPrompt(newPose, backgroundPrompt);
	};

	const handleBackgroundChange = (newBackground: string) => {
		setBackgroundPrompt(newBackground);
		updateCombinedPrompt(posePrompt, newBackground);
	};

	return (
		<div className='border-b border-border p-3 relative z-10'>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
				{/* Pose Prompt Section */}
				<div className='rounded-lg bg-card p-2 relative overflow-hidden'>
					<div className='flex items-center gap-2 mb-1.5'>
						<User className="h-4 w-4 text-primary" />
						<h3 className='text-sm font-medium'>Model Pose</h3>
					</div>
					<input
						type="text"
						value={posePrompt}
						onChange={(e) => handlePoseChange(e.target.value)}
						className='min-h-[2.5rem] w-full border-none bg-transparent text-foreground focus:outline-none relative z-10 text-sm px-0'
						placeholder="Describe model's pose and expression..."
						spellCheck={false}
					/>
					<div className='text-xs text-muted-foreground mt-1'>
						<span className="italic">E.g., standing straight, looking at camera</span>
					</div>
				</div>

				{/* Background Prompt Section */}
				<div className='rounded-lg bg-card p-2 relative overflow-hidden'>
					<div className='flex items-center gap-2 mb-1.5'>
						<MountainSnow className="h-4 w-4 text-primary" />
						<h3 className='text-sm font-medium'>Background</h3>
					</div>
					<input
						type="text"
						value={backgroundPrompt}
						onChange={(e) => handleBackgroundChange(e.target.value)}
						className='min-h-[2.5rem] w-full border-none bg-transparent text-foreground focus:outline-none relative z-10 text-sm px-0'
						placeholder='Describe scene and lighting...'
						spellCheck={false}
					/>
					<div className='text-xs text-muted-foreground mt-1'>
						<span className="italic">E.g., modern city street, sunny day</span>
					</div>
				</div>
			</div>

			{/* Combined Prompt Preview */}
			<div className='mt-3 rounded-lg bg-muted/50 p-2 relative border border-dashed border-muted-foreground/25'>
				<div className='flex items-center justify-between mb-1'>
					<div className='flex items-center gap-1.5'>
						<Sparkles className="h-3.5 w-3.5 text-primary" />
						<h3 className='text-xs font-medium'>Preview</h3>
					</div>
					{modelSettings && (
						<div className='text-xs text-muted-foreground'>
							Including: <span className="text-primary">{modelSettings}</span>
						</div>
					)}
				</div>
				<div className='text-xs text-muted-foreground bg-background/50 rounded p-1.5'>
					{modelSettings && <span className='text-primary'>A person {modelSettings.toLowerCase()}</span>}
					{posePrompt && <span>{modelSettings ? `, ${posePrompt}` : posePrompt}</span>}
					{backgroundPrompt && <span>, {backgroundPrompt}</span>}
				</div>
			</div>
		</div>
	);
}
