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
  const [selectedModel, setSelectedModel] = useState('cat-vton');
  const [campaignPrompt, setCampaignPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState('ai-model');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [garmentType, setGarmentType] = useState('upper');
  const [campaignContent, setCampaignContent] = useState<string>('');

  const handleGarmentImageChange = useCallback((image: string | null) => {
    if (image && image.startsWith('data:image/')) {
      setGarmentImage(image);
      setError(null);
    } else {
      setGarmentImage(null);
    }
  }, []);

  const handleGenerateClick = async (isCampaign = false) => {
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
        // Handle campaign generation
        const platformsText = selectedPlatforms.join(' and ');
        const campaignGenerationPrompt = `Create a concise marketing campaign for ${campaignPrompt}. Include:
1. A brief, impactful overview (2-3 sentences)
2. 3 catchy slogans that highlight the unique features
Focus on ${platformsText} platforms. Keep it crisp and memorable.`;

        const result = await ApiClient.post<CampaignGenerationResponse>('/api/image-generation/generate-campaign', {
          prompt: campaignGenerationPrompt,
          garment_image_url: garmentImage
        });

        if (!result.data) {
          throw new Error('No response received from server');
        }

        if (result.data.code !== 0) {
          throw new Error(result.data.message || 'Failed to generate campaign');
        }

        const campaignContent = result.data.data?.campaign_content;
        
        if (!campaignContent) {
          throw new Error('No campaign content received');
        }

        setError(null);
        setCampaignContent(campaignContent);
        return;
      }

      // Handle image generation
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

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (!result.data) {
        throw new Error('No response received from server');
      }

      if (result.data.code !== 0) {
        throw new Error(result.data.message || 'Failed to generate image');
      }

      const imageUrl = result.data.data?.images?.[0];
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
          <div className='w-full md:w-[1000px]'>
            {/* Model Preview */}
            <div className={`${activeTab === 'campaign' ? 'h-[600px]' : 'h-[800px]'}`}>
              <div className='mb-2 text-sm font-medium text-muted-foreground'>Model Preview</div>
              <div className='h-[calc(100%-8px)]'>
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

                      const result = await ApiClient.post<VirtualTryOnResponse>('/api/image-generation/virtual-try-on', {
                        human_image_url: generatedImage,
                        garment_image_url: garmentImage,
                        model: tryOnModel,
                        garment_type: garmentType
                      });

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
                  isGenerating={isGenerating}
                  garmentImage={garmentImage}
                  showOverlayButton={true}
                />
              </div>
            </div>

            {/* Campaign Text Section */}
            {activeTab === 'campaign' && (
              <div className='mt-6'>
                <div className='mb-2 text-sm font-medium text-muted-foreground'>Campaign Text</div>
                <div className='bg-card rounded-lg border border-border p-4'>
                  {campaignContent ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ 
                      __html: campaignContent.split('\n').map(line => {
                        if (line.startsWith('###')) {
                          return `<h3 class="text-lg font-bold mt-4">${line.replace('###', '').trim()}</h3>`;
                        }
                        if (line.startsWith('####')) {
                          return `<h4 class="text-md font-semibold mt-3">${line.replace('####', '').trim()}</h4>`;
                        }
                        if (line.startsWith('- ')) {
                          return `<li class="ml-4">${line.replace('- ', '').trim()}</li>`;
                        }
                        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return line ? `<p class="my-2">${line}</p>` : '';
                      }).join('')
                    }} />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      Campaign text will appear here after generation
                    </p>
                  )}
                </div>
              </div>
            )}
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
            <div className={`${activeTab === 'campaign' ? 'h-[500px]' : 'h-[800px]'}`}>
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

                      const result = await ApiClient.post<VirtualTryOnResponse>('/api/image-generation/virtual-try-on', {
                        human_image_url: generatedImage,
                        garment_image_url: garmentImage,
                        model: tryOnModel,
                        garment_type: garmentType
                      });

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
                  isGenerating={isGenerating}
                  garmentImage={garmentImage}
                  showOverlayButton={true}
                />
              </div>
            </div>

            {/* Campaign Text Section */}
            {activeTab === 'campaign' && (
              <div className='mt-6'>
                <div className='mb-2 text-sm font-medium text-muted-foreground'>Campaign Text</div>
                <div className='bg-card rounded-lg border border-border p-4'>
                  {campaignContent ? (
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <h3 className="text-lg font-bold">Overview</h3>
                        <div className="bg-background/50 rounded p-3">
                          {campaignContent.split('\n\n')[0]}
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <h3 className="text-lg font-bold">Slogans</h3>
                        <div className="space-y-2">
                          {campaignContent.split('\n\n')[1].split('\n').map((slogan, index) => (
                            <div key={index} className="bg-background/50 rounded p-2 text-primary font-medium">
                              {slogan.replace('- ', '')}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      Campaign text will appear here after generation
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
