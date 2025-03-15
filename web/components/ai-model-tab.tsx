'use client';

import ModelSettings from '@/components/model-settings';
import PromptInput from '@/components/prompt-input';
import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';

interface GenerateImageResponse {
  code: number;
  message: string;
  data: {
    images: string[];
  };
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
