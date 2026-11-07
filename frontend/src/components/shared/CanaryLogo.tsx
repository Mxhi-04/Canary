'use client';

import React from 'react';
import Image from 'next/image';

interface CanaryLogoProps {
  variant?: 'full' | 'mark';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  priority?: boolean;
}

export const CanaryLogo: React.FC<CanaryLogoProps> = ({
  variant = 'full',
  size = 'md',
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
    };

    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1E1E20] to-[#161617] p-1 border border-[#F2A33A]/30 shadow-amber-glow ${sizeMap[size]} ${className}`}
      >
        <Image
          src="/images/canary-mark.png"
          alt="Canary Mark"
          width={96}
          height={96}
          priority={priority}
          className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(242,163,58,0.35)]"
        />
      </div>
    );
  }

  // Full Wordmark Logo with Bird on Branch
  const heightMap = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-11',
    xl: 'h-14',
    hero: 'h-20 md:h-28',
  };

  return (
    <div className={`relative inline-flex items-center ${heightMap[size]} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/canary-logo.png"
        alt="Canary — Population & Workforce Health Early-Warning"
        className="h-full w-auto object-contain filter drop-shadow-[0_2px_12px_rgba(242,163,58,0.25)] select-none"
      />
    </div>
  );
};
