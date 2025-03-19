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
  onSkinToneChange
}: AIModelTabProps) {

  const modelSettings = `${gender}, ${age}, ${skinTone} skin tone`;
  const [clothImage, setClothImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateImage = useCallback(async () => {
    if (!prompt) return;
    
    setIsLoading(true);
    try {
      const payload: GenerateImageRequest = {
        prompt,
        modelSettings,
        clothImage
      };
      
      const response = await ApiClient.post<GenerateImageResponse>('/api/generate', payload);
      // Handle the response as needed
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, modelSettings, clothImage]);

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
        <ImageUploader 
          singleImage={true}
          onImageUpload={setClothImage}
        />
        {clothImage && (
          <div className="mt-4">
            <Button 
              onClick={handleGenerateImage}
              disabled={!prompt || isLoading}
              className="w-full"
            >
              {isLoading ? 'Generating...' : 'Generate Image'}
            </Button>
          </div>
        )}
      </div>
      <PromptInput 
        value={prompt}
        onChange={onPromptChange}
        modelSettings={modelSettings}
      />
      {error && (
        <p className="text-sm text-destructive p-4 border-t border-border">{error}</p>
      )}
    </div>
  );
}
