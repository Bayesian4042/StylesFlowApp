'use client';

import ModelSettings from '@/components/model-settings';
import PromptInput from '@/components/prompt-input';
import ImageUploader from '@/components/image-uploader';
import { Button } from '@/components/ui/button';
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
  onGarmentImageChange
}: AIModelTabProps) {

  const modelSettings = `${gender}, ${age}, ${skinTone} skin tone`;

  const [localError, setLocalError] = useState<string | null>(null);

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
        value={prompt}
        onChange={onPromptChange}
        modelSettings={modelSettings}
      />
      {(error || localError) && (
        <p className="text-sm text-destructive p-4 border-t border-border">{error || localError}</p>
      )}
    </div>
  );
}
