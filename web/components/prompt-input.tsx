"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

export default function PromptInput() {
  const [hints] = useState(["Succulent Plants", "B&W Female Portrait"])

  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#4caf50]"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="16" y2="12" />
          <line x1="12" x2="12.01" y1="8" y2="8" />
        </svg>
        <h2 className="text-sm font-medium">Prompt</h2>
      </div>

      <div className="bg-[#1a1a1f] rounded-lg p-4 mb-4">
        <textarea
          className="w-full bg-transparent border-none focus:outline-none resize-none text-gray-300 h-24"
          placeholder="Please describe your creative ideas for the image, or view Help Center for a quick start."
        />
        <div className="text-xs text-gray-500">
          <span>or view </span>
          <a href="#" className="text-[#4caf50]">
            Help Center
          </a>
          <span> for a quick start.</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* <div className="text-xs text-gray-400">Hints:</div> */}
        {/* <div className="flex gap-2">
          {hints.map((hint, index) => (
            <Button
              key={index}
              variant="outline"
              className="text-xs py-1 h-auto border-gray-700 bg-[#1a1a1f] hover:bg-[#252529] text-gray-300"
            >
              {hint}
            </Button>
          ))}
          <Button variant="outline" size="icon" className="h-6 w-6 border-gray-700 bg-[#1a1a1f] hover:bg-[#252529]">
            <RefreshCcw className="h-3 w-3 text-gray-400" />
          </Button>
        </div> */}
      </div>
    </div>
  )
}

