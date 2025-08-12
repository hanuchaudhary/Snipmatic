"use client";

import React, { useRef, useState, useEffect } from "react";

interface VideoCardProps {
  imageUrl?: string;
  videoUrl?: string;
  className?: string;
}

interface PlayIconProps {
  className?: string;
}

const PlayIcon: React.FC<PlayIconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 5V19L19 12L8 5Z" />
  </svg>
);

export const VideoCard: React.FC<VideoCardProps> = ({
  imageUrl,
  videoUrl,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState<boolean>(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && videoUrl) {
      const handleVideoEnd = () => {
        setShowVideo(false);
        videoElement.currentTime = 0;
      };

      if (showVideo) {
        videoElement.play().catch((error) => {
          console.error("VideoCard: Error playing video:", error);
          setShowVideo(false);
        });
        videoElement.addEventListener("ended", handleVideoEnd);
      } else {
        videoElement.pause();
      }

      return () => {
        videoElement.removeEventListener("ended", handleVideoEnd);
      };
    }
  }, [showVideo, videoUrl]);

  const handlePlayButtonClick = () => {
    if (videoUrl) {
      setShowVideo(true);
    }
  };

  return (
    <div className={`bg-border rounded-[2rem] p-[0.25rem] ${className}`}>
      <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 rounded-[1.75rem] bg-card flex items-center justify-center overflow-hidden">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Preview"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              showVideo ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          />
        )}
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              showVideo ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        )}
        {!showVideo && videoUrl && imageUrl && (
          <button
            onClick={handlePlayButtonClick}
            className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 p-2 sm:p-3 bg-accent/30 hover:bg-accent/50 text-accent-foreground backdrop-blur-sm rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Play video"
          >
            <PlayIcon className="w-4 h-4 sm:w-5 sm:h-6" />
          </button>
        )}
        {!imageUrl && !videoUrl && (
          <div className="text-muted-foreground italic">Card Content Area</div>
        )}
      </div>
    </div>
  );
};
