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
      
      videoElement.muted = false;
      
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
    videoUrl: string;
  }

  const VideoItem = ({ id, thumbnail, isVertical = false, videoUrl }: VideoItemProps) => {
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
              src={videoUrl}
              className="w-full h-full object-cover"
              loop
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
  const videos1 = ['https://fqnqeyjbhlesotcxsibt.supabase.co/storage/v1/object/sign/videos/41f86dc6-8e60-4569-ba92-d237aa2f7e24.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzUwOWJjNzhhLThhYzQtNDJkNS1hNTg5LTA1YjUyY2ZhNDQwYyJ9.eyJ1cmwiOiJ2aWRlb3MvNDFmODZkYzYtOGU2MC00NTY5LWJhOTItZDIzN2FhMmY3ZTI0Lm1wNCIsImlhdCI6MTc0NDk0NDQzNCwiZXhwIjozMTU1MzEzNDA4NDM0fQ.iwGp1CGD_7j-7-dcR3Uq4Wz1UUiDLwN2gvT6aSAENJE',
  'https://fqnqeyjbhlesotcxsibt.supabase.co/storage/v1/object/sign/videos/c84e73be-9f43-4c80-936e-02303194ab6b.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzUwOWJjNzhhLThhYzQtNDJkNS1hNTg5LTA1YjUyY2ZhNDQwYyJ9.eyJ1cmwiOiJ2aWRlb3MvYzg0ZTczYmUtOWY0My00YzgwLTkzNmUtMDIzMDMxOTRhYjZiLm1wNCIsImlhdCI6MTc0NDk0NDQ4NywiZXhwIjozMTUzNzcxMzQwODQ4N30.zjEVrLq6dBSqigBX4Hz58XUuwC4Ab8D7DH1lT9w8Gp0']

  
  const video1 = {
    thumbnail:'https://fqnqeyjbhlesotcxsibt.supabase.co/storage/v1/object/sign/images/34a5a816-e3b4-44f4-8c63-bf573fb34ba2.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzUwOWJjNzhhLThhYzQtNDJkNS1hNTg5LTA1YjUyY2ZhNDQwYyJ9.eyJ1cmwiOiJpbWFnZXMvMzRhNWE4MTYtZTNiNC00NGY0LThjNjMtYmY1NzNmYjM0YmEyLmpwZyIsImlhdCI6MTc0NDk0NDc1MSwiZXhwIjozMTUzNjE3MTM0MDg3NTF9.FGNbgicVGk19HrhhNN8dbCzqOMqWkt7pjyPqh3TvWLA',
    videoUrl:'https://fqnqeyjbhlesotcxsibt.supabase.co/storage/v1/object/sign/videos/f4da4c2f-0ff5-47a6-aba6-1b7041305835.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzUwOWJjNzhhLThhYzQtNDJkNS1hNTg5LTA1YjUyY2ZhNDQwYyJ9.eyJ1cmwiOiJ2aWRlb3MvZjRkYTRjMmYtMGZmNS00N2E2LWFiYTYtMWI3MDQxMzA1ODM1Lm1wNCIsImlhdCI6MTc0NDk0NDgzMywiZXhwIjozMTU1MzEzNDA4ODMzfQ.0OoSo1z9IOeLep4cqd1LtKXxWl4sS7j-vAIhh0vIxC4'
  }

  const video2 = {
  videoUrl:'https://fqnqeyjbhlesotcxsibt.supabase.co/storage/v1/object/sign/videos/93ec3d31-3544-416b-bb36-0eec718a87c4.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzUwOWJjNzhhLThhYzQtNDJkNS1hNTg5LTA1YjUyY2ZhNDQwYyJ9.eyJ1cmwiOiJ2aWRlb3MvOTNlYzNkMzEtMzU0NC00MTZiLWJiMzYtMGVlYzcxOGE4N2M0Lm1wNCIsImlhdCI6MTc0NDk0NTI4NiwiZXhwIjozMTU1MzEzNDA5Mjg2fQ.yUHwoc-2-nE-xfuTeoTIvqsYZ-VhqAIg1Vm8oHbQauk',
  thumbnail:'https://fqnqeyjbhlesotcxsibt.supabase.co/storage/v1/object/sign/images/5ec47f8d-2132-45d8-b714-9ab46d876cbe.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzUwOWJjNzhhLThhYzQtNDJkNS1hNTg5LTA1YjUyY2ZhNDQwYyJ9.eyJ1cmwiOiJpbWFnZXMvNWVjNDdmOGQtMjEzMi00NWQ4LWI3MTQtOWFiNDZkODc2Y2JlLmpwZyIsImlhdCI6MTc0NDk0NTM2NiwiZXhwIjozMTUzNzcxMzQwOTM2Nn0.Z5XgftcD4Bsr1X0GJ6sLLe2SFfMEiYnZUTVTVu6slGE'}

  const video3 = {  
    videoUrl:'https://fqnqeyjbhlesotcxsibt.supabase.co/storage/v1/object/sign/videos/e32651c4-32e7-43ee-a4a5-65ef310d7ac4.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzUwOWJjNzhhLThhYzQtNDJkNS1hNTg5LTA1YjUyY2ZhNDQwYyJ9.eyJ1cmwiOiJ2aWRlb3MvZTMyNjUxYzQtMzJlNy00M2VlLWE0YTUtNjVlZjMxMGQ3YWM0Lm1wNCIsImlhdCI6MTc0NDk0NTQ5OSwiZXhwIjozMTUzNzcxMzQwOTQ5OX0.v86BmQwqjI783WENX3DGDsesjpWcKEtVQWRmFXtfV7s',
    thumbnail:'https://fqnqeyjbhlesotcxsibt.supabase.co/storage/v1/object/sign/images/334ab3a9-3379-43ef-8cc4-b871bad40e85.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzUwOWJjNzhhLThhYzQtNDJkNS1hNTg5LTA1YjUyY2ZhNDQwYyJ9.eyJ1cmwiOiJpbWFnZXMvMzM0YWIzYTktMzM3OS00M2VmLThjYzQtYjg3MWJhZDQwZTg1LmpwZyIsImlhdCI6MTc0NDk0NTczMCwiZXhwIjozMTcwNzM0MDk3MzB9.w0OpPf0PFDT7QIw_fiyrn8s61qPdJifUT9RJYNc-kss'}

    const video4 = {
      thumbnail:'https://fqnqeyjbhlesotcxsibt.supabase.co/storage/v1/object/sign/images/025c3175-5e7f-4dda-a22c-e26eb5f709d4.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzUwOWJjNzhhLThhYzQtNDJkNS1hNTg5LTA1YjUyY2ZhNDQwYyJ9.eyJ1cmwiOiJpbWFnZXMvMDI1YzMxNzUtNWU3Zi00ZGRhLWEyMmMtZTI2ZWI1ZjcwOWQ0LmpwZyIsImlhdCI6MTc0NDk0NTY1MiwiZXhwIjoxNDAxNzczMDkyOTY1Mn0.goRr26sOiyyFbE4NA1Ebck2Atg_CiIC24r3nKmroKP0'
    }


    const video5= {
      thumbnail:'https://fqnqeyjbhlesotcxsibt.supabase.co/storage/v1/object/sign/images/289148c1-b0ca-43c7-9746-5f3a7efc8db9.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzUwOWJjNzhhLThhYzQtNDJkNS1hNTg5LTA1YjUyY2ZhNDQwYyJ9.eyJ1cmwiOiJpbWFnZXMvMjg5MTQ4YzEtYjBjYS00M2M3LTk3NDYtNWYzYTdlZmM4ZGI5LmpwZyIsImlhdCI6MTc0NDk0NTY5MSwiZXhwIjozMTU1MzEzNDA5NjkxfQ.qN6JnEqJ0Qt0hlLgM1Lz4ernI6yX18shmU3hnIXaKzA'
    }

    const video6 = {
      videoUrl:'https://fqnqeyjbhlesotcxsibt.supabase.co/storage/v1/object/sign/videos/e9c764dc-1d97-4479-b787-800cd4683abf.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzUwOWJjNzhhLThhYzQtNDJkNS1hNTg5LTA1YjUyY2ZhNDQwYyJ9.eyJ1cmwiOiJ2aWRlb3MvZTljNzY0ZGMtMWQ5Ny00NDc5LWI3ODctODAwY2Q0NjgzYWJmLm1wNCIsImlhdCI6MTc0NDk0NjIyMiwiZXhwIjoyNjA4ODU5ODIyfQ.AYTxGOMu_nV1jLmF5BHh8fGiJf_ESo8oscCowvwoK8M',
      thumbnail:'https://fqnqeyjbhlesotcxsibt.supabase.co/storage/v1/object/sign/images/7f042255-d169-4b55-8b96-2f333b119a80.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzUwOWJjNzhhLThhYzQtNDJkNS1hNTg5LTA1YjUyY2ZhNDQwYyJ9.eyJ1cmwiOiJpbWFnZXMvN2YwNDIyNTUtZDE2OS00YjU1LThiOTYtMmYzMzNiMTE5YTgwLmpwZyIsImlhdCI6MTc0NDk0NjI1OCwiZXhwIjozMTcwNzM0MTAyNTh9.hYMXMjDnmnHc0sJOk4IflXwJzQMLNPrayQPgWGyp3jk'}

  const column1Videos = [
    { id: "video1", thumbnail: video1.thumbnail, isVertical: true , videoUrl: video1.videoUrl},
    { id: "video2", thumbnail: video2.thumbnail, isVertical: true , videoUrl: video2.videoUrl},
  ];
  const column2Videos = [
    { id: "video3", thumbnail: video3.thumbnail, isVertical: true, videoUrl: video3.videoUrl },
    { id: "video4", thumbnail: video4.thumbnail, isVertical: true, videoUrl: video2.videoUrl },
  ];
  const column3Videos = [
    { id: "video5", thumbnail: video5.thumbnail, isVertical: true, videoUrl: video1.videoUrl },
    { id: "video6", thumbnail: video6.thumbnail, isVertical: true, videoUrl: video6.videoUrl },
  ];

  const mobileVideos = [
    { id: "mobile1", thumbnail: video1.thumbnail, isVertical: true , videoUrl: video1.videoUrl},
    { id: "mobile2", thumbnail: video1.thumbnail, isVertical: true , videoUrl: video1.videoUrl},
    { id: "mobile3", thumbnail: video1.thumbnail, isVertical: true , videoUrl: video1.videoUrl},
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
            videoUrl={video.videoUrl}
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
              quality={50}
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
              src={video.videoUrl}
              width={200}
              height={400}
              className="w-full h-full object-cover"
              loop
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