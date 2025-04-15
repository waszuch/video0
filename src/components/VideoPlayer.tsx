"use client";
import { useState, useRef } from "react";

const MuteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
  </svg>
);

const UnmuteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

export function VideoPlayer() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const overlayStyles = "absolute pointer-events-none bg-black bg-opacity-60";

  return (
    <div className="relative w-full h-full cursor-pointer" onClick={toggleMute}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover rounded-lg"
        src="/video.mp4"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30 pointer-events-none" />
      
      {isMuted && (
        <div className={`${overlayStyles} bottom-4 left-4 px-2 py-1 rounded text-white text-sm font-medium`}>
          Click to unmute
        </div>
      )}
      
      <div className={`${overlayStyles} bottom-4 right-4 p-2 rounded-full`}>
        {isMuted ? <MuteIcon /> : <UnmuteIcon />}
      </div>
    </div>
  );
} 