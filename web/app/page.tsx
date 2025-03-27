'use client';

import { useState, useEffect, useCallback } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import AIModelTab from '@/components/ai-model-tab';
import CampaignTab from '@/components/campaign-tab';
import ImagePreview from '@/components/image-preview';
import { ApiClient } from '@/lib/api-client';
import { NavigationTabs } from '@/components/navigation-tabs';

interface GenerateImageResponse {
  code: number;
  message: string;
  data: {
    images: string[];
  };
}

interface CampaignGenerationResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    campaign_content: string;
    status: string;
    created_at: number;
    updated_at: number;
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
  const [campaignPrompt, setCampaignPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState('ai-model');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [garmentType, setGarmentType] = useState('overall');
  const [campaignContent, setCampaignContent] = useState<string>('');

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

  const handleGenerateClick = async (isCampaign = false) => {
    console.log('Generate clicked:', {
      isCampaign,
      garmentImage: garmentImage ? 'Present' : 'Not present',
      selectedModel,
      prompt: prompt.trim()
    });
    
    if (!prompt.trim()) {
      setError('Please enter a prompt before generating');
      return;
    }

    if (!garmentImage) {
      setError('Please upload a garment image');
      return;
    }

    if (isCampaign && (!campaignPrompt || selectedPlatforms.length === 0)) {
      setError('Please select platforms and enter campaign type');
      return;
    }

    if (isGenerating) {
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // Build the complete prompt
      const modelConfig = `${gender}, ${age} age, ${skinTone} skin tone`;
      let fullPrompt = `${prompt.trim()}, ${modelConfig}`;

      if (isCampaign) {
        const platformsText = selectedPlatforms.join(' and ');
        fullPrompt = `${fullPrompt}, for ${campaignPrompt} campaign targeting ${platformsText} platforms`;
      }

      if (isCampaign) {
        console.log('Starting campaign generation:', {
          prompt: campaignPrompt,
          garmentImage: garmentImage ? 'Present' : 'Not present'
        });
        
        // Handle campaign generation
        const result = await ApiClient.post<CampaignGenerationResponse>('/api/image-generation/generate-campaign', {
          prompt: campaignPrompt,
          garment_image_url: garmentImage
        });

        console.log('Campaign generation response:', result);

        if (!result.data) {
          console.error('No data in response');
          throw new Error('No response received from server');
        }

        if (result.data.code !== 0) {
          console.error('Error code in response:', result.data.code);
          throw new Error(result.data.message || 'Failed to generate campaign');
        }

        const campaignContent = result.data.data?.campaign_content;
        console.log('Extracted campaign content:', campaignContent);
        
        if (!campaignContent) {
          console.error('No campaign content in response data');
          throw new Error('No campaign content received');
        }

        // Clear any previous error
        setError(null);
        
        // Set the campaign content
        console.log('Setting campaign content:', campaignContent);
        setCampaignContent(campaignContent);
        return;
      }

      // Handle image generation
      // Map model names to providers
      let provider;
      switch (selectedModel) {
        case 'cat-vton':
          provider = 'replicate';
          break;
        case 'leffa':
          provider = 'replicate';
          break;
        case 'kling':
          provider = 'replicate';
          break;
        default:
          provider = 'replicate';
      }
      console.log(`Selected model: ${selectedModel}, Using provider: ${provider}`);

      console.log('Making API request with:', {
        prompt: fullPrompt,
        provider,
        model: provider === 'replicate' ? 'flux-dev' : undefined,
        guidance: provider === 'replicate' ? 3.5 : undefined,
        width: provider === 'kling' ? 1024 : undefined,
        height: provider === 'kling' ? 1024 : undefined,
      });

      const result = await ApiClient.post<GenerateImageResponse>('/api/image-generation/generate-image', {
        prompt: fullPrompt,
        provider: provider,
        model: provider === 'replicate' ? 'flux-dev' : undefined,
        guidance: provider === 'replicate' ? 3.5 : undefined,
        width: provider === 'kling' ? 1024 : undefined,
        height: provider === 'kling' ? 1024 : undefined,
        garment_image_url: garmentImage,
        settings: {
          gender,
          age,
          skinTone
        }
      });

      console.log('Image generation response:', result);

      if (result.error) {
        console.error('API error:', result.error);
        throw new Error(result.error.message);
      }

      if (!result.data) {
        console.error('No data in response');
        throw new Error('No response received from server');
      }

      if (result.data.code !== 0) {
        console.error('Error code in response:', result.data.code);
        throw new Error(result.data.message || 'Failed to generate image');
      }

      const imageUrl = result.data.data?.images?.[0];
      if (imageUrl) {
        console.log('Setting generated image URL:', imageUrl);
        setGeneratedImage(imageUrl);
      } else {
        console.error('No image URL in response');
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
          <div className='flex-1 overflow-y-auto flex flex-col'>
            <div className="p-4 border-b border-border">
              <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
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
                onGarmentImageChange={handleGarmentImageChange}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                garmentType={garmentType}
                onGarmentTypeChange={setGarmentType}
              />
            ) : (
              <CampaignTab 
                onCampaignPromptChange={setCampaignPrompt}
                onPlatformsChange={setSelectedPlatforms}
                garmentImage={garmentImage}
                aiModelPrompt={prompt}
                modelSettings={`${gender}, ${age}, ${skinTone} skin tone`}
                onGenerateClick={() => handleGenerateClick(true)}
                isGenerating={isGenerating}
                campaignContent={campaignContent}
              />
            )}
          </div>
          
          {/* Button Section */}
          {activeTab === 'ai-model' && (
            <div className="p-4 border-t border-border">
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  variant="default"
                  onClick={() => handleGenerateClick(false)}
                  disabled={isGenerating || !prompt.trim() || !garmentImage}
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
              </div>
            </div>
          )}
        </div>

          {/* Preview Area */}
        <div className='flex-1 flex flex-col p-6 overflow-y-auto'>
          {/* Model Preview */}
          <div className='w-full md:w-[1000px] h-[800px]'>
            <div className='mb-2 text-sm font-medium text-muted-foreground'>Model Preview</div>
            <div className='h-[calc(100%-28px)]'>
              <ImagePreview 
                imageUrl={overlayImage || generatedImage}
                previewType="ai-model"
                isOverlaid={!!overlayImage}
                onOverlayClick={async () => {
                  if (!generatedImage || !garmentImage) {
                    setError('Both model and garment images are required');
                    return;
                  }

                  setError(null);
                  setIsGenerating(true);

                  try {
                    // Map model names to actual model values for virtual try-on
                    let tryOnModel;
                    switch (selectedModel) {
                      case 'cat-vton':
                        tryOnModel = 'cat-vton';
                        break;
                      case 'leffa':
                        tryOnModel = 'leffa';
                        break;
                      case 'kling':
                        tryOnModel = 'kling';
                        break;
                      default:
                        tryOnModel = 'leffa';
                    }

                    console.log('Virtual try-on request:', {
                      human_image_url: generatedImage,
                      garment_image_url: garmentImage,
                      model: tryOnModel,
                      garment_type: garmentType
                    });

                    const result = await ApiClient.post<VirtualTryOnResponse>('/api/image-generation/virtual-try-on', {
                      human_image_url: generatedImage,
                      garment_image_url: garmentImage,
                      model: tryOnModel,
                      garment_type: garmentType
                    });

                    console.log('Virtual try-on response:', result);

                    if (result.error) {
                      throw new Error(result.error.message);
                    }

                    if (!result.data) {
                      throw new Error('No response received from server');
                    }

                    if (result.data.code !== 0) {
                      throw new Error(result.data.message || 'Failed to generate try-on image');
                    }

                    if (result.data.data?.images?.length > 0) {
                      const imageUrl = result.data.data.images[0];
                      console.log('Setting overlay image URL:', imageUrl);
                      setOverlayImage(imageUrl);
                    } else {
                      console.error('No images in response:', result.data);
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
        </div>
      </div>

      {/* Mobile Layout */}
      <div className='flex flex-col w-full h-screen md:hidden overflow-x-hidden'>
        {/* Single scrollable container */}
        <div className='flex-1 overflow-y-auto overflow-x-hidden bg-background'>
          <div className='p-4 pt-14 border-b border-border flex flex-col'>
            <div className="mb-4">
              <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
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
                onGarmentImageChange={handleGarmentImageChange}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                garmentType={garmentType}
                onGarmentTypeChange={setGarmentType}
              />
            ) : (
              <CampaignTab 
                onCampaignPromptChange={setCampaignPrompt}
                onPlatformsChange={setSelectedPlatforms}
                garmentImage={garmentImage}
                aiModelPrompt={prompt}
                modelSettings={`${gender}, ${age}, ${skinTone} skin tone`}
                onGenerateClick={() => handleGenerateClick(true)}
                isGenerating={isGenerating}
                campaignContent={campaignContent}
              />
            )}
          </div>
          
          {/* Button Section */}
          {activeTab === 'ai-model' && (
            <div className="p-4 border-b border-border">
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  variant="default"
                  onClick={() => handleGenerateClick(false)}
                  disabled={isGenerating || !prompt.trim() || !garmentImage}
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Preview Area */}
          <div className='p-4 pb-20 max-w-full'>
            {/* Model Preview */}
            <div>
              <div className='mb-2 text-sm font-medium text-muted-foreground'>Model Preview</div>
              <div className='w-full max-w-full h-[800px]'>
                <ImagePreview 
                  imageUrl={overlayImage || generatedImage}
                  previewType="ai-model"
                  isOverlaid={!!overlayImage}
                  onOverlayClick={async () => {
                    if (!generatedImage || !garmentImage) {
                      setError('Both model and garment images are required');
                      return;
                    }

                    setError(null);
                    setIsGenerating(true);

                    try {
                      // Map model names to actual model values for virtual try-on
                      let tryOnModel;
                      switch (selectedModel) {
                        case 'cat-vton':
                          tryOnModel = 'cat-vton';
                          break;
                        case 'leffa':
                          tryOnModel = 'leffa';
                          break;
                        case 'kling':
                          tryOnModel = 'kling';
                          break;
                        default:
                          tryOnModel = 'leffa';
                      }

                      console.log('Virtual try-on request:', {
                        human_image_url: generatedImage,
                        garment_image_url: garmentImage,
                        model: tryOnModel,
                        garment_type: garmentType
                      });

                      const result = await ApiClient.post<VirtualTryOnResponse>('/api/image-generation/virtual-try-on', {
                        human_image_url: generatedImage,
                        garment_image_url: garmentImage,
                        model: tryOnModel,
                        garment_type: garmentType
                      });

                      console.log('Virtual try-on response:', result);

                      if (result.error) {
                        throw new Error(result.error.message);
                      }

                      if (!result.data) {
                        throw new Error('No response received from server');
                      }

                      if (result.data.code !== 0) {
                        throw new Error(result.data.message || 'Failed to generate try-on image');
                      }

                      if (result.data.data?.images?.length > 0) {
                        const imageUrl = result.data.data.images[0];
                        console.log('Setting overlay image URL:', imageUrl);
                        setOverlayImage(imageUrl);
                      } else {
                        console.error('No images in response:', result.data);
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
          </div>
        </div>
      </div>
    </div>
  );
}
