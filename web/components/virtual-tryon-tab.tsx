'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ReferenceUpload from '@/components/reference-upload';
import ImagePreview from '@/components/image-preview';
import { ApiClient } from '@/lib/api-client';

interface VirtualTryOnResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    images: string[];
    status: string;
    created_at: number;
    updated_at: number;
    logs: string[];
  };
}

interface VirtualTryOnTabProps {
  onTabChange: (tab: string) => void;
  generatedImage: string | null;
}

export default function VirtualTryOnTab({ onTabChange, generatedImage }: VirtualTryOnTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [humanImage, setHumanImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (overlayImage) {
      console.log('Overlay image received:', overlayImage.substring(0, 100) + '...');
      // No need to validate the proxied URL format as it's handled by the ImagePreview component
      console.log('Overlay image set successfully');
    }
  }, [overlayImage]);

  // Monitor generated image changes
  useEffect(() => {
    if (generatedImage) {
      console.log('Generated image updated:', generatedImage.substring(0, 100) + '...');
    }
  }, [generatedImage]);

  const handleTryOn = async () => {
    if (!generatedImage || !garmentImage) {
      setError('Both model and garment images are required');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await ApiClient.post<VirtualTryOnResponse>('/api/image-generation/virtual-try-on', {
        human_image_url: generatedImage,
        garment_image_url: garmentImage
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log('API Response:', result.data);
      
      if (result.data?.code === 0 && result.data?.data?.images?.[0]) {
        const imageUrl = result.data.data.images[0];
        console.log('API Response Data:', result.data);
        console.log('Image URL from API:', imageUrl);
        
        console.log('Setting overlay image URL:', imageUrl);
        setOverlayImage(imageUrl);
      } else {
        throw new Error('No valid overlay image URL was generated');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate overlay');
      setOverlayImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-1'>
      {/* Controls Panel */}
      <div className='flex w-[370px] min-w-[370px] flex-col border-r border-border transition-all duration-300 md:group-data-[collapsible=icon]:w-[48px] md:group-data-[collapsible=icon]:min-w-[48px]'>
        {/* Content Section */}
        <div className='flex-1 overflow-y-auto transition-opacity duration-300 md:group-data-[collapsible=icon]:opacity-0'>
          <ReferenceUpload 
            onImagesChange={(human, garment) => {
              setHumanImage(human);
              setGarmentImage(garment);
            }}
            onTabChange={onTabChange}
            generatedImage={generatedImage}
          />
          {error && (
            <p className="text-sm text-destructive p-4 border-t border-border">{error}</p>
          )}
        </div>

        {/* Overlay Button Section */}
        <div className="p-4 border-t border-border transition-opacity duration-300 md:group-data-[collapsible=icon]:opacity-0">
          <div className="space-y-2">
            <Button 
              className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleTryOn}
              disabled={isLoading || !generatedImage || !garmentImage}
            >
              {isLoading ? "Processing..." : "Overlay Garment"}
            </Button>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className='flex-1 grid grid-cols-2 gap-4 p-4'>
        {/* Try-on Preview */}
        <div className='h-full w-full'>
          <div className='mb-2 text-sm font-medium text-muted-foreground'>Try-on Preview</div>
          <ImagePreview imageUrl={overlayImage} previewType="cloth-overlay" />
        </div>

        {/* Model Preview */}
        <div className='h-full w-full'>
          <div className='mb-2 text-sm font-medium text-muted-foreground'>Model Preview</div>
          <ImagePreview imageUrl={generatedImage} previewType="ai-model" />
        </div>
      </div>
    </div>
  );
}
