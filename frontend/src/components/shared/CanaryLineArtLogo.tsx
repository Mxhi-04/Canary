'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CanaryLineArtLogoProps {
  className?: string;
  size?: 'md' | 'lg' | 'xl' | 'hero';
  replayOnHover?: boolean;
  priority?: boolean;
}

export const CanaryLineArtLogo: React.FC<CanaryLineArtLogoProps> = ({
  className = '',
  size = 'hero',
  replayOnHover = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isDrawn, setIsDrawn] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1, rootMargin: '60px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView) {
      setIsDrawn(false);
      const timer = setTimeout(() => {
        setIsDrawn(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isInView, replayKey]);

  const handleHover = () => {
    if (!replayOnHover || !isDrawn) return;
    setIsDrawn(false);
    setReplayKey((k) => k + 1);
  };

  const heightMap = {
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-18 sm:h-22',
    hero: 'h-20 sm:h-24 md:h-28 lg:h-32',
  };

  // Paths extracted from canary-logo.png
  const paths = [
    {
      id: 'C',
      d: 'M 44,38 L 32,44 L 26,49 L 21,56 L 18,62 L 17,71 L 16,72 L 16,78 L 17,79 L 18,88 L 23,97 L 32,106 L 44,112 L 54,113 L 55,114 L 63,114 L 64,113 L 69,113 L 76,111 L 85,106 L 90,100 L 89,99 L 85,103 L 78,107 L 72,109 L 67,109 L 66,110 L 52,109 L 51,108 L 48,108 L 41,104 L 32,95 L 27,85 L 27,81 L 26,80 L 27,65 L 29,59 L 35,50 L 44,43 L 52,40 L 55,40 L 56,39 L 68,39 L 69,40 L 72,40 L 82,44 L 89,50 L 90,50 L 90,45 L 79,39 L 67,37 L 66,36 L 53,36 L 52,37 Z',
      duration: 750,
      delay: 0,
    },
    {
      id: 'a1',
      d: 'M 108,68 L 105,71 L 106,73 L 110,69 L 116,66 L 119,66 L 120,65 L 131,66 L 138,72 L 139,80 L 134,82 L 123,82 L 122,83 L 115,84 L 107,88 L 102,94 L 102,104 L 103,106 L 108,111 L 117,114 L 128,113 L 133,111 L 138,107 L 139,108 L 139,112 L 147,112 L 147,109 L 148,108 L 148,98 L 147,97 L 147,74 L 146,71 L 140,65 L 131,62 L 118,63 Z M 138,84 L 139,85 L 139,103 L 137,106 L 129,110 L 118,110 L 112,106 L 110,101 L 110,96 L 111,93 L 117,87 L 127,84 Z',
      duration: 650,
      delay: 200,
    },
    {
      id: 'n',
      d: 'M 211,70 L 207,66 L 198,62 L 185,63 L 180,65 L 174,70 L 172,63 L 165,63 L 164,64 L 164,112 L 173,112 L 173,76 L 180,68 L 184,66 L 196,66 L 203,72 L 206,79 L 206,112 L 214,112 L 214,77 Z',
      duration: 600,
      delay: 400,
    },
    {
      id: 'a2',
      d: 'M 234,68 L 231,71 L 232,73 L 236,69 L 242,66 L 245,66 L 246,65 L 254,65 L 257,66 L 264,72 L 265,74 L 265,80 L 260,82 L 249,82 L 248,83 L 238,85 L 233,88 L 228,95 L 228,104 L 229,106 L 234,111 L 242,114 L 254,113 L 259,111 L 264,107 L 265,108 L 265,112 L 274,112 L 274,78 L 272,71 L 266,65 L 257,62 L 244,63 Z M 264,84 L 265,85 L 265,103 L 261,107 L 255,110 L 244,110 L 238,106 L 236,102 L 236,95 L 240,89 L 247,85 Z',
      duration: 650,
      delay: 600,
    },
    {
      id: 'r',
      d: 'M 318,62 L 310,63 L 306,65 L 300,71 L 299,70 L 299,63 L 292,63 L 291,64 L 291,112 L 299,112 L 299,77 L 305,69 L 309,67 L 318,67 L 321,68 L 322,67 L 322,64 Z',
      duration: 550,
      delay: 800,
    },
    {
      id: 'y_bird',
      d: 'M 519,46 L 513,47 L 506,50 L 503,53 L 500,59 L 494,64 L 491,63 L 463,63 L 462,64 L 444,66 L 443,65 L 443,61 L 444,60 L 449,60 L 460,56 L 466,51 L 470,45 L 471,35 L 469,28 L 473,23 L 477,22 L 477,21 L 475,21 L 471,18 L 465,16 L 460,17 L 456,20 L 453,27 L 453,30 L 443,40 L 431,59 L 422,68 L 418,70 L 422,70 L 429,66 L 431,66 L 440,60 L 442,61 L 442,67 L 441,68 L 428,71 L 411,79 L 409,79 L 379,97 L 360,112 L 359,112 L 358,110 L 381,64 L 378,63 L 360,100 L 358,101 L 349,86 L 337,63 L 329,63 L 331,69 L 333,71 L 340,86 L 342,88 L 350,105 L 354,111 L 348,120 L 340,128 L 333,133 L 322,138 L 319,138 L 314,140 L 310,140 L 309,141 L 294,141 L 297,141 L 298,142 L 315,142 L 331,137 L 346,128 L 381,100 L 396,91 L 399,88 L 421,77 L 426,76 L 437,71 L 440,71 L 443,69 L 447,69 L 448,68 L 452,68 L 458,66 L 466,66 L 467,65 L 491,65 L 492,66 L 498,66 L 499,67 L 506,68 L 507,70 L 511,73 L 517,76 L 527,76 L 522,71 L 518,69 L 508,67 L 504,65 L 499,65 L 495,63 L 500,60 L 506,60 L 513,57 L 517,52 Z',
      duration: 1100,
      delay: 950,
    },
  ];

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleHover}
      className={`relative inline-flex items-center cursor-pointer select-none ${heightMap[size]} ${className}`}
      title="Click or hover to replay line art drawing"
      onClick={() => setReplayKey((k) => k + 1)}
    >
      {/* Ambient Metallic Golden Backdrop Bloom */}
      <div
        className={`absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-[#F2A33A]/25 via-[#EDCB63]/20 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
          isDrawn ? 'opacity-90 scale-105' : 'opacity-40 scale-95'
        }`}
      />

      {/* SVG Animated Line Art Canvas */}
      <svg
        key={replayKey}
        viewBox="0 0 543 158"
        className="relative z-10 h-full w-auto overflow-visible"
        style={{
          filter: 'drop-shadow(0 2px 14px rgba(242, 163, 58, 0.45)) drop-shadow(0 0 4px rgba(255, 230, 160, 0.7))',
        }}
      >
        <defs>
          {/* Luminous Golden Stroke Gradient */}
          <linearGradient id="canaryLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2C2" />
            <stop offset="35%" stopColor="#F2A33A" />
            <stop offset="70%" stopColor="#EDCB63" />
            <stop offset="100%" stopColor="#F59A4A" />
          </linearGradient>

          {/* Rich Metallic Fill Gradient */}
          <linearGradient id="canaryFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE79A" />
            <stop offset="40%" stopColor="#F2A33A" />
            <stop offset="85%" stopColor="#D48B25" />
            <stop offset="100%" stopColor="#9E6110" />
          </linearGradient>
        </defs>

        {/* Traced Golden Line Art Strokes */}
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            pathLength="1000"
            fill="url(#canaryFillGrad)"
            stroke="url(#canaryLineGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: isInView ? 0 : 1000,
              fillOpacity: isDrawn ? 1 : 0,
              transition: isInView
                ? `stroke-dashoffset ${p.duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${p.delay}ms, fill-opacity 700ms ease-out 1800ms`
                : 'none',
            }}
          />
        ))}
      </svg>

      {/* High-Fidelity Metallic Overlay crossfade */}
      <div
        className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-700 ease-out ${
          isDrawn ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/canary-logo.png"
          alt="Canary"
          className="h-full w-auto object-contain filter drop-shadow-[0_0_2px_rgba(255,235,170,0.95)] drop-shadow-[0_4px_16px_rgba(242,163,58,0.55)]"
        />
      </div>
    </div>
  );
};
