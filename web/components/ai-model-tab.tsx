'use client';

import ModelSettings from '@/components/model-settings';
import PromptInput from '@/components/prompt-input';
import ImageUploader from '@/components/image-uploader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';

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
  const [posePrompt, setPosePrompt] = useState('');
  const [backgroundPrompt, setBackgroundPrompt] = useState('');
  const modelSettings = `${gender}, ${age}, ${skinTone} skin tone`;

  const [localError, setLocalError] = useState<string | null>(null);

  // Effect to combine prompts and update parent
  useEffect(() => {
    const combinedPrompt = [posePrompt, backgroundPrompt]
      .filter(p => p.trim())
      .join(', ');
    onPromptChange(combinedPrompt);
  }, [posePrompt, backgroundPrompt, onPromptChange]);

  // Split incoming prompt into pose and background on initial load
  useEffect(() => {
    if (prompt && !posePrompt && !backgroundPrompt) {
      const parts = prompt.split(',').map(p => p.trim());
      setPosePrompt(parts[0] || '');
      setBackgroundPrompt(parts[1] || '');
    }
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
    <div className="relative z-10">
      <div className="p-4 border-b border-border">
        <p className="text-sm font-medium text-muted-foreground mb-2">Select Model</p>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="leffa">Leffa</SelectItem>
            <SelectItem value="cat-vton">Cat-VTON</SelectItem>
            <SelectItem value="kling">Kling</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ModelSettings 
        gender={gender}
        age={age}
        skinTone={skinTone}
        onGenderChange={onGenderChange}
        onAgeChange={onAgeChange}
        onSkinToneChange={onSkinToneChange}
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
      />
      <PromptInput 
        value={backgroundPrompt}
        onChange={setBackgroundPrompt}
        type="background"
      />
      {(error || localError) && (
        <p className="text-sm text-destructive p-4 border-t border-border">{error || localError}</p>
      )}
    </div>
  );
}
