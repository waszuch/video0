"use client";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";

// Replace hardcoded VIDEOS with empty array as default
const VIDEOS: VideoType[] = [];

interface VideoType {
  id: string;
  name?: string;
  thumbnail: string;
  videoUrl: string;
}

interface VideoItemProps {
  id: string;
  thumbnail: string;
  videoUrl: string;
  isVertical?: boolean;
  isPlaying: boolean;
  togglePlay: (id: string) => void;
  isHovered?: boolean;
}

const VideoItem = ({
  id,
  thumbnail,
  videoUrl,
  isVertical = true,
  isPlaying,
  togglePlay,
  isHovered
}: VideoItemProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateTime);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateTime);
    };
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const dimensionsClass = isVertical ? "aspect-[1/2]" : "aspect-[3/2]";

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full relative rounded-lg overflow-hidden ${dimensionsClass} group`}>
      <div className={`absolute inset-0 transition-opacity duration-300 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 group-hover:opacity-0 z-10" />

        <Image
          src={thumbnail}
          alt="Video thumbnail"
          fill
          className="object-cover"
          priority
        />
        <button
          className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg cursor-pointer group z-20"
          onClick={() => togglePlay(id)}
        >
          <div className="bg-black/80 border border-white/10 relative rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden w-16 h-16">
            <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(126,34,206,0.4)_0%,rgba(126,34,206,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10 w-0 h-0 border-t-transparent border-b-transparent ml-1 transition-all duration-300 border-t-8 border-b-8 border-l-16 border-l-purple-500 group-hover:border-l-white group-hover:animate-juggle"></div>
          </div>
        </button>
      </div>

      <div className={`absolute inset-0 transition-opacity duration-300 ${isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <video
          id={id}
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          loop
          playsInline
          preload="auto"
          muted={!isPlaying}
        />
        {isPlaying && (
          <>
            <button
              className="absolute inset-0 flex items-center justify-center bg-transparent cursor-pointer"
              onClick={() => togglePlay(id)}
              aria-label="Pause video"
            >
              <div className="bg-black/80 border border-white/10 rounded-full flex items-center justify-center w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center justify-center">
                  <div className="w-1.5 h-5 bg-white rounded-sm mx-0.5"></div>
                  <div className="w-1.5 h-5 bg-white rounded-sm mx-0.5"></div>
                </div>
              </div>
            </button>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex flex-col gap-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                />

                <div className="flex justify-between text-xs text-white/80">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const VideoColumn = ({
  videos,
  columnIndex,
  hoveredCol,
  isAnyPlaying,
  playingVideos,
  togglePlay,
  onMouseEnter,
  onMouseLeave
}: {
  videos: typeof VIDEOS,
  columnIndex: number,
  hoveredCol: number | null,
  isAnyPlaying: boolean,
  playingVideos: Set<string>,
  togglePlay: (id: string) => void,
  onMouseEnter: () => void,
  onMouseLeave: () => void
}) => {
  const isMiddleColumn = columnIndex === 1;
  const scrollDirection = isMiddleColumn ? "scroll-down" : "scroll-up";
  const scrollSpeed = columnIndex === 2 ? "scroll-up-fast" : "";

  return (
    <div
      className="relative overflow-hidden h-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={`flex flex-col gap-4 w-full absolute top-0 left-0 right-0 ${scrollDirection} ${scrollSpeed}`}
        style={{ animationPlayState: hoveredCol === columnIndex || isAnyPlaying ? "paused" : "running" }}
      >
        {Array.from({ length: 8 }).flatMap((_, setIndex) =>
          videos.map((video, videoIndex) => {
            const uniqueId = `${video.id}-col${columnIndex}-set${setIndex}-${videoIndex}`;
            return (
              <VideoItem
                key={uniqueId}
                id={uniqueId}
                thumbnail={video.thumbnail}
                videoUrl={video.videoUrl}
                isPlaying={playingVideos.has(uniqueId)}
                togglePlay={togglePlay}
                isHovered={hoveredCol === columnIndex}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

const MobileVideoItem = ({ video, isPlaying, togglePlay }: {
  video: typeof VIDEOS[0],
  isPlaying: boolean,
  togglePlay: (id: string) => void
}) => {
  return (
    <div className="flex-none w-[45%] snap-center">
      <VideoItem
        id={video.id}
        thumbnail={video.thumbnail}
        videoUrl={video.videoUrl}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
      />
    </div>
  );
};

export default function VideoGrid({ videos = [] }: { videos?: VideoType[] }) {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [playingVideos, setPlayingVideos] = useState(new Set<string>());

  const isAnyVideoPlaying = playingVideos.size > 0;

  const toggleVideoPlay = (videoId: string) => {
    setPlayingVideos(prev => {
      const newSet = new Set(prev);

      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.clear();
        newSet.add(videoId);
      }

      return newSet;
    });
  };

 

  // If no videos, show empty state
  if (videos.length === 0) {
    return <div className="flex items-center justify-center h-screen">No videos found</div>;
  }

  const columnVideos = [
    videos.slice(0, Math.ceil(videos.length / 3)),
    videos.slice(Math.ceil(videos.length / 3), Math.ceil(videos.length / 3) * 2),
    videos.slice(Math.ceil(videos.length / 3) * 2)
  ];

  const mobileVideos = videos.slice(0, Math.min(3, videos.length));

  return (
    <>
      <style jsx global>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        @keyframes scrollUpFast {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .scroll-up { animation: scrollUp 45s linear infinite; }
        .scroll-down { animation: scrollDown 45s linear infinite; }
        .scroll-up-fast { animation: scrollUpFast 35s linear infinite; }
      `}</style>

      <div className="block lg:hidden w-full h-full overflow-hidden">
        <div className="flex gap-3 overflow-x-auto pb-4 px-4 snap-x snap-mandatory">
          {mobileVideos.map(video => (
            <MobileVideoItem
              key={video.id}
              video={video}
              isPlaying={playingVideos.has(video.id)}
              togglePlay={toggleVideoPlay}
            />
          ))}
        </div>
      </div>

      <div className="hidden lg:grid grid-cols-3 gap-4 h-screen mr-6">
        {columnVideos.map((videos, index) => (
          <VideoColumn
            key={`column-${index + 1}`}
            videos={videos}
            columnIndex={index}
            hoveredCol={hoveredCol}
            isAnyPlaying={isAnyVideoPlaying}
            playingVideos={playingVideos}
            togglePlay={toggleVideoPlay}
            onMouseEnter={() => setHoveredCol(index)}
            onMouseLeave={() => setHoveredCol(null)}
          />
        ))}
      </div>
    </>
  );
}