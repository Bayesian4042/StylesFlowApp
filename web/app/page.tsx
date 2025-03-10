"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import PromptInput from "@/components/prompt-input"
import ReferenceUpload from "@/components/reference-upload"
import ImagePreview from "@/components/image-preview"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function AIVirtualTryOn() {
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/image-generation/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          provider: "replicate", // or "kling" based on your preference
          model: "flux-dev",
          num_images: 1,
        }),
      })

      const data = await response.json()
      
      if (data.code === 0 && data.data?.images?.[0]) {
        // Set the image URL from the API response
        const imageUrl = data.data.images[0]
        console.log("Setting image URL:", imageUrl)
        setGeneratedImage(imageUrl)
      } else {
        console.error("Image generation failed:", data.message)
      }
    } catch (error) {
      console.error("Failed to generate image:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background relative">
      <div className="absolute top-4 left-4 z-50 md:hidden">
        <SidebarTrigger />
      </div>
      {/* Controls Panel */}
      <div className="w-[370px] min-w-[370px] border-r border-border flex flex-col md:group-data-[collapsible=icon]:w-[48px] md:group-data-[collapsible=icon]:min-w-[48px] transition-all duration-300">
        {/* AI Virtual Try-On Title */}
        <div className="border-b border-border p-4 md:group-data-[collapsible=icon]:opacity-0 transition-opacity duration-300">
          <h1 className="text-lg font-medium">AI Virtual Try-On</h1>
        </div>

        {/* Content Sections */}
        <div className="flex-1 overflow-y-auto md:group-data-[collapsible=icon]:opacity-0 transition-opacity duration-300">
          {/* Prompt Section */}
          <PromptInput 
            value={prompt}
            onChange={setPrompt}
          />

          {/* Reference Upload Section */}
          <ReferenceUpload />

          {/* Generate Button */}
          <div className="p-4 border-t border-border">
            <Button 
              className="w-full bg-gradient-to-r from-[#4caf50] to-[#2e7d32] hover:from-[#43a047] hover:to-[#2e7d32] text-white font-medium py-6"
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative transition-all duration-300">
        <ImagePreview imageUrl={generatedImage} />
      </div>
    </div>
  )
}
