"use client";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";

export default function VideoGrid() {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());

  const toggleVideoPlay = (videoId: string) => {
    const videoElement = document.getElementById(videoId) as HTMLVideoElement;
    
    if (playingVideos.has(videoId)) {
      videoElement.pause();
      setPlayingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } else {
      setPlayingVideos(prev => new Set([...prev, videoId]));
      
      // Use setTimeout to ensure state has updated and video element is visible
      setTimeout(() => {
        const videoElement = document.getElementById(videoId) as HTMLVideoElement;
        if (videoElement) {
          videoElement.load();
          videoElement.play().catch(err => console.error("Error playing video:", err));
        }
      }, 50);
    }
  };

  const VideoItem = ({ 
    id, 
    thumbnail, 
    isVertical = false 
  }: { 
    id: string, 
    thumbnail: string, 
    isVertical?: boolean 
  }) => {
    const isPlaying = playingVideos.has(id);
    
    return (
      <div className="w-full relative">
        {/* Show thumbnail image when not playing */}
        {!isPlaying && (
          <div className="relative w-full">
            <Image 
              src={thumbnail}
              alt="Video thumbnail"
              width={isVertical ? 300 : 300}
              height={isVertical ? 600 : 200}
              className="w-full rounded-lg shadow-md object-cover"
            />
            
            {/* Play button overlay */}
            <button 
              className="absolute inset-0 flex items-center justify-center bg-opacity-20 rounded-lg cursor-pointer"
              onClick={() => toggleVideoPlay(id)}
            >
              <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-16 border-l-black ml-1"></div>
              </div>
            </button>
          </div>
        )}
        
        {/* Show video when playing */}
        <div className={`${isPlaying ? 'block' : 'hidden'}`}>
          <video 
            id={id}
            src="/video.mp4"
            width={300}
            height={isVertical ? 600 : 200}
            className="w-full rounded-lg shadow-md"
            loop
            muted
            playsInline
          />
          
          {/* Invisible pause button when playing */}
          {isPlaying && (
            <button 
              className="absolute inset-0 flex items-center justify-center bg-transparent rounded-lg cursor-pointer"
              onClick={() => toggleVideoPlay(id)}
              aria-label="Pause video"
            />
          )}
        </div>
      </div>
    );
  };

  // Define the type for video items
  type VideoItemType = {
    id: string;
    thumbnail: string;
    isVertical: boolean;
  };

  // Create an array of videos for each column
  const column1Videos: VideoItemType[] = [
    { id: "video1", thumbnail: "/homevertical.png", isVertical: true },
    { id: "video2", thumbnail: "/homehorizontal.png", isVertical: false }
  ];
  
  const column2Videos: VideoItemType[] = [
    { id: "video3", thumbnail: "/homehorizontal.png", isVertical: false },
    { id: "video4", thumbnail: "/homevertical.png", isVertical: true }
  ];
  
  const column3Videos: VideoItemType[] = [
    { id: "video5", thumbnail: "/homevertical.png", isVertical: true },
    { id: "video6", thumbnail: "/homehorizontal.png", isVertical: false }
  ];

  // Function to create triple-duplicate content for proper infinite scrolling
  // The middle set is the "main" visible set, and the top and bottom sets allow
  // for seamless looping without visual jumps
  const createInfiniteScrollContent = (videos: VideoItemType[]): React.ReactElement[] => {
    const elements: React.ReactElement[] = [];
    
    // Create 3 complete sets of videos (this ensures no matter where animation starts/ends, there's content)
    for (let set = 0; set < 3; set++) {
      videos.forEach((video, index) => {
        const uniqueId = `${video.id}-set${set}-${index}`;
        elements.push(
          <VideoItem 
            key={uniqueId}
            id={uniqueId}
            thumbnail={video.thumbnail}
            isVertical={video.isVertical}
          />
        );
      });
    }
    
    return elements;
  };

  return (
    <div className="hidden lg:grid grid-cols-3 gap-4 h-screen overflow-hidden">
      {/* Column 1 - Going up */}
      <div 
        className="relative overflow-hidden h-full"
        onMouseEnter={() => setHoveredCol(1)}
        onMouseLeave={() => setHoveredCol(null)}
      >
        <div 
          className="animate-scroll-up flex flex-col gap-4 absolute top-0 left-0 right-0"
          style={{ 
            animationPlayState: hoveredCol === 1 ? 'paused' : 'running'
          }}
        >
          {createInfiniteScrollContent(column1Videos)}
        </div>
      </div>

      {/* Column 2 - Going down */}
      <div 
        className="relative overflow-hidden h-full"
        onMouseEnter={() => setHoveredCol(2)}
        onMouseLeave={() => setHoveredCol(null)}
      >
        <div 
          className="animate-scroll-down flex flex-col gap-4 absolute top-0 left-0 right-0"
          style={{ 
            animationPlayState: hoveredCol === 2 ? 'paused' : 'running'
          }}
        >
          {createInfiniteScrollContent(column2Videos)}
        </div>
      </div>

      {/* Column 3 - Going up */}
      <div 
        className="relative overflow-hidden h-full"
        onMouseEnter={() => setHoveredCol(3)}
        onMouseLeave={() => setHoveredCol(null)}
      >
        <div 
          className="animate-scroll-up flex flex-col gap-4 absolute top-0 left-0 right-0"
          style={{ 
            animationPlayState: hoveredCol === 3 ? 'paused' : 'running'
          }}
        >
          {createInfiniteScrollContent(column3Videos)}
        </div>
      </div>
    </div>
  );
} 