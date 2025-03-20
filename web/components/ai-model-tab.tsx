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

  const handleGarmentUpload = (image: string | null) => {
    onGarmentImageChange(image);
  };

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
      {error && (
        <p className="text-sm text-destructive p-4 border-t border-border">{error}</p>
      )}
    </div>
  );
}
