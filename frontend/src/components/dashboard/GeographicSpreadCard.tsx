'use client';

import React, { useState } from 'react';
import { Map, Layers } from 'lucide-react';

export const GeographicSpreadCard: React.FC = () => {
  const [level, setLevel] = useState<'states' | 'districts' | 'sectors'>('districts');

  return (
    <div className="relative rounded-3xl p-5 overflow-hidden bg-gradient-to-br from-[#1A1A1C] via-[#141416] to-[#0D0D0E] border border-white/10 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold text-canary-text tracking-tight">
          Geographic Spread
        </h2>
        <Map className="w-3.5 h-3.5 text-canary-text-3" />
      </div>

      {/* Choropleth Territory Graphic matching reference image */}
      <div className="relative w-full h-[140px] bg-[#0E0F12] rounded-2xl overflow-hidden flex items-center justify-center border border-white/5 my-auto">
        <svg viewBox="0 0 320 160" className="w-full h-full object-contain select-none">
          {/* Choropleth Polygons tinted in warm amber/brown hues like the reference image */}
          <g stroke="#2C2E35" strokeWidth="0.8">
            {/* North-West */}
            <path d="M 20,20 L 70,25 L 80,60 L 30,55 Z" fill="#6B5232" opacity="0.8" />
            <path d="M 70,25 L 120,28 L 125,65 L 80,60 Z" fill="#917342" opacity="0.85" />
            <path d="M 120,28 L 170,30 L 165,65 L 125,65 Z" fill="#7A5E36" opacity="0.8" />
            <path d="M 170,30 L 220,32 L 215,65 L 165,65 Z" fill="#A88349" opacity="0.9" />
            <path d="M 220,32 L 270,35 L 265,68 L 215,65 Z" fill="#524029" opacity="0.75" />

            {/* Mid-West & Great Lakes */}
            <path d="M 30,55 L 80,60 L 85,95 L 35,90 Z" fill="#C49B55" opacity="0.9" />
            <path d="M 80,60 L 125,65 L 130,100 L 85,95 Z" fill="#E8C14A" opacity="0.95" />
            <path d="M 125,65 L 165,65 L 170,100 L 130,100 Z" fill="#A37E3E" opacity="0.85" />
            <path d="M 165,65 L 215,65 L 210,100 L 170,100 Z" fill="#C49B55" opacity="0.9" />
            <path d="M 215,65 L 265,68 L 270,105 L 210,100 Z" fill="#F2A33A" opacity="1" />

            {/* South & Coast */}
            <path d="M 35,90 L 85,95 L 90,135 L 45,130 Z" fill="#5E472B" opacity="0.75" />
            <path d="M 85,95 L 130,100 L 135,140 L 90,135 Z" fill="#8C6E3D" opacity="0.85" />
            <path d="M 130,100 L 180,102 L 185,145 L 135,140 Z" fill="#DCAE5A" opacity="0.95" />
            <path d="M 180,102 L 230,105 L 225,145 L 185,145 Z" fill="#F08A2E" opacity="0.95" />
            <path d="M 230,105 L 285,110 L 275,145 L 225,145 Z" fill="#7A5E36" opacity="0.8" />
          </g>

          {/* Glowing center indicator */}
          <circle cx="212" cy="85" r="8" fill="#F2A33A" opacity="0.25" className="animate-ping" />
          <circle cx="212" cy="85" r="3" fill="#FFF2C2" stroke="#F2A33A" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Bottom Toggles matching reference (1 States · 2 Districts · 3 Sectors) */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
        <button
          onClick={() => setLevel('states')}
          className={`px-2 py-0.5 rounded-lg transition-colors ${
            level === 'states' ? 'bg-[#F2A33A]/20 text-canary-amber font-bold' : 'text-canary-text-3 hover:text-canary-text'
          }`}
        >
          1 States
        </button>
        <button
          onClick={() => setLevel('districts')}
          className={`px-2 py-0.5 rounded-lg transition-colors ${
            level === 'districts' ? 'bg-[#F2A33A]/20 text-canary-amber font-bold' : 'text-canary-text-3 hover:text-canary-text'
          }`}
        >
          2 Districts
        </button>
        <button
          onClick={() => setLevel('sectors')}
          className={`px-2 py-0.5 rounded-lg transition-colors ${
            level === 'sectors' ? 'bg-[#F2A33A]/20 text-canary-amber font-bold' : 'text-canary-text-3 hover:text-canary-text'
          }`}
        >
          3 Sectors
        </button>
      </div>
    </div>
  );
};

