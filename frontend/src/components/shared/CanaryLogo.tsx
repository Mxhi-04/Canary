'use client';

import React from 'react';
import Image from 'next/image';

interface CanaryLogoProps {
  variant?: 'full' | 'mark';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'massive';
  glow?: boolean | 'metallic' | 'subtle';
  className?: string;
  priority?: boolean;
}

export const CanaryLogo: React.FC<CanaryLogoProps> = ({
  variant = 'full',
  size = 'md',
  glow = false,
  className = '',
  priority = false,
}) => {
  if (variant === 'mark') {
    // Bird perched on branch emblem icon
    const sizeMap = {
      sm: 'w-7 h-7',
      md: 'w-9 h-9',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
      hero: 'w-24 h-24',
      massive: 'w-32 h-32',
    };

    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1E1E20] to-[#161617] p-1 border border-[#F2A33A]/30 shadow-amber-glow ${sizeMap[size]} ${className}`}
      >
        {/* Metallic Halo Glow if enabled */}
        {glow && (
          <div className="absolute inset-0 bg-[#F2A33A]/20 blur-md rounded-xl pointer-events-none" />
        )}
        <Image
          src="/images/canary-mark.png"
          alt="Canary Mark"
          width={128}
          height={128}
          priority={priority}
          className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(242,163,58,0.45)]"
        />
      </div>
    );
  }

  // Full Wordmark Logo with Bird on Branch
  const heightMap = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-11',
    xl: 'h-16',
    hero: 'h-24 sm:h-32 md:h-40 lg:h-48',
    massive: 'h-32 sm:h-44 md:h-56',
  };

  const getGlowFilterClass = () => {
    if (glow === 'metallic' || glow === true) {
      return 'filter drop-shadow-[0_0_2px_rgba(255,235,170,0.95)] drop-shadow-[0_4px_16px_rgba(242,163,58,0.55)] drop-shadow-[0_8px_36px_rgba(232,193,74,0.35)] brightness-[1.08] contrast-[1.05]';
    }
    if (glow === 'subtle') {
      return 'filter drop-shadow-[0_2px_12px_rgba(242,163,58,0.35)]';
    }
    return 'filter drop-shadow-[0_2px_10px_rgba(242,163,58,0.25)]';
  };

  return (
    <div className={`relative inline-flex items-center ${heightMap[size]} ${className}`}>
      {/* Ambient Metallic Golden Backdrop Bloom for 'metallic' glow */}
      {(glow === 'metallic' || glow === true) && (
        <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-[#F2A33A]/20 via-[#E8C14A]/15 to-transparent rounded-full blur-3xl pointer-events-none opacity-80" />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/canary-logo.png"
        alt="Canary — Population & Workforce Health Early-Warning"
        className={`relative z-10 h-full w-auto object-contain select-none transition-all duration-300 ${getGlowFilterClass()}`}
      />
    </div>
  );
};
