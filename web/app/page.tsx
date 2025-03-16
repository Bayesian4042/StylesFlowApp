'use client';

import { useState } from 'react';
import { NavigationTabs } from '@/components/navigation-tabs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import AIModelTab from '@/components/ai-model-tab';
import ReferenceUpload from '@/components/reference-upload';
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
  const [activeTab, setActiveTab] = useState('ai-model');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [gender, setGender] = useState('female');
  const [age, setAge] = useState('youth');
  const [skinTone, setSkinTone] = useState('light');
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);

  const handleGenerateClick = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt before generating');
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

      {/* Controls Panel */}
      <div className='flex w-[370px] min-w-[370px] flex-col border-r border-border transition-all duration-300 md:group-data-[collapsible=icon]:w-[48px] md:group-data-[collapsible=icon]:min-w-[48px] z-50'>
        {/* Navigation Tabs */}
        <div className='border-b border-border p-4 transition-opacity duration-300 md:group-data-[collapsible=icon]:opacity-0'>
          <NavigationTabs 
            onTabChange={setActiveTab}
            activeTab={activeTab}
          />
        </div>

        {/* Content Section */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          <div className='flex-1 overflow-y-auto transition-opacity duration-300 md:group-data-[collapsible=icon]:opacity-0'>
            {activeTab === 'ai-model' ? (
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
              />
            ) : (
              <ReferenceUpload 
                onImagesChange={(human: string | null, garment: string | null) => {
                  setGarmentImage(garment);
                }}
                onTabChange={setActiveTab}
                generatedImage={generatedImage}
              />
            )}
          </div>
          
          {/* Button Section */}
          <div className="p-4 border-t border-border transition-opacity duration-300 md:group-data-[collapsible=icon]:opacity-0 relative z-50">
            <div className="space-y-2">
              {activeTab === 'ai-model' ? (
                <Button 
                  className="w-full relative z-50"
                  variant="default"
                  onClick={handleGenerateClick}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              ) : (
                <Button 
                  className="w-full relative z-50"
                  variant="default"
                  onClick={async () => {
                    if (!generatedImage || !garmentImage) {
                      setError('Both model and garment images are required');
                      return;
                    }

                    setError(null);
                    setIsGenerating(true);

                    try {
                      const result = await ApiClient.post<VirtualTryOnResponse>('/api/image-generation/virtual-try-on', {
                        human_image_url: generatedImage,
                        garment_image_url: garmentImage
                      });

                      if (result.error) {
                        throw new Error(result.error.message);
                      }

                      if (result.data?.code === 0 && result.data?.data?.images?.[0]) {
                        const imageUrl = result.data.data.images[0];
                        console.log('Setting overlay image URL:', imageUrl);
                        setOverlayImage(imageUrl);
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
                  disabled={isGenerating || !generatedImage || !garmentImage}
                >
                  {isGenerating ? "Processing..." : "Overlay Garment"}
                </Button>
              )}
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className='flex-1 z-0 overflow-hidden transition-all duration-300'>
        {activeTab === 'ai-model' ? (
          <div className='grid grid-cols-2 gap-4 p-4 h-full w-full max-w-[1600px] mx-auto transition-all duration-300 md:group-data-[collapsible=icon]:max-w-[calc(100vw-64px)]'>
            {/* AI Model Preview */}
            <div className='h-full w-full'>
              <div className='mb-2 text-sm font-medium text-muted-foreground'>AI Model Preview</div>
              <ImagePreview imageUrl={generatedImage} previewType="ai-model" />
            </div>
            
            {/* Empty Preview */}
            <div className='h-full w-full'>
              <div className='mb-2 text-sm font-medium text-muted-foreground'>Cloth Overlay Preview</div>
              <ImagePreview imageUrl={null} previewType="cloth-overlay" />
            </div>
          </div>
        ) : (
          <div className='p-4 h-full w-full overflow-hidden transition-all duration-300'>
            <div className='grid grid-cols-2 gap-4 h-full w-full max-w-[1600px] mx-auto transition-all duration-300 md:group-data-[collapsible=icon]:max-w-[calc(100vw-64px)]'>
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
        )}
      </div>
    </div>
  );
}
