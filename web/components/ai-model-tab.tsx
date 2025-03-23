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
  onModelChange
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

    const parts = cleanPrompt.split(',').map(p => p.trim());
    return {
      pose: parts[0] || '',
      background: parts.slice(1).join(', ').trim()
    };
  };

  // Get initial pose and background from prompt
  const { pose: initialPose, background: initialBackground } = getPoseAndBackground(prompt);
  const [posePrompt, setPosePrompt] = useState(initialPose);
  const [backgroundPrompt, setBackgroundPrompt] = useState(initialBackground);

  // Update parent's prompt when either pose or background changes
  const updateCombinedPrompt = useCallback((newPose: string, newBackground: string) => {
    const parts = [];
    
    // Add model settings first
    parts.push(`A person ${modelSettings.toLowerCase()}`);
    
    // Add pose and background if they exist
    if (newPose) parts.push(newPose);
    if (newBackground) parts.push(newBackground);
    
    const combinedPrompt = parts.join(', ').trim();
    onPromptChange(combinedPrompt);
  }, [modelSettings, onPromptChange]);

  // Update combined prompt when pose or background changes
  useEffect(() => {
    updateCombinedPrompt(posePrompt, backgroundPrompt);
  }, [posePrompt, backgroundPrompt, updateCombinedPrompt]);

  // Update local state when parent prompt changes
  useEffect(() => {
    const { pose, background } = getPoseAndBackground(prompt);
    setPosePrompt(pose);
    setBackgroundPrompt(background);
  }, [prompt]);

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
          <ImageUploader 
            singleImage={true}
            onImageUpload={handleGarmentUpload}
          />
        </div>
      </div>
      <PromptInput 
        value={posePrompt}
        onChange={setPosePrompt}
        type="pose"
        modelSettings={modelSettings}
        showPreview={false}
      />
      <PromptInput 
        value={backgroundPrompt}
        onChange={setBackgroundPrompt}
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
