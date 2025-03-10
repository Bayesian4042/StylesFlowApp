"use client"

interface ImagePreviewProps {
  imageUrl: string | null
}

export default function ImagePreview({ imageUrl }: ImagePreviewProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#1a1a1f] rounded-lg overflow-hidden">
      {imageUrl ? (
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <img
            src={imageUrl}
            alt="Generated image"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      ) : (
        <div className="text-gray-500 text-center p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 text-gray-600"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <p>Enter a prompt and click Generate to create an image</p>
        </div>
      )}
    </div>
  )
}
