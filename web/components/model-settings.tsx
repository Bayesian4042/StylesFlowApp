'use client';

import { User } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ModelSettingsProps {
  gender: string;
  age: string;
  skinTone: string;
  onGenderChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onSkinToneChange: (value: string) => void;
}

export default function ModelSettings({ 
  gender, 
  age, 
  skinTone,
  onGenderChange,
  onAgeChange,
  onSkinToneChange 
}: ModelSettingsProps) {
  return (
    <div className="p-4 space-y-5 relative">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2">
        <User className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-medium">Model Settings / Model Custom</h2>
      </div>

      {/* Gender Selection */}
      <div className="space-y-2 relative z-10">
        <span className="text-sm text-muted-foreground">Gender:</span>
        <div className="flex gap-4">
          <button
            onClick={() => onGenderChange('male')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm",
              gender === 'male' ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <div className={cn(
              "w-3 h-3 rounded-full border-2",
              gender === 'male' ? "border-primary" : "border-muted-foreground"
            )} />
            <span>Male</span>
          </button>
          <button
            onClick={() => onGenderChange('female')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm",
              gender === 'female' ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <div className={cn(
              "w-3 h-3 rounded-full border-2",
              gender === 'female' ? "border-primary" : "border-muted-foreground"
            )} />
            <span>Female</span>
          </button>
        </div>
      </div>

      {/* Age Selection */}
      <div className="space-y-2 relative z-10">
        <span className="text-sm text-muted-foreground">Age:</span>
        <div className="flex gap-4">
          <button
            onClick={() => onAgeChange('children')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm",
              age === 'children' ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <div className={cn(
              "w-3 h-3 rounded-full border-2",
              age === 'children' ? "border-primary" : "border-muted-foreground"
            )} />
            <span>Children</span>
          </button>
          <button
            onClick={() => onAgeChange('youth')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm",
              age === 'youth' ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <div className={cn(
              "w-3 h-3 rounded-full border-2",
              age === 'youth' ? "border-primary" : "border-muted-foreground"
            )} />
            <span>Youth</span>
          </button>
          <button
            onClick={() => onAgeChange('elderly')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm",
              age === 'elderly' ? "bg-muted" : "hover:bg-muted/50"
            )}
          >
            <div className={cn(
              "w-3 h-3 rounded-full border-2",
              age === 'elderly' ? "border-primary" : "border-muted-foreground"
            )} />
            <span>Elderly</span>
          </button>
        </div>
      </div>

      {/* Skin Tone Selection */}
      <div className="space-y-2 relative z-10">
        <span className="text-sm text-muted-foreground">Skin Tone:</span>
        <div className="flex gap-3">
          <button
            onClick={() => onSkinToneChange('light')}
            className={cn(
              "w-6 h-6 rounded-full bg-[#F6EBE1]",
              skinTone === 'light' ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
            )}
          />
          <button
            onClick={() => onSkinToneChange('medium')}
            className={cn(
              "w-6 h-6 rounded-full bg-[#D4A373]",
              skinTone === 'medium' ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
            )}
          />
          <button
            onClick={() => onSkinToneChange('dark')}
            className={cn(
              "w-6 h-6 rounded-full bg-[#8B4513]",
              skinTone === 'dark' ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
            )}
          />
          <button
            onClick={() => onSkinToneChange('very-dark')}
            className={cn(
              "w-6 h-6 rounded-full bg-[#3E2723]",
              skinTone === 'very-dark' ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
            )}
          />
        </div>
      </div>
    </div>
  );
}
