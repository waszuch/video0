"use client";

import { useEffect, useRef } from "react";

export const MouseEventGlow = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    
    let dots: { x: number; y: number; size: number }[] = [];
    
    const createDots = () => {
      dots = [];
      const spacing = 5;
      
      for (let x = 0; x < window.innerWidth; x += spacing) {
        for (let y = 0; y < window.innerHeight; y += spacing) {
          dots.push({ x, y, size: 0.25 });
        }
      }
    };
    
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      createDots();
      renderDots();
    };
    
    const renderDots = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      const hue = 210;
      const saturation = 60;
      const lightness = 65;
      const opacity = 0.7;
      
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
      
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    
    window.addEventListener("resize", resizeCanvas);
    
    resizeCanvas();
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none"
    />
  );
}; 