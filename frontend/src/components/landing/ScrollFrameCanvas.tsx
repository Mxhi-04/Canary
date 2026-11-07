'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollFrameCanvasProps {
  progress: number; // 0 to 1
  className?: string;
  onFramesLoaded?: (total: number) => void;
}

const TOTAL_FRAMES = 190; // All 190 native frames from 1080p 24fps master

export const ScrollFrameCanvas: React.FC<ScrollFrameCanvasProps> = ({
  progress,
  className = '',
  onFramesLoaded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(progress);
  const animFrameRef = useRef<number | null>(null);
  const needsRenderRef = useRef<boolean>(true);
  const lastRenderedIndexRef = useRef<number>(-1);

  targetProgressRef.current = progress;

  // Progressive Smart Frame Loader
  useEffect(() => {
    let mounted = true;
    const images: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES).fill(null);
    let loaded = 0;

    const loadSingleFrame = (idx: number): Promise<void> => {
      return new Promise((resolve) => {
        if (!mounted) return resolve();
        if (images[idx] && images[idx]?.complete) return resolve();

        const img = new Image();
        img.decoding = 'async';
        const frameNum = String(idx).padStart(3, '0');

        img.onload = () => {
          if (!mounted) return resolve();
          images[idx] = img;
          loaded++;
          setLoadedCount(loaded);
          needsRenderRef.current = true;

          if (idx === 0 || loaded >= 5) {
            setIsReady(true);
          }
          if (loaded === TOTAL_FRAMES && onFramesLoaded) {
            onFramesLoaded(TOTAL_FRAMES);
          }
          resolve();
        };

        img.onerror = () => {
          // Fallback to JPG if WebP fails
          const fallback = new Image();
          fallback.onload = () => {
            if (!mounted) return resolve();
            images[idx] = fallback;
            loaded++;
            setLoadedCount(loaded);
            needsRenderRef.current = true;
            if (idx === 0 || loaded >= 5) setIsReady(true);
            resolve();
          };
          fallback.onerror = () => resolve();
          fallback.src = `/frames/frame_${frameNum}.jpg`;
        };

        img.src = `/frames/frame_${frameNum}.webp`;
      });
    };

    // 3-Stage Tiered Loading Strategy:
    // 1. Instantly load first frame for zero-latency initial paint
    // 2. Load sparse keyframes (every 4th frame = 48 frames) to cover entire timeline in ~150ms
    // 3. Progressively fill all remaining intermediate frames for ultra-dense 24fps motion
    const loadAllProgressively = async () => {
      // Step 1: First frame
      await loadSingleFrame(0);

      // Step 2: Keyframes across the full timeline
      const keyframeIndices: number[] = [];
      for (let i = 4; i < TOTAL_FRAMES; i += 4) {
        keyframeIndices.push(i);
      }
      // Load keyframes in small batches of 6
      for (let i = 0; i < keyframeIndices.length; i += 6) {
        if (!mounted) break;
        const batch = keyframeIndices.slice(i, i + 6);
        await Promise.all(batch.map((idx) => loadSingleFrame(idx)));
      }

      // Step 3: Dense intermediate fill
      const remainingIndices: number[] = [];
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        if (i % 4 !== 0) remainingIndices.push(i);
      }
      for (let i = 0; i < remainingIndices.length; i += 8) {
        if (!mounted) break;
        const batch = remainingIndices.slice(i, i + 8);
        await Promise.all(batch.map((idx) => loadSingleFrame(idx)));
      }
    };

    imagesRef.current = images;
    loadAllProgressively();

    return () => {
      mounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [onFramesLoaded]);

  // Find nearest loaded frame if current target frame is still streaming in
  const findBestAvailableImage = (targetIndex: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    if (images[targetIndex] && images[targetIndex]?.complete && images[targetIndex]!.naturalWidth > 0) {
      return images[targetIndex];
    }

    // Search outwards for closest loaded frame
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 0 && images[prev]?.complete && images[prev]!.naturalWidth > 0) {
        return images[prev];
      }
      const next = targetIndex + offset;
      if (next < TOTAL_FRAMES && images[next]?.complete && images[next]!.naturalWidth > 0) {
        return images[next];
      }
    }

    return null;
  };

  // Draw frame with object-cover aspect ratio scaling
  // NEVER use alpha cross-fading for motion frames: crisp single-frame drawing prevents ghosting & blur!
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // High-perf opaque canvas
    if (!ctx) return;

    const img = findBestAvailableImage(frameIndex);
    if (!img) return;

    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;

    // Aspect-ratio covering dimensions (object-cover)
    const imgRatio = img.width / img.height;
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

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, renderX, renderY, renderW, renderH);
    lastRenderedIndexRef.current = frameIndex;
  };

  // Canvas size synchronization with Retina / High-DPI support
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      needsRenderRef.current = true;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Silky smooth lerp animation loop (runs at native 60fps/120fps display refresh)
  useEffect(() => {
    const loop = () => {
      const target = Math.max(0, Math.min(1, targetProgressRef.current));
      const current = currentProgressRef.current;
      const diff = target - current;

      const absDiff = Math.abs(diff);
      if (absDiff > 0.00005) {
        // High-performance adaptive lerp:
        // Snappy 0.32 response when scrolling for instantaneous video-like tracking with ZERO latency,
        // settling smoothly into keyframes at native 60fps/120fps display refresh rate.
        const factor = absDiff > 0.04 ? 0.36 : 0.26;
        currentProgressRef.current += diff * factor;
        if (absDiff < 0.0003) {
          currentProgressRef.current = target;
        }
        needsRenderRef.current = true;
      }

      if (needsRenderRef.current) {
        const floatIndex = currentProgressRef.current * (TOTAL_FRAMES - 1);
        const targetFrameIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.round(floatIndex))
        );

        if (targetFrameIndex !== lastRenderedIndexRef.current || !lastRenderedIndexRef.current) {
          drawFrame(targetFrameIndex);
        }

        if (Math.abs(diff) <= 0.00005) {
          needsRenderRef.current = false;
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* High-Performance Canvas Element */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover select-none pointer-events-none"
      />

      {/* Frame Loading Telemetry Indicator (Subtle Top-Right Badge) */}
      <div className="absolute top-20 right-6 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-canvas-deep/80 backdrop-blur-md border border-border text-[10px] font-mono text-canary-text-3">
          <span className="w-1.5 h-1.5 rounded-full bg-canary-amber animate-pulse" />
          <span>1080p Video Sync: {loadedCount}/{TOTAL_FRAMES} frames</span>
        </div>
      </div>

      {/* Loading Overlay (Only if first frame is not ready yet) */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-canvas-deep z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-canary-amber border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-canary-text-2 font-mono">
              Synchronizing 1080p cinematic stream...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
