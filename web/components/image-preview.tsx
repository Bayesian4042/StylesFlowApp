export default function ImagePreview() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="relative mb-4">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-700"
        >
          <path
            d="M21 14V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 3L17 8.44444M12 3L7 8.44446M12 3V14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="absolute top-0 right-0 w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-xs text-white">+</span>
        </div>
      </div>
      <p className="text-gray-400 text-center max-w-md">
        Release your creative potential. Experience the magic of KLING AI.
      </p>
    </div>
  )
}

