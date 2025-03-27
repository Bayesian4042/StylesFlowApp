'use client';

import { User, MountainSnow, Sparkles } from 'lucide-react';

interface PromptInputProps {
	value: string;
	onChange: (value: string) => void;
	type: 'pose' | 'background';
	modelSettings?: string;
	showPreview?: boolean;
}

export default function PromptInput({ value, onChange, type, modelSettings, showPreview = false }: PromptInputProps) {
	return (
		<div className='border-b border-border p-3 relative z-10'>
			<div className='grid grid-cols-1 gap-3'>
				{/* Pose Prompt Section - Only show if type is 'pose' */}
				{type === 'pose' && (
					<div className='rounded-lg bg-card p-2 relative overflow-hidden'>
						<div className='flex items-center gap-2 mb-1.5'>
							<User className="h-4 w-4 text-primary" />
							<h3 className='text-sm font-medium'>Model Pose</h3>
						</div>
						<textarea
							value={value}
							onChange={(e) => onChange(e.target.value)}
							className='min-h-[2.5rem] w-full border-none bg-transparent text-foreground focus:outline-none relative z-10 text-sm px-0 resize-none overflow-hidden'
							placeholder="Describe model's pose and expression..."
							spellCheck={false}
							rows={1}
							style={{ height: 'auto' }}
							onInput={(e) => {
								// Auto-adjust height
								const target = e.target as HTMLTextAreaElement;
								target.style.height = 'auto';
								target.style.height = `${target.scrollHeight}px`;
							}}
						/>
						<div className='text-xs text-muted-foreground mt-1'>
							<span className="italic">E.g., standing straight, looking at camera</span>
						</div>
					</div>
				)}

				{/* Background Prompt Section - Only show if type is 'background' */}
				{type === 'background' && (
					<div className='rounded-lg bg-card p-2 relative overflow-hidden'>
						<div className='flex items-center gap-2 mb-1.5'>
							<MountainSnow className="h-4 w-4 text-primary" />
							<h3 className='text-sm font-medium'>Background</h3>
						</div>
						<textarea
							value={value}
							onChange={(e) => onChange(e.target.value)}
							className='min-h-[2.5rem] w-full border-none bg-transparent text-foreground focus:outline-none relative z-10 text-sm px-0 resize-none overflow-hidden'
							placeholder='Describe scene and lighting...'
							spellCheck={false}
							rows={1}
							style={{ height: 'auto' }}
							onInput={(e) => {
								// Auto-adjust height
								const target = e.target as HTMLTextAreaElement;
								target.style.height = 'auto';
								target.style.height = `${target.scrollHeight}px`;
							}}
						/>
						<div className='text-xs text-muted-foreground mt-1'>
							<span className="italic">E.g., modern city street, sunny day</span>
						</div>
					</div>
				)}
			</div>

			{/* Preview Section - Only show if showPreview is true */}
			{showPreview && (
				<div className='mt-3 rounded-lg bg-muted/50 p-2 relative border border-dashed border-muted-foreground/25'>
					<div className='flex items-center gap-1.5 mb-1'>
						<Sparkles className="h-3.5 w-3.5 text-primary" />
						<h3 className='text-xs font-medium'>Current {type === 'pose' ? 'Pose' : 'Background'}</h3>
					</div>
					<div className='text-xs text-muted-foreground bg-background/50 rounded p-1.5'>
						{value && <span>{value}</span>}
					</div>
				</div>
			)}
		</div>
	);
}
