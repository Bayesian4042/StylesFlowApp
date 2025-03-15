'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Share2, Undo2, Redo2, ImageIcon } from 'lucide-react';

export default function GeneratedImage() {
	const [hasImage, setHasImage] = useState(false);

	// This would normally come from your actual generation process
	const simulateGeneration = () => {
		setHasImage(true);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center justify-between'>
					<span>Generated Result</span>
					<div className='flex gap-2'>
						<Button variant='outline' size='icon' disabled={!hasImage}>
							<Undo2 className='h-4 w-4' />
						</Button>
						<Button variant='outline' size='icon' disabled={!hasImage}>
							<Redo2 className='h-4 w-4' />
						</Button>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='relative aspect-[3/4] w-full overflow-hidden rounded-md bg-muted'>
					{hasImage ? (
						<img
							src='/placeholder.svg?height=600&width=450'
							alt='Generated outfit'
							className='h-full w-full object-cover'
						/>
					) : (
						<div className='absolute inset-0 flex flex-col items-center justify-center'>
							<ImageIcon className='h-16 w-16 text-muted-foreground opacity-50' />
							<p className='mt-2 text-sm text-muted-foreground'>Your generated image will appear here</p>
							<Button className='mt-4' onClick={simulateGeneration}>
								Generate Sample
							</Button>
						</div>
					)}
				</div>
			</CardContent>
			{hasImage && (
				<CardFooter className='flex justify-between'>
					<Tabs defaultValue='download' className='w-full'>
						<TabsList className='grid w-full grid-cols-2'>
							<TabsTrigger value='download'>Download</TabsTrigger>
							<TabsTrigger value='share'>Share</TabsTrigger>
						</TabsList>
						<TabsContent value='download' className='mt-4'>
							<div className='flex gap-2'>
								<Button className='w-full'>
									<Download className='mr-2 h-4 w-4' />
									Download Image
								</Button>
							</div>
						</TabsContent>
						<TabsContent value='share' className='mt-4'>
							<div className='flex gap-2'>
								<Button variant='outline' className='w-full'>
									<Share2 className='mr-2 h-4 w-4' />
									Share Result
								</Button>
							</div>
						</TabsContent>
					</Tabs>
				</CardFooter>
			)}
		</Card>
	);
}
