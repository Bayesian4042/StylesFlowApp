'use client';

import ModelSettings from '@/components/model-settings';
import PromptInput from '@/components/prompt-input';
import ImageUploader from '@/components/image-uploader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { Sparkles } from 'lucide-react';

interface GenerateImageResponse {
  code: number;
  message: string;
  data: {
    images: string[];
  };
}

interface GenerateImageRequest {
  prompt: string;
  modelSettings: string;
  clothImage?: string | null;
  model: string;
  provider: string;
}

interface AIModelTabProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  error: string | null;
  gender: string;
  age: string;
  skinTone: string;
  onGenderChange: (gender: string) => void;
  onAgeChange: (age: string) => void;
  onSkinToneChange: (skinTone: string) => void;
  onGarmentImageChange: (image: string | null) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  garmentType: string;
  onGarmentTypeChange: (type: string) => void;
}

export default function AIModelTab({ 
  prompt, 
  onPromptChange, 
  error,
  gender,
  age,
  skinTone,
  onGenderChange,
  onAgeChange,
  onSkinToneChange,
  onGarmentImageChange,
  selectedModel,
  onModelChange,
  garmentType,
  onGarmentTypeChange
}: AIModelTabProps) {
  const modelSettings = `${gender}, ${age}, ${skinTone} skin tone`;
  const [localError, setLocalError] = useState<string | null>(null);

  // Extract pose and background from the combined prompt
  const getPoseAndBackground = (fullPrompt: string) => {
    const modelSettingsPrefix = `A person ${modelSettings.toLowerCase()}`;
    let cleanPrompt = fullPrompt;
    
    // Remove model settings if present
    if (cleanPrompt.startsWith(modelSettingsPrefix)) {
      cleanPrompt = cleanPrompt.slice(modelSettingsPrefix.length).trim();
      if (cleanPrompt.startsWith(',')) {
        cleanPrompt = cleanPrompt.slice(1).trim();
      }
    }

    // Split by comma but preserve product descriptions
    const parts = cleanPrompt.split(/,(?![^()]*\))/); // Split on commas not inside parentheses
    
    // Find the part that contains "wearing" if it exists
    const wearingIndex = parts.findIndex(part => 
      part.toLowerCase().trim().includes('wearing')
    );

    if (wearingIndex !== -1) {
      // Keep everything up to and including the wearing part in pose
      const pose = parts.slice(0, wearingIndex + 1).join(',').trim();
      // Only use remaining parts (if any) as background if they don't contain product info
      const remainingParts = parts.slice(wearingIndex + 1);
      const background = remainingParts.some(part => 
        part.toLowerCase().includes('content:') || 
        part.toLowerCase().includes('%') ||
        part.toLowerCase().includes('gsm') ||
        part.toLowerCase().includes('fabric')
      ) ? '' : remainingParts.join(',').trim();
      
      return { pose, background };
    }

    // If no wearing keyword, check if any part contains product-related terms
    const hasProductInfo = parts.some(part => 
      part.toLowerCase().includes('content:') || 
      part.toLowerCase().includes('%') ||
      part.toLowerCase().includes('gsm') ||
      part.toLowerCase().includes('fabric')
    );

    if (hasProductInfo) {
      // Keep everything in pose if it contains product info
      return {
        pose: cleanPrompt,
        background: ''
      };
    }

    // Default case: first part is pose, rest is background
    return {
      pose: parts[0]?.trim() || '',
      background: parts.slice(1).join(',').trim()
    };
  };

  // Initialize state with default values
  const [posePrompt, setPosePrompt] = useState('');
  const [backgroundPrompt, setBackgroundPrompt] = useState('white background');

  // Update local state when parent prompt changes
  useEffect(() => {
    if (prompt) {
      const { pose, background } = getPoseAndBackground(prompt);
      setPosePrompt(pose);
      setBackgroundPrompt(background);
    }
  }, [prompt, modelSettings]);

  // Handle local prompt updates
  const handlePoseChange = useCallback((newPose: string) => {
    // Check if the new pose contains product info
    const hasProductInfo = newPose.toLowerCase().includes('wearing') ||
      newPose.toLowerCase().includes('content:') ||
      newPose.toLowerCase().includes('%') ||
      newPose.toLowerCase().includes('gsm') ||
      newPose.toLowerCase().includes('fabric');

    setPosePrompt(newPose);
    
    // If pose contains product info, set default white background
    if (hasProductInfo) {
      setBackgroundPrompt('white background');
    }

    const parts = [];
    parts.push(`A person ${modelSettings.toLowerCase()}`);
    if (newPose) parts.push(newPose);
    // Only add background if pose doesn't contain product info
    if (!hasProductInfo && backgroundPrompt) parts.push(backgroundPrompt);
    onPromptChange(parts.join(', ').trim());
  }, [modelSettings, backgroundPrompt, onPromptChange]);

  const handleBackgroundChange = useCallback((newBackground: string) => {
    setBackgroundPrompt(newBackground);
    const parts = [];
    parts.push(`A person ${modelSettings.toLowerCase()}`);
    if (posePrompt) parts.push(posePrompt);
    if (newBackground) parts.push(newBackground);
    onPromptChange(parts.join(', ').trim());
  }, [modelSettings, posePrompt, onPromptChange]);

  const handleGarmentUpload = useCallback((image: string | null) => {
    console.log('Received image in handleGarmentUpload:', image ? 'Image present' : 'No image');
    try {
      if (image) {
        console.log('Valid image received, updating state');
        onGarmentImageChange(image);
        setLocalError(null);
      } else {
        console.log('No image received or image removed');
        onGarmentImageChange(null);
      }
    } catch (error) {
      console.error('Error in handleGarmentUpload:', error);
      setLocalError(error instanceof Error ? error.message : 'Failed to process image');
      onGarmentImageChange(null);
    }
  }, [onGarmentImageChange]);

  return (
    <div className="relative z-10 overflow-y-auto">
      <ModelSettings 
        gender={gender}
        age={age}
        skinTone={skinTone}
        onGenderChange={onGenderChange}
        onAgeChange={onAgeChange}
        onSkinToneChange={onSkinToneChange}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
      <div className="border-t border-border p-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Upload Garment Image</p>
          
          {/* Garment Type Select */}
          <div className="mb-4">
            <Select value={garmentType} onValueChange={onGarmentTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select garment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upper">Upper Body (shirts, jackets)</SelectItem>
                <SelectItem value="lower">Lower Body (pants, skirts)</SelectItem>
                <SelectItem value="overall">Overall (dresses, jumpsuits)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ImageUploader 
            singleImage={true}
            onImageUpload={handleGarmentUpload}
          />
        </div>
      </div>
      <PromptInput 
        value={posePrompt}
        onChange={handlePoseChange}
        type="pose"
        modelSettings={modelSettings}
        showPreview={false}
      />
      <PromptInput 
        value={backgroundPrompt}
        onChange={handleBackgroundChange}
        type="background"
        showPreview={false}
      />
      
      {/* Combined Preview Section */}
      <div className='border-b border-border p-3 relative z-10'>
        <div className='rounded-lg bg-muted/50 p-2 relative border border-dashed border-muted-foreground/25'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-1.5'>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <h3 className='text-xs font-medium'>Complete Prompt</h3>
            </div>
            <div className='text-xs text-muted-foreground'>
              Including: <span className="text-primary">{modelSettings}</span>
            </div>
          </div>
          <div className='text-xs text-muted-foreground bg-background/50 rounded p-1.5'>
            <span className='text-primary'>A person {modelSettings.toLowerCase()}</span>
            {posePrompt && <span>, {posePrompt}</span>}
            {backgroundPrompt && <span>, {backgroundPrompt}</span>}
          </div>
        </div>
      </div>

      {(error || localError) && (
        <p className="text-sm text-destructive p-4 border-t border-border">{error || localError}</p>
      )}
    </div>
  );
}
