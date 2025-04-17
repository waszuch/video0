"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { SparklesCore } from "@/components/ui/sparkles";

export const HeroButton = ({
  href,
  children,
  textSize,
}: {
  href: string;
  children: ReactNode;
  textSize?: string;
}) => {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div 
      className="relative w-auto"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link
        href={href}
        className={`bg-black no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-2xl p-px ${textSize || 'text-lg md:text-2xl'} font-semibold leading-6 text-white inline-block mb-8 w-auto z-10 ${isHovering ? 'shadow-xl shadow-purple-500/50' : ''} transition-all duration-300`}
      >
        <span className="absolute inset-0 overflow-hidden rounded-2xl">
          <span className="absolute inset-0 rounded-2xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(126,34,206,0.6)_0%,rgba(126,34,206,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </span>
        <div className="relative flex items-center z-10 rounded-2xl bg-gradient-to-b from-purple-600 to-purple-800 py-4 px-10 ring-1 ring-purple-700/30">
          {children}
        </div>
        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-purple-600/0 via-purple-600/90 to-purple-600/0 transition-all duration-500 group-hover:opacity-80 group-hover:h-[2px] group-hover:w-[calc(100%-1rem)]" />
      </Link>
      
      <div className={`absolute inset-0 w-full h-full z-20 pointer-events-none transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute -inset-2 bg-purple-600/20 rounded-3xl blur-xl"></div>
        
        <SparklesCore
          id="buttonSparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.5}
          particleDensity={120}
          className="w-full h-full"
          particleColor="#d8b4fe"
          speed={0.8}
        />
      </div>
    </div>
  );
}; 