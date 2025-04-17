"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";

export default function VideoGrid() {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [playingVideos, setPlayingVideos] = useState(new Set<string>());
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const isColumnPlaying = (colNumber: number) => {
    return Array.from(playingVideos).some(videoId => {
      return videoId.includes(`video${colNumber * 2 - 1}`) || 
             videoId.includes(`video${colNumber * 2}`);
    });
  };

  const toggleVideoPlay = (videoId: string) => {
    const videoElement = document.getElementById(videoId) as HTMLVideoElement | null;
    
    if (!videoElement) return;

    const isCurrentlyPlaying = playingVideos.has(videoId);
    
    if (isCurrentlyPlaying) {
      videoElement.pause();
      setPlayingVideos((prev) => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } else {
      playingVideos.forEach(playingId => {
        if (playingId !== videoId) {
          const playingElement = document.getElementById(playingId) as HTMLVideoElement | null;
          if (playingElement && !playingElement.paused) {
            playingElement.pause();
          }
        }
      });
      
      videoElement.muted = true;
      
      const playPromise = videoElement.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayingVideos(new Set([videoId]));
          })
          .catch((err) => {
            if (err.name === 'NotAllowedError') {
              const playAgain = () => {
                videoElement.play()
                  .then(() => {
                    setPlayingVideos(new Set([videoId]));
                    document.removeEventListener('click', playAgain);
                  });
              };
              
              document.addEventListener('click', playAgain, { once: true });
              alert("Browser blocked autoplay. Click anywhere to play video.");
            }
          });
      }
    }
  };

  const handleColumnMouseEnter = (colNumber: number) => {
    setHoveredCol(colNumber);
  };

  const handleColumnMouseLeave = () => {
    setHoveredCol(null);
  };

  interface VideoItemProps {
    id: string;
    thumbnail: string;
    isVertical?: boolean;
  }

  const VideoItem = ({ id, thumbnail, isVertical = false }: VideoItemProps) => {
    const isPlaying = playingVideos.has(id);
    const [videoPosition, setVideoPosition] = useState(0);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    
    useEffect(() => {
      if (videoRef.current && !isInitialized) {
        setIsInitialized(true);
      }
    }, [isInitialized]);
    
    useEffect(() => {
      if (videoRef.current) {
        if (isPlaying) {
          if (videoPosition > 0) {
            videoRef.current.currentTime = videoPosition;
          }
          
          videoRef.current.play().catch(() => {});
        } else if (!videoRef.current.paused) {
          setVideoPosition(videoRef.current.currentTime);
          videoRef.current.pause();
        }
      }
    }, [isPlaying, id]);

    useEffect(() => {
      let timerId: NodeJS.Timeout | undefined;
      
      if (isPlaying && videoRef.current) {
        timerId = setInterval(() => {
          if (videoRef.current) {
            setVideoPosition(videoRef.current.currentTime);
          }
        }, 1000);
      }
      
      return () => {
        if (timerId) clearInterval(timerId);
      };
    }, [isPlaying]);

    const dimensionsClass = isVertical ? "aspect-[1/2]" : "aspect-[3/2]";

    return (
      <div className={`w-full relative rounded-lg overflow-hidden ${dimensionsClass}`}>
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
          onMouseEnter={() => setHoveredImage(id)}
          onMouseLeave={() => setHoveredImage(null)}
        >
          <div className={`w-full h-full`}> 
            <Image
              src={thumbnail}
              alt="Video thumbnail"
              fill
              className="object-cover"
              priority
            />
          </div>
          <button
            className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg cursor-pointer group"
            onClick={() => toggleVideoPlay(id)}
            style={{ pointerEvents: isPlaying ? 'none' : 'auto' }}
          >
            <div className="bg-black/80 border border-white/10 relative rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden w-16 h-16">
              <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(126,34,206,0.4)_0%,rgba(126,34,206,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 w-0 h-0 border-t-transparent border-b-transparent ml-1 transition-all duration-300 border-t-8 border-b-8 border-l-16 border-l-purple-500 group-hover:border-l-white group-hover:animate-juggle"></div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-purple-600/0 via-purple-600/90 to-purple-600/0 transition-opacity duration-500 opacity-0 group-hover:opacity-40" />
            </div>
          </button>
        </div>

        <div className={`absolute inset-0 transition-opacity duration-300 ${isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <div className={`w-full h-full`}>
            <video
              id={id}
              ref={videoRef}
              src="/video.mp4"
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              preload="auto"
              onPause={() => {
                if (videoRef.current) {
                  setVideoPosition(videoRef.current.currentTime);
                }
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          {isPlaying && (
            <button
              className="absolute inset-0 flex items-center justify-center bg-transparent cursor-pointer"
              onClick={() => toggleVideoPlay(id)}
              aria-label="Pause video"
            />
          )}
        </div>
      </div>
    );
  };

  const column1Videos = [
    { id: "video1", thumbnail: "/homevertical.png", isVertical: true },
    { id: "video2", thumbnail: "/homehorizontal.png", isVertical: false },
  ];
  const column2Videos = [
    { id: "video3", thumbnail: "/homehorizontal.png", isVertical: false },
    { id: "video4", thumbnail: "/homevertical.png", isVertical: true },
  ];
  const column3Videos = [
    { id: "video5", thumbnail: "/homevertical.png", isVertical: true },
    { id: "video6", thumbnail: "/homehorizontal.png", isVertical: false },
  ];

  const mobileVideos = [
    { id: "mobile1", thumbnail: "/homevertical.png", isVertical: true },
    { id: "mobile2", thumbnail: "/homevertical.png", isVertical: true },
    { id: "mobile3", thumbnail: "/homevertical.png", isVertical: true },
  ];

  const createScrollContent = (videos: typeof column1Videos) => {
    const elements: React.ReactNode[] = [];
    for (let set = 0; set < 8; set++) {
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

  const MobileVideoItem = ({ video }: { video: (typeof mobileVideos)[0] }) => {
    const isPlaying = playingVideos.has(video.id);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (videoRef.current) {
        if (isPlaying && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        } else if (!isPlaying && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      }
    }, [isPlaying, video.id]);

    return (
      <div key={video.id} className="flex-none w-[45%] snap-center">
        <div className="w-full rounded-lg overflow-hidden aspect-[1/2] relative">
          <div className={`relative w-full h-full ${isPlaying ? 'hidden' : 'block'}`}>
            <Image
              src={video.thumbnail}
              alt="Video thumbnail"
              width={200}
              height={400}
              className="w-full h-full object-cover"
            />
            <button
              className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg cursor-pointer group active:bg-black/30"
              onClick={() => toggleVideoPlay(video.id)}
            >
              <div className="bg-black/80 border border-white/10 relative rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden w-12 h-12">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(126,34,206,0.4)_0%,rgba(126,34,206,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 w-0 h-0 border-t-transparent border-b-transparent ml-1 transition-all duration-300 border-t-6 border-b-6 border-l-10 border-l-purple-500 group-hover:border-l-white"></div>
              </div>
            </button>
          </div>
          
          <div className={`w-full h-full ${isPlaying ? "block" : "hidden"}`}>
            <video
              id={video.id}
              ref={videoRef}
              src="/video.mp4"
              width={200}
              height={400}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            {isPlaying && (
              <button
                className="absolute inset-0 flex items-center justify-center bg-transparent rounded-lg cursor-pointer"
                onClick={() => toggleVideoPlay(video.id)}
                aria-label="Pause video"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        @keyframes scrollDown {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes scrollUpFast {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .scroll-up {
          animation: scrollUp 45s linear infinite;
        }
        .scroll-down {
          animation: scrollDown 45s linear infinite;
        }
        .scroll-up-fast {
          animation: scrollUpFast 35s linear infinite;
        }
      `}</style>
      
      <div className="block lg:hidden w-full h-full overflow-hidden">
        <div className="flex gap-3 overflow-x-auto pb-4 px-4 snap-x snap-mandatory">
          {mobileVideos.map((video) => (
            <MobileVideoItem key={video.id} video={video} />
          ))}
        </div>
      </div>
      
      <div className="hidden lg:grid grid-cols-3 gap-4 h-screen mr-6">
        <div
          className="relative overflow-hidden h-full"
          onMouseEnter={() => handleColumnMouseEnter(1)}
          onMouseLeave={() => handleColumnMouseLeave()}
        >
          <div
            className="flex flex-col gap-4 w-full absolute top-0 left-0 right-0 scroll-up"
            style={{ animationPlayState: hoveredCol === 1 || isColumnPlaying(1) ? "paused" : "running" }}
          >
            {createScrollContent(column1Videos)}
          </div>
        </div>

        <div
          className="relative overflow-hidden h-full"
          onMouseEnter={() => handleColumnMouseEnter(2)}
          onMouseLeave={() => handleColumnMouseLeave()}
        >
          <div
            className="flex flex-col gap-4 w-full absolute top-0 left-0 right-0 scroll-down"
            style={{ animationPlayState: hoveredCol === 2 || isColumnPlaying(2) ? "paused" : "running" }}
          >
            {createScrollContent(column2Videos)}
          </div>
        </div>

        <div
          className="relative overflow-hidden h-full"
          onMouseEnter={() => handleColumnMouseEnter(3)}
          onMouseLeave={() => handleColumnMouseLeave()}
        >
          <div
            className="flex flex-col gap-4 w-full absolute top-0 left-0 right-0 scroll-up-fast"
            style={{ animationPlayState: hoveredCol === 3 || isColumnPlaying(3) ? "paused" : "running" }}
          >
            {createScrollContent(column3Videos)}
          </div>
        </div>
      </div>
    </>
  );
}