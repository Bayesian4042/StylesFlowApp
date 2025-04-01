'use client';

import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Sparkles, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

interface CampaignTabProps {
  onCampaignPromptChange?: (prompt: string) => void;
  onPlatformsChange?: (platforms: Platform[]) => void;
  garmentImage?: string | null;
  aiModelPrompt?: string;
  modelSettings?: string;
  onGenerateClick?: () => void;
  isGenerating?: boolean;
  campaignContent?: string;
}

type Platform = 'instagram' | 'twitter' | 'facebook' | 'youtube';

interface PlatformConfig {
  icon: JSX.Element;
  label: string;
}

const platforms: Record<Platform, PlatformConfig> = {
  instagram: { icon: <Instagram className="h-4 w-4" />, label: 'Instagram' },
  twitter: { icon: <Twitter className="h-4 w-4" />, label: 'Twitter' },
  facebook: { icon: <Facebook className="h-4 w-4" />, label: 'Facebook' },
  youtube: { icon: <Youtube className="h-4 w-4" />, label: 'YouTube' }
};

export default function CampaignTab({ 
  onCampaignPromptChange,
  onPlatformsChange,
  garmentImage,
  aiModelPrompt,
  modelSettings,
  onGenerateClick,
  isGenerating,
  campaignContent
}: CampaignTabProps) {
  const [campaignPrompt, setCampaignPrompt] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);

  // Log when campaign content changes
  useEffect(() => {
    console.log('CampaignTab: Campaign content updated:', campaignContent);
  }, [campaignContent]);

  const handlePromptChange = (value: string) => {
    setCampaignPrompt(value);
    onCampaignPromptChange?.(value);
  };

  return (
    <div className="relative z-10 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 pb-2">
        <Sparkles className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-medium">Campaign Generation</h2>
      </div>

      {/* Campaign Input Section */}
      <div className="p-4 space-y-6 border-t border-border">
        {/* Platform Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            Select Target Platforms
          </label>
          <ToggleGroup 
            type="multiple" 
            className="flex flex-wrap gap-2"
            value={selectedPlatforms}
            onValueChange={(values: Platform[]) => {
              setSelectedPlatforms(values);
              onPlatformsChange?.(values);
            }}
          >
            {Object.entries(platforms).map(([key, { icon, label }]) => (
              <ToggleGroupItem 
                key={key} 
                value={key}
                className="flex items-center gap-2 px-3"
                aria-label={label}
              >
                {icon}
                <span className="text-sm">{label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Campaign Type Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            What kind of campaign would you like to generate?
          </label>
          <Input
            placeholder="e.g., Summer collection, Holiday special..."
            value={campaignPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
          />
        </div>

      {/* Garment Preview */}
      <div className="space-y-4 border-t border-border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Campaign Garment</h3>
          {garmentImage && (
            <p className="text-xs text-muted-foreground">
              Image uploaded from AI Model tab
            </p>
          )}
        </div>
        
        {garmentImage ? (
          <div className="relative aspect-square w-full max-w-[300px] mx-auto rounded-lg overflow-hidden border border-border">
            <img 
              src={garmentImage} 
              alt="Garment" 
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-3">
              <p className="text-xs text-muted-foreground">
                This garment will be used for campaign generation
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Please upload a garment image in the AI Model tab first
            </p>
          </div>
        )}
      </div>

      {/* Model Configuration */}
      <div className="space-y-4 border-t border-border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">AI Model Configuration</h3>
          {aiModelPrompt && (
            <p className="text-xs text-muted-foreground">
              Configuration from AI Model tab
            </p>
          )}
        </div>

        {aiModelPrompt ? (
          <div className="rounded-lg bg-muted/50 p-3 border border-dashed border-muted-foreground/25">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Complete Prompt:</p>
                <p className="text-sm font-medium">{aiModelPrompt}</p>
              </div>
              {modelSettings && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">AI Model Settings:</p>
                  <div className="flex gap-2 flex-wrap">
                    {modelSettings.split(', ').map((setting, index) => (
                      <div 
                        key={index}
                        className="text-xs bg-background/50 px-2 py-1 rounded"
                      >
                        {setting}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Please configure the AI model settings in the AI Model tab first
            </p>
          </div>
        )}
      </div>

      {/* Campaign Preview and Generate Button */}
      <div className="space-y-4 border-t border-border p-4">
        {(campaignPrompt || selectedPlatforms.length > 0) && (
          <div className="rounded-lg bg-muted/50 p-3 border border-dashed border-muted-foreground/25">
            <p className="text-xs text-muted-foreground mb-1">Campaign Configuration:</p>
            <p className="text-sm font-medium text-primary">{campaignPrompt}</p>
            {selectedPlatforms.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {selectedPlatforms.map(platform => (
                  <div key={platform} className="flex items-center gap-1 text-xs bg-background/50 px-2 py-1 rounded">
                    {platforms[platform].icon}
                    <span>{platforms[platform].label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Button
          className="w-full"
          variant="default"
          onClick={onGenerateClick}
          disabled={isGenerating || !campaignPrompt || !garmentImage || !aiModelPrompt || selectedPlatforms.length === 0}
        >
          {isGenerating ? "Generating Campaign..." : "Generate Campaign"}
        </Button>

        {(!garmentImage || !aiModelPrompt) && (
          <p className="text-xs text-muted-foreground text-center">
            Please complete AI Model configuration before generating campaign
          </p>
        )}
        {(!campaignPrompt || selectedPlatforms.length === 0) && (
          <p className="text-xs text-muted-foreground text-center">
            Please select platforms and enter campaign type
          </p>
        )}
      </div>

      {/* Campaign Content Display */}
      {campaignContent ? (
        <div className="mt-6 space-y-4 border-t border-border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Generated Campaign</h3>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 border border-dashed border-muted-foreground/25 overflow-auto max-h-[500px]">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {/* Convert markdown to HTML */}
              <div dangerouslySetInnerHTML={{ 
                __html: campaignContent.split('\n').map(line => {
                  console.log('Processing line:', line);
                  // Convert markdown headers
                  if (line.startsWith('###')) {
                    return `<h3 class="text-lg font-bold mt-4">${line.replace('###', '').trim()}</h3>`;
                  }
                  if (line.startsWith('####')) {
                    return `<h4 class="text-md font-semibold mt-3">${line.replace('####', '').trim()}</h4>`;
                  }
                  // Convert markdown lists
                  if (line.startsWith('- ')) {
                    return `<li class="ml-4">${line.replace('- ', '').trim()}</li>`;
                  }
                  // Convert markdown bold
                  line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  const processedLine = line ? `<p class="my-2">${line}</p>` : '';
                  console.log('Processed to:', processedLine);
                  return processedLine;
                }).join('')
              }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4 border-t border-border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Generated Campaign</h3>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 border border-dashed border-muted-foreground/25">
            <p className="text-sm text-muted-foreground text-center">
              Campaign content will appear here after generation
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
