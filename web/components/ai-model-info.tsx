import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function AIModelInfo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>AI Generation Model</CardTitle>
				<CardDescription>Learn how our AI virtual try-on technology works</CardDescription>
			</CardHeader>
			<CardContent>
				<Accordion type='single' collapsible className='w-full'>
					<AccordionItem value='item-1'>
						<AccordionTrigger>How does virtual try-on work?</AccordionTrigger>
						<AccordionContent>
							Our virtual try-on technology uses advanced AI to map clothing items onto your body or a model. It
							analyzes the clothing's structure and texture, then realistically renders it as if you were actually
							wearing it.
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value='item-2'>
						<AccordionTrigger>What AI models are used?</AccordionTrigger>
						<AccordionContent>
							We use a combination of computer vision models and generative adversarial networks (GANs). The system
							includes segmentation models to identify body parts, pose estimation to understand positioning, and
							image-to-image translation to create the final result.
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value='item-3'>
						<AccordionTrigger>Image quality requirements</AccordionTrigger>
						<AccordionContent>
							For best results, upload high-resolution images of clothing items against a clean background. The AI works
							best with front-facing, well-lit photos where the entire garment is visible.
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value='item-4'>
						<AccordionTrigger>Privacy and data usage</AccordionTrigger>
						<AccordionContent>
							Your uploaded images are processed securely and only used for the virtual try-on feature. We don't store
							your images longer than necessary to provide the service, and they're never used to train our AI models
							without explicit consent.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	);
}
