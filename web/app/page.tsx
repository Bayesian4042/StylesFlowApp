'use client';

import { useState, useEffect, useCallback } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import AIModelTab from '@/components/ai-model-tab';
import ImagePreview from '@/components/image-preview';
import { ApiClient } from '@/lib/api-client';

interface GenerateImageResponse {
  code: number;
  message: string;
  data: {
    images: string[];
  };
}

interface VirtualTryOnResponse {
  code: number;
  message: string;
  data: {
    task_id: string;
    images: string[];
    status: string;
    created_at: number;
    updated_at: number;
    logs: string[];
  };
}

export default function AIVirtualTryOn() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [gender, setGender] = useState('female');
  const [age, setAge] = useState('youth');
  const [skinTone, setSkinTone] = useState('light');
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('leffa');

  const handleGarmentImageChange = useCallback((image: string | null) => {
    console.log('handleGarmentImageChange called with:', image ? 'Image present' : 'No image');
    if (image && image.startsWith('data:image/')) {
      console.log('Setting valid garment image');
      setGarmentImage(image);
      setError(null);
    } else {
      console.log('Clearing garment image');
      setGarmentImage(null);
    }
  }, []);

  const handleGenerateClick = async () => {
    console.log('Generate clicked, garmentImage:', garmentImage ? 'Present' : 'Not present');
    
    if (!prompt.trim()) {
      setError('Please enter a prompt before generating');
      return;
    }

    if (!garmentImage) {
      setError('Please upload a garment image');
      return;
    }

    if (isGenerating) {
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // Combine model settings with the prompt
      const fullPrompt = `${prompt.trim()}, ${gender}, ${age} age, ${skinTone} skin tone`;

      const result = await ApiClient.post<GenerateImageResponse>('/api/image-generation/generate-image', {
        prompt: fullPrompt,
        provider: 'replicate',
        model: 'flux-dev',
        guidance: 3.5,
        garment_image_url: garmentImage,
        settings: {
          gender,
          age,
          skinTone
        }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      const imageUrl = result.data?.data?.images?.[0];
      if (imageUrl) {
        setGeneratedImage(imageUrl);
      } else {
        throw new Error('No image was generated');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className='relative flex h-screen w-full bg-background'>
      <div className='absolute left-4 top-4 z-50 md:hidden'>
        <SidebarTrigger />
      </div>

      {/* Desktop Layout */}
      <div className='hidden md:flex w-full h-full'>
        {/* Controls Panel */}
        <div className='w-[400px] min-w-[400px] flex flex-col border-r border-border'>
          <div className='flex-1 overflow-y-auto'>
            <AIModelTab 
              prompt={prompt}
              onPromptChange={setPrompt}
              error={error}
              gender={gender}
              age={age}
              skinTone={skinTone}
              onGenderChange={setGender}
              onAgeChange={setAge}
              onSkinToneChange={setSkinTone}
              onGarmentImageChange={handleGarmentImageChange}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
          
          {/* Button Section */}
          <div className="p-4 border-t border-border">
            <div className="space-y-2">
              <Button 
                className="w-full"
                variant="default"
                onClick={handleGenerateClick}
                disabled={isGenerating || !prompt.trim() || !garmentImage}
              >
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className='flex-1 flex flex-col gap-6 p-6 overflow-y-auto'>
          {/* AI Model Preview */}
          <div className='w-full md:w-[800px] h-[600px]'>
            <div className='mb-2 text-sm font-medium text-muted-foreground'>AI Model Preview</div>
            <div className='h-[calc(100%-28px)]'>
              <ImagePreview 
                imageUrl={generatedImage} 
                previewType="ai-model"
                onOverlayClick={async () => {
                  if (!generatedImage || !garmentImage) {
                    setError('Both model and garment images are required');
                    return;
                  }

                  setError(null);
                  setIsGenerating(true);

                  try {
                    const result = await ApiClient.post<VirtualTryOnResponse>('/api/image-generation/virtual-try-on', {
                      human_image_url: generatedImage,
                      garment_image_url: garmentImage,
                      model: selectedModel
                    });

                    if (result.error) {
                      throw new Error(result.error.message);
                    }

                    if (result.data?.code === 0 && result.data?.data?.images?.length > 0) {
                      // For cat-vton and other models, use first image from the list
                      setOverlayImage(result.data.data.images[0]);
                    } else {
                      throw new Error('No valid overlay image URL was generated');
                    }
                  } catch (error) {
                    setError(error instanceof Error ? error.message : 'Failed to generate overlay');
                    setOverlayImage(null);
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                isGenerating={isGenerating}
                garmentImage={garmentImage}
                showOverlayButton={true}
              />
            </div>
          </div>
          
          {/* Cloth Overlay Preview */}
          <div className='w-full md:w-[800px] h-[600px]'>
            <div className='mb-2 text-sm font-medium text-muted-foreground'>Cloth Overlay Preview</div>
            <div className='h-[calc(100%-28px)]'>
              <ImagePreview imageUrl={overlayImage} previewType="cloth-overlay" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className='flex flex-col w-full h-screen md:hidden overflow-x-hidden'>
        {/* Single scrollable container */}
        <div className='flex-1 overflow-y-auto overflow-x-hidden bg-background'>
          <div className='p-4 pt-14 border-b border-border'>
            <AIModelTab 
              prompt={prompt}
              onPromptChange={setPrompt}
              error={error}
              gender={gender}
              age={age}
              skinTone={skinTone}
              onGenderChange={setGender}
              onAgeChange={setAge}
              onSkinToneChange={setSkinTone}
              onGarmentImageChange={handleGarmentImageChange}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
          
          {/* Button Section */}
          <div className="p-4 border-b border-border">
            <div className="space-y-3">
              <Button 
                className="w-full"
                variant="default"
                onClick={handleGenerateClick}
                disabled={isGenerating || !prompt.trim() || !garmentImage}
              >
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>
          </div>
          
          {/* Preview Area */}
          <div className='p-4 pb-20 max-w-full'>
            {/* AI Model Preview */}
            <div className='mb-8'>
              <div className='mb-2 text-sm font-medium text-muted-foreground'>AI Model Preview</div>
              <div className='w-full max-w-full h-[600px]'>
                <ImagePreview 
                  imageUrl={generatedImage} 
                  previewType="ai-model"
                  onOverlayClick={async () => {
                    if (!generatedImage || !garmentImage) {
                      setError('Both model and garment images are required');
                      return;
                    }

                    setError(null);
                    setIsGenerating(true);

                    try {
                    const result = await ApiClient.post<VirtualTryOnResponse>('/api/image-generation/virtual-try-on', {
                      human_image_url: generatedImage,
                      garment_image_url: garmentImage,
                      model: selectedModel
                    });

                      if (result.error) {
                        throw new Error(result.error.message);
                      }

                      if (result.data?.code === 0 && result.data?.data?.images?.length > 0) {
                        // For cat-vton and other models, use first image from the list
                        setOverlayImage(result.data.data.images[0]);
                      } else {
                        throw new Error('No valid overlay image URL was generated');
                      }
                    } catch (error) {
                      setError(error instanceof Error ? error.message : 'Failed to generate overlay');
                      setOverlayImage(null);
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  isGenerating={isGenerating}
                  garmentImage={garmentImage}
                  showOverlayButton={true}
                />
              </div>
            </div>
            
            {/* Cloth Overlay Preview */}
            <div>
              <div className='mb-2 text-sm font-medium text-muted-foreground'>Cloth Overlay Preview</div>
              <div className='w-full max-w-full h-[600px]'>
                <ImagePreview imageUrl={overlayImage} previewType="cloth-overlay" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
