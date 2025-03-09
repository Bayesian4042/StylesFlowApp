import { Button } from "@/components/ui/button"
import PromptInput from "@/components/prompt-input"
import ReferenceUpload from "@/components/reference-upload"
import ImagePreview from "@/components/image-preview"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function AIVirtualTryOn() {
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
          <PromptInput />

          {/* Reference Upload Section */}
          <ReferenceUpload />

          {/* Generate Button */}
          <div className="p-4 border-t border-border">
            <Button className="w-full bg-gradient-to-r from-[#4caf50] to-[#2e7d32] hover:from-[#43a047] hover:to-[#2e7d32] text-white font-medium py-6">
              Generate
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative transition-all duration-300">
        <ImagePreview />
      </div>
    </div>
  )
}
