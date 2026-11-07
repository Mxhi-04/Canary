'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollVideoScrubberProps {
  progress: number; // 0 to 1
  className?: string;
  onReady?: () => void;
}

export const ScrollVideoScrubber: React.FC<ScrollVideoScrubberProps> = ({
  progress,
  className = '',
  onReady,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const durationRef = useRef(7.92);
  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(progress);
  const animFrameRef = useRef<number | null>(null);

  targetProgressRef.current = progress;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        durationRef.current = video.duration;
      }
      setIsReady(true);
      if (onReady) onReady();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplaythrough', () => setIsReady(true));

    // Force load video
    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onReady]);

  // Ultra-responsive hardware-accelerated seeking loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loop = () => {
      const target = Math.max(0, Math.min(1, targetProgressRef.current));
      const current = currentProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.0001) {
        currentProgressRef.current += diff * 0.12;
        const targetTime = currentProgressRef.current * durationRef.current;

        // All-intra keyframe seeking
        try {
          const v = video as HTMLVideoElement;
          if ('fastSeek' in v && typeof (v as any).fastSeek === 'function') {
            (v as any).fastSeek(targetTime);
          } else {
            v.currentTime = targetTime;
          }
        } catch {
          const v = video as HTMLVideoElement;
          v.currentTime = targetTime;
        }
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
      <video
        ref={videoRef}
        src="/videos/scroll-animation-intra.mp4"
        preload="auto"
        muted
        playsInline
        className="w-full h-full object-cover select-none pointer-events-none"
      />

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-canvas-deep z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-canary-amber border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-canary-text-2 font-mono">
              Loading 1080p All-Intra Video...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
