'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollFrameCanvasProps {
  progress: number; // 0 to 1
  className?: string;
  onFramesLoaded?: (total: number) => void;
}

const TOTAL_FRAMES = 15;

export const ScrollFrameCanvas: React.FC<ScrollFrameCanvasProps> = ({
  progress,
  className = '',
  onFramesLoaded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(progress);
  const animFrameRef = useRef<number | null>(null);

  targetProgressRef.current = progress;

  // Preload all 15 frames
  useEffect(() => {
    let mounted = true;
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      // Use high-quality 95% JPG for instant streaming, falling back to PNG if needed
      img.src = `/frames/frame_${frameNum}.jpg`;

      img.onload = () => {
        if (!mounted) return;
        loaded++;
        setLoadedCount(loaded);
        if (loaded === 1) {
          // Immediately draw first frame so there's never a blank screen
          drawFrame(0, 0);
          setIsReady(true);
        }
        if (loaded === TOTAL_FRAMES) {
          setIsReady(true);
          if (onFramesLoaded) onFramesLoaded(TOTAL_FRAMES);
        }
      };

      img.onerror = () => {
        // Fallback to PNG if JPG not available
        img.src = `/frames/frame_${frameNum}.png`;
      };

      images.push(img);
    }

    imagesRef.current = images;

    return () => {
      mounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Draw frame with object-cover aspect ratio scaling and sub-frame alpha blending
  const drawFrame = (baseIdx: number, nextIdx: number, blend: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = imagesRef.current[baseIdx];
    if (!baseImg || !baseImg.complete) return;

    const w = canvas.width;
    const h = canvas.height;

    // Calculate aspect-ratio covering dimensions (object-cover)
    const imgRatio = baseImg.width / baseImg.height;
    const canvasRatio = w / h;

    let renderW = w;
    let renderH = h;
    let renderX = 0;
    let renderY = 0;

    if (canvasRatio > imgRatio) {
      renderH = w / imgRatio;
      renderY = (h - renderH) / 2;
    } else {
      renderW = h * imgRatio;
      renderX = (w - renderW) / 2;
    }

    // Draw base frame
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 1.0;
    ctx.drawImage(baseImg, renderX, renderY, renderW, renderH);

    // Cross-fade with next frame for fluid cinematic interpolation
    if (blend > 0.005 && nextIdx !== baseIdx) {
      const nextImg = imagesRef.current[nextIdx];
      if (nextImg && nextImg.complete) {
        ctx.globalAlpha = blend;
        ctx.drawImage(nextImg, renderX, renderY, renderW, renderH);
        ctx.globalAlpha = 1.0;
      }
    }
  };

  // Canvas size synchronization with high DPI support
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Re-render current frame immediately after resize
      const floatIndex = currentProgressRef.current * (TOTAL_FRAMES - 1);
      const baseIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(floatIndex)));
      const nextIndex = Math.min(TOTAL_FRAMES - 1, baseIndex + 1);
      const blend = floatIndex - baseIndex;
      drawFrame(baseIndex, nextIndex, blend);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [isReady]);

  // Buttery smooth lerp animation loop (runs at native 60fps/120fps display refresh)
  useEffect(() => {
    const loop = () => {
      const target = Math.max(0, Math.min(1, targetProgressRef.current));
      const current = currentProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.0001) {
        // Damping factor (0.16) gives instant responsiveness with subtle momentum
        currentProgressRef.current += diff * 0.16;

        const floatIndex = currentProgressRef.current * (TOTAL_FRAMES - 1);
        const baseIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(floatIndex)));
        const nextIndex = Math.min(TOTAL_FRAMES - 1, baseIndex + 1);
        const blend = floatIndex - baseIndex;

        drawFrame(baseIndex, nextIndex, blend);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isReady]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover select-none pointer-events-none"
      />

      {/* Subtle Loading Spinner if initial frame is still loading */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-canvas-deep">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-canary-amber border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-canary-text-3 font-mono">
              Loading frames ({loadedCount}/{TOTAL_FRAMES})...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
