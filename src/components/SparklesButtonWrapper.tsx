"use client";

import React, { useState } from "react";
import type { ReactNode } from "react";
import { SparklesCore } from "@/components/ui/sparkles";

export function SparklesButtonWrapper({ children }: { children: ReactNode }) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div 
      className="relative w-auto"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className={`relative z-10 ${isHovering ? 'shadow-xl shadow-purple-500/50 scale-105' : ''} transition-all duration-300`}>
        {children}
      </div>

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
} 