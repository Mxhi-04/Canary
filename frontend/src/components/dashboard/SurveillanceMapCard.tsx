'use client';

import React, { useState } from 'react';
import { MonitoringUnit } from '@/lib/types/domain';
import {
  ChevronDown,
  Building2,
  FlaskConical,
  Activity,
  Wind,
  Globe2,
  MapPin,
  Layers,
  Sparkles
} from 'lucide-react';

interface SurveillanceMapCardProps {
  units?: MonitoringUnit[];
  onSelectUnit?: (unit: MonitoringUnit) => void;
  selectedUnitId?: string | null;
}

export const SurveillanceMapCard: React.FC<SurveillanceMapCardProps> = ({
  units = [],
  onSelectUnit,
  selectedUnitId,
}) => {
  const [mapScope, setMapScope] = useState<'global' | 'regional'>('global');
  const [activeFilter, setActiveFilter] = useState<'all' | 'outbreaks' | 'critical'>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  // Global hotspots from reference image
  const globalHotspots = [
    { id: 'g-na-w', label: 'West Coast Hub (California)', x: 135, y: 155, r: 24, cases: '14,210', tier: 'ALERT' },
    { id: 'g-na-e', label: 'East Coast Corridor (New York)', x: 235, y: 145, r: 20, cases: '11,400', tier: 'ALERT' },
    { id: 'g-sa', label: 'South America (São Paulo / Lima)', x: 285, y: 310, r: 26, cases: '18,520', tier: 'ACTION' },
    { id: 'g-eu', label: 'Western Europe (London / Paris)', x: 440, y: 125, r: 22, cases: '13,100', tier: 'ALERT' },
    { id: 'g-me', label: 'Arabian Gulf / UAE Corridor', x: 550, y: 185, r: 32, cases: '24,800', tier: 'ACTION' },
    { id: 'g-in', label: 'South Asia (Mumbai / Delhi)', x: 610, y: 195, r: 28, cases: '21,300', tier: 'ACTION' },
    { id: 'g-ea', label: 'East Asia (Tokyo / Seoul / Shanghai)', x: 710, y: 165, r: 25, cases: '17,400', tier: 'ALERT' },
    { id: 'g-sea', label: 'Southeast Asia (Singapore)', x: 675, y: 255, r: 18, cases: '8,900', tier: 'WATCH' },
    { id: 'g-au', label: 'Eastern Australia (Sydney / Melbourne)', x: 775, y: 345, r: 24, cases: '15,200', tier: 'ALERT' },
    { id: 'g-af', label: 'Sub-Saharan Hub', x: 480, y: 275, r: 16, cases: '7,150', tier: 'WATCH' },
  ];

  // UAE Regional hotspots for Abu Dhabi, Musaffah, Al Ain, Dubai South
  const regionalHotspots = [
    { id: 'uae-adh', name: 'Abu Dhabi Central', x: 260, y: 170, r: 28, tier: 'WATCH', cases: '1,420 cases' },
    { id: 'uae-mus', name: 'Musaffah Industrial Sector 14', x: 290, y: 215, r: 38, tier: 'ACTION', cases: '4,850 cases' },
    { id: 'uae-aln', name: 'Al Ain Oasis District', x: 510, y: 260, r: 26, tier: 'WATCH', cases: '1,120 cases' },
    { id: 'uae-dxb', name: 'Dubai South Logistic Zone', x: 480, y: 130, r: 32, tier: 'ALERT', cases: '3,210 cases' },
    { id: 'uae-icad', name: 'ICAD Industrial Zone', x: 275, y: 235, r: 24, tier: 'ALERT', cases: '2,400 cases' },
  ];

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A1A1C] via-[#141416] to-[#0D0D0E] border border-white/10 shadow-2xl flex flex-col justify-between">
      {/* Top Header inside Map */}
      <div className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-panel/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-bold text-canary-text tracking-tight flex items-center gap-2">
            <span>{mapScope === 'global' ? 'Global Outbreak Map' : 'UAE Regional Surveillance Map'}</span>
          </h2>

          {/* Scope switcher button */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-canvas-deep border border-white/10 text-xs">
            <button
              onClick={() => setMapScope('global')}
              className={`px-2.5 py-0.5 rounded-lg font-medium transition-colors ${
                mapScope === 'global' ? 'bg-[#F2A33A] text-canvas-deep font-bold' : 'text-canary-text-3 hover:text-canary-text'
              }`}
            >
              Global
            </button>
            <button
              onClick={() => setMapScope('regional')}
              className={`px-2.5 py-0.5 rounded-lg font-medium transition-colors ${
                mapScope === 'regional' ? 'bg-[#F2A33A] text-canvas-deep font-bold' : 'text-canary-text-3 hover:text-canary-text'
              }`}
            >
              UAE Regional
            </button>
          </div>
        </div>

        {/* 142 ACTIVE Pill with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-canvas-deep/90 border border-white/15 text-xs font-semibold text-canary-text hover:border-canary-amber transition-all shadow-md"
          >
            <span className="w-2 h-2 rounded-full bg-[#F2A33A] shadow-[0_0_8px_#F2A33A] animate-pulse" />
            <span className="text-canary-amber font-mono font-bold">142 ACTIVE</span>
            <ChevronDown className="w-3.5 h-3.5 text-canary-text-3" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#1B1B1D] border border-white/15 shadow-2xl z-30 p-1.5">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-canary-text-3 font-semibold">
                Surveillance Layers
              </div>
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${
                  activeFilter === 'all' ? 'bg-canary-amber/15 text-canary-amber font-bold' : 'text-canary-text-2 hover:bg-white/5'
                }`}
              >
                <span>All Active Feeds</span>
                <span className="font-mono text-xs opacity-75">142</span>
              </button>
              <button
                onClick={() => {
                  setActiveFilter('outbreaks');
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${
                  activeFilter === 'outbreaks' ? 'bg-[#F2A33A]/15 text-[#F2A33A] font-bold' : 'text-canary-text-2 hover:bg-white/5'
                }`}
              >
                <span>Active Outbreaks</span>
                <span className="font-mono text-xs opacity-75">26</span>
              </button>
              <button
                onClick={() => {
                  setActiveFilter('critical');
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${
                  activeFilter === 'critical' ? 'bg-[#E5483D]/15 text-[#E5483D] font-bold' : 'text-canary-text-2 hover:bg-white/5'
                }`}
              >
                <span>Critical Alerts</span>
                <span className="font-mono text-xs opacity-75">3</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map Graphic Canvas */}
      <div className="relative w-full h-[340px] sm:h-[380px] bg-[#0E0F12] overflow-hidden flex items-center justify-center">
        {/* Subtle coordinate grid lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {mapScope === 'global' ? (
          /* SVG World Map with Glowing Amber Hotspots */
          <svg viewBox="0 0 900 450" className="w-full h-full object-contain select-none">
            <defs>
              {/* Radial Hotspot Glow Filter */}
              <radialGradient id="hotspotAmber" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF2C2" stopOpacity="1" />
                <stop offset="25%" stopColor="#F2A33A" stopOpacity="0.85" />
                <stop offset="65%" stopColor="#F2A33A" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F2A33A" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hotspotRed" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFD1CA" stopOpacity="1" />
                <stop offset="30%" stopColor="#E5483D" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#E5483D" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#E5483D" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Continents Silhouettes in Charcoal (#1B1C20 with subtle amber-tinted borders) */}
            <g fill="#1F2025" stroke="#363840" strokeWidth="0.8" opacity="0.95">
              {/* North America */}
              <path d="M 100,70 L 150,55 L 220,60 L 260,85 L 240,140 L 225,180 L 190,200 L 175,230 L 140,190 L 110,180 L 90,130 Z" />
              {/* South America */}
              <path d="M 230,240 L 270,250 L 320,290 L 305,370 L 275,410 L 250,380 L 235,320 L 220,270 Z" />
              {/* Europe */}
              <path d="M 410,80 L 460,75 L 490,95 L 470,140 L 430,145 L 400,120 Z" />
              {/* Africa */}
              <path d="M 400,155 L 470,150 L 510,190 L 500,280 L 470,350 L 430,340 L 390,250 L 390,190 Z" />
              {/* Asia */}
              <path d="M 490,75 L 620,60 L 740,75 L 770,140 L 730,210 L 650,220 L 580,210 L 520,160 Z" />
              {/* Australia */}
              <path d="M 720,290 L 800,290 L 820,350 L 780,380 L 730,360 L 710,320 Z" />
            </g>

            {/* Glowing Hotspots */}
            {globalHotspots.map((spot) => {
              const isRed = spot.tier === 'ACTION';
              const isHovered = hoveredHotspot === spot.id;
              return (
                <g
                  key={spot.id}
                  className="cursor-pointer transition-transform"
                  onMouseEnter={() => setHoveredHotspot(spot.id)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                >
                  {/* Outer Pulsing Glow Circle */}
                  <circle
                    cx={spot.x}
                    cy={spot.y}
                    r={spot.r * 1.6}
                    fill={isRed ? 'url(#hotspotRed)' : 'url(#hotspotAmber)'}
                    className="animate-pulse"
                    opacity={isHovered ? 1 : 0.8}
                  />

                  {/* Core Bright Light Dot */}
                  <circle
                    cx={spot.x}
                    cy={spot.y}
                    r={isHovered ? 6 : 4}
                    fill="#FFF7E0"
                    stroke={isRed ? '#E5483D' : '#F2A33A'}
                    strokeWidth="2"
                    className="transition-all"
                  />

                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g transform={`translate(${spot.x - 60}, ${spot.y - 42})`}>
                      <rect
                        width="120"
                        height="32"
                        rx="8"
                        fill="#0D0D0E"
                        stroke="rgba(242,163,58,0.5)"
                        strokeWidth="1"
                        filter="drop-shadow(0 4px 12px rgba(0,0,0,0.8))"
                      />
                      <text x="60" y="14" fill="#EDE8DF" fontSize="9" fontWeight="bold" textAnchor="middle">
                        {spot.label}
                      </text>
                      <text x="60" y="25" fill="#F2A33A" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        {spot.cases} Active
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        ) : (
          /* UAE Regional Map view */
          <svg viewBox="0 0 700 380" className="w-full h-full object-contain select-none">
            <defs>
              <radialGradient id="uaeAmberGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE79A" stopOpacity="1" />
                <stop offset="35%" stopColor="#F2A33A" stopOpacity="0.8" />
                <stop offset="75%" stopColor="#F2A33A" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#F2A33A" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="uaeRedGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFD1CA" stopOpacity="1" />
                <stop offset="35%" stopColor="#E5483D" stopOpacity="0.8" />
                <stop offset="75%" stopColor="#E5483D" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#E5483D" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* UAE Coastline & Desert Outline */}
            <path
              d="M 120,290 L 180,240 L 260,190 L 360,160 L 460,140 L 560,130 L 620,110 L 640,160 L 590,240 L 510,320 L 380,350 L 220,340 Z"
              fill="#1F2025"
              stroke="#3A3C44"
              strokeWidth="1.2"
            />

            {/* Gulf Waters Label */}
            <text x="240" y="90" fill="#6FA8C7" opacity="0.35" fontSize="12" fontStyle="italic" letterSpacing="4">
              ARABIAN GULF
            </text>

            {/* UAE Hotspots */}
            {regionalHotspots.map((spot) => {
              const isAction = spot.tier === 'ACTION';
              const isHovered = hoveredHotspot === spot.id;
              return (
                <g
                  key={spot.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredHotspot(spot.id)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                >
                  <circle
                    cx={spot.x}
                    cy={spot.y}
                    r={spot.r * 1.5}
                    fill={isAction ? 'url(#uaeRedGlow)' : 'url(#uaeAmberGlow)'}
                    className="animate-pulse"
                  />
                  <circle
                    cx={spot.x}
                    cy={spot.y}
                    r={isHovered ? 7 : 5}
                    fill="#FFF8E7"
                    stroke={isAction ? '#E5483D' : '#F2A33A'}
                    strokeWidth="2.5"
                  />
                  <text
                    x={spot.x}
                    y={spot.y + 22}
                    fill="#EDE8DF"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))"
                  >
                    {spot.name}
                  </text>
                  <text
                    x={spot.x}
                    y={spot.y + 34}
                    fill="#F2A33A"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {spot.cases}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Integrated Bottom Data Sources Strip */}
      <div className="relative z-20 px-6 py-3.5 bg-canvas-deep/90 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-canary-text-3 font-mono text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-canary-amber" />
          <span>Data Sources:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-canary-text-2 text-xs">
          <div className="flex items-center gap-1.5 hover:text-canary-amber transition-colors">
            <Building2 className="w-3.5 h-3.5 text-[#6FA8C7]" />
            <span>Healthcare facilities</span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-canary-amber transition-colors">
            <FlaskConical className="w-3.5 h-3.5 text-[#C58BD9]" />
            <span>Laboratories</span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-canary-amber transition-colors">
            <Activity className="w-3.5 h-3.5 text-[#EDCB63]" />
            <span>Workplace Agencies</span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-canary-amber transition-colors">
            <Wind className="w-3.5 h-3.5 text-[#7FB45A]" />
            <span>Environmental Sensors</span>
          </div>
        </div>
      </div>
    </div>
  );
};

