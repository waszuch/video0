"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AnimatedLogo({ text = "videoO" }: { text?: string }) {
  const [visibleLetters, setVisibleLetters] = useState(0);
  
  useEffect(() => {
    const textLength = text.length;
    let count = 0;
    
    const interval = setInterval(() => {
      count++;
      setVisibleLetters(count);
      
      if (count >= textLength) {
        clearInterval(interval);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [text]);
  
  return (
    <div className="relative font-bold text-2xl flex items-center">
      <div className="mr-2">
        <Image 
          src="/icon.svg" 
          alt="Logo" 
          width={32} 
          height={32}
          className="inline-block"
        />
      </div>
      <div className="font-microgamma">
        {text.split('').map((letter, index) => {
          const isLastBigO = index === text.length - 1 && letter.toLowerCase() === 'o';
          
          return (
            <span 
              key={index}
              className={`inline-block transition-all duration-300 ${
                index < visibleLetters 
                  ? 'opacity-100 transform translate-x-0' 
                  : 'opacity-0 transform -translate-x-4'
              } ${isLastBigO ? 'text-3xl' : ''}`}
              style={{ 
                fontFamily: 'var(--font-microgamma)',
                marginRight: '0.1rem'
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>
    </div>
  );
} 