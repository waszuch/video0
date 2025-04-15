"use client";

import { useEffect, useRef } from "react";

export const MouseEventGlow = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);
  const animTimeRef = useRef<number>(0);
  
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
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };
    
    const calculateGlow = (distance: number, maxDistance: number) => {
      const rawGlow = Math.max(0, 1 - distance / maxDistance);
      return rawGlow * rawGlow * (3 - 2 * rawGlow);
    };
    
    const renderDot = (dot: typeof dots[0], glowCenterX: number, glowCenterY: number, maxDistance: number) => {
      const angle = Math.atan2(dot.y - glowCenterY, dot.x - glowCenterX);
      const waveEffect = 1 + 0.2 * Math.sin(angle * 3 + animTimeRef.current * 2);
      
      const dx = dot.x - glowCenterX;
      const dy = dot.y - glowCenterY;
      const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) * waveEffect);
      
      const easedGlow = calculateGlow(distance, maxDistance);
      
      const hue = 210 + easedGlow * 5 + 5 * Math.sin(animTimeRef.current);
      const saturation = 60 + easedGlow * 5;
      const lightness = 65 + easedGlow * 10;
      
      const size = dot.size * (1 + easedGlow * 0.25 * waveEffect);
      const opacity = 0.7 + 0.2 * easedGlow;
      
      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
      ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
      ctx.fill();
    };
    
    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateTimeRef.current < 33) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastUpdateTimeRef.current = timestamp;
      animTimeRef.current += 0.01;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      const glowCenterX = mousePosition.current.x + Math.sin(animTimeRef.current) * 30;
      const glowCenterY = mousePosition.current.y + Math.cos(animTimeRef.current * 1.3) * 20;
      const maxDistance = 200 * (1 + 0.1 * Math.sin(animTimeRef.current));
      
      dots.forEach(dot => renderDot(dot, glowCenterX, glowCenterY, maxDistance));
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    
    resizeCanvas();
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none"
    />
  );
}; 