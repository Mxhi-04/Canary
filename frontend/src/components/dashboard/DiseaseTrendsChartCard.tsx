'use client';

import React, { useState } from 'react';
import { ChevronDown, FileText, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const DiseaseTrendsChartCard: React.FC = () => {
  const [selectedDisease, setSelectedDisease] = useState('All Diseases');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Spline points matching reference image:
  // Points: (May, 40), (Apr, 80), (May, 65), (June, 120), (Jul, 155), (May, 190), (Mar, 220)
  const chartPoints = [
    { month: 'May', cases: '18,200', baseline: '14,100', x: 40, y: 165 },
    { month: 'Apr', cases: '32,400', baseline: '28,200', x: 100, y: 140 },
    { month: 'May', cases: '24,800', baseline: '22,900', x: 160, y: 155 },
    { month: 'June', cases: '46,100', baseline: '38,400', x: 220, y: 110 },
    { month: 'Jul', cases: '54,300', baseline: '45,000', x: 280, y: 90 },
    { month: 'May', cases: '61,200', baseline: '51,800', x: 340, y: 75 },
    { month: 'Mar', cases: '68,500', baseline: '57,300', x: 400, y: 45 },
  ];

  // SVG Spline path: smooth cubic bezier
  const pathD = 'M 40,165 C 70,165 70,140 100,140 C 130,140 130,155 160,155 C 190,155 190,110 220,110 C 250,110 250,90 280,90 C 310,90 310,75 340,75 C 370,75 370,45 400,45';
  const areaD = `${pathD} L 400,190 L 40,190 Z`;

  // Secondary Baseline spline path (Recovered/Expected)
  const baselinePathD = 'M 40,175 C 70,175 70,155 100,155 C 130,155 130,168 160,168 C 190,168 190,130 220,130 C 250,130 250,115 280,115 C 310,115 310,100 340,100 C 370,100 370,80 400,80';

  return (
    <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[#1A1A1C] via-[#141416] to-[#0D0D0E] border border-white/10 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-bold text-canary-text tracking-tight">
            Disease Trends
          </h2>

          {/* Disease Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas-deep/80 border border-white/10 text-xs font-semibold text-canary-text-2 hover:text-canary-text hover:border-canary-amber transition-colors shadow-sm"
            >
              <span>{selectedDisease}</span>
              <ChevronDown className="w-3 h-3 text-canary-text-3" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-[#1B1B1D] border border-white/15 shadow-2xl z-30 p-1.5">
                {['All Diseases', 'Influenza', 'Norovirus', 'COVID-19', 'Salmonella'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSelectedDisease(item);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium ${
                      selectedDisease === item ? 'bg-canary-amber/15 text-canary-amber font-bold' : 'text-canary-text-2 hover:bg-white/5'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Link
          href="/validation"
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-canvas-deep/80 border border-white/10 text-xs font-semibold text-canary-text-2 hover:text-canary-text hover:border-canary-amber transition-colors shadow-sm"
        >
          <span>Full Report</span>
        </Link>
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Section (7 Cols): Spline Chart */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="relative w-full h-[190px] select-none">
            {/* Background terrain texture grid */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(242,163,58,0.3) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            <svg viewBox="0 0 440 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F2A33A" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F2A33A" stopOpacity="0.0" />
                </linearGradient>

                <linearGradient id="splineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E8C14A" />
                  <stop offset="50%" stopColor="#F2A33A" />
                  <stop offset="100%" stopColor="#F59A4A" />
                </linearGradient>
              </defs>

              {/* Y-Axis Horizontal Grid Lines & Ticks matching reference (15K, 10K, 15K, 0) */}
              <g stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3">
                <line x1="30" y1="45" x2="420" y2="45" />
                <line x1="30" y1="90" x2="420" y2="90" />
                <line x1="30" y1="140" x2="420" y2="140" />
                <line x1="30" y1="190" x2="420" y2="190" strokeDasharray="none" stroke="rgba(255,255,255,0.15)" />
              </g>

              {/* Y-Axis Labels */}
              <g fill="#8A857C" fontSize="9" fontFamily="monospace" textAnchor="end">
                <text x="24" y="48">15K</text>
                <text x="24" y="93">10K</text>
                <text x="24" y="143">15K</text>
                <text x="24" y="193">0</text>
              </g>

              {/* Baseline Recovered Line (Dashed) */}
              <path
                d={baselinePathD}
                fill="none"
                stroke="#7FB45A"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.65"
              />

              {/* Area Fill */}
              <path d={areaD} fill="url(#areaGradient)" />

              {/* Primary Cases Spline Path */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#splineStroke)"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="drop-shadow(0 2px 8px rgba(242,163,58,0.5))"
              />

              {/* Interactive Glowing Nodes */}
              {chartPoints.map((pt, idx) => {
                const isHovered = hoveredPoint === idx;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill="#FFF7E0"
                      stroke="#F2A33A"
                      strokeWidth="2"
                      filter="drop-shadow(0 0 6px #F2A33A)"
                    />

                    {/* Tooltip on hover */}
                    {isHovered && (
                      <g transform={`translate(${pt.x - 45}, ${pt.y - 38})`}>
                        <rect width="90" height="28" rx="6" fill="#0D0D0E" stroke="rgba(242,163,58,0.6)" strokeWidth="1" />
                        <text x="45" y="12" fill="#EDE8DF" fontSize="8" fontWeight="bold" textAnchor="middle">
                          {pt.month}: {pt.cases}
                        </text>
                        <text x="45" y="22" fill="#7FB45A" fontSize="7" textAnchor="middle" fontFamily="monospace">
                          Exp: {pt.baseline}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* X-Axis Month Labels */}
              <g fill="#8A857C" fontSize="9" fontFamily="monospace" textAnchor="middle">
                {chartPoints.map((pt, idx) => (
                  <text key={idx} x={pt.x} y="206">
                    {pt.month}
                  </text>
                ))}
              </g>
            </svg>
          </div>

          {/* Bottom Chart Legend stats matching reference */}
          <div className="flex items-center gap-6 mt-4 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-canary-amber font-mono font-bold text-xs flex items-center gap-0.5">
                ▲ 68,500
              </span>
              <span className="text-[11px] text-canary-text-3 font-medium">New Cases</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#7FB45A] font-mono font-bold text-xs flex items-center gap-0.5">
                ▲ 57,300
              </span>
              <span className="text-[11px] text-canary-text-3 font-medium">Recovered</span>
            </div>
          </div>
        </div>

        {/* Right Section (5 Cols): Metric Totals & Sub-Breakdown Bars */}
        <div className="lg:col-span-5 flex flex-col justify-between pl-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0">
          {/* Top Headline Numbers matching reference */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-xl sm:text-2xl font-black text-canary-text tracking-tight font-mono">
                68,500
              </div>
              <div className="text-[10px] text-canary-text-3 uppercase tracking-wider font-medium mt-0.5">
                New Cases
              </div>
              <div className="text-[10px] font-mono font-bold text-[#F2A33A] mt-0.5 flex items-center gap-0.5">
                ▲ 21%
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl sm:text-2xl font-black text-[#7FB45A] tracking-tight font-mono flex items-center justify-end gap-1">
                <TrendingUp className="w-4 h-4 text-[#7FB45A]" />
                <span>57,300</span>
              </div>
              <div className="text-[10px] text-canary-text-3 uppercase tracking-wider font-medium mt-0.5">
                Recovered
              </div>
              <div className="text-[10px] font-mono font-bold text-[#7FB45A] mt-0.5 flex items-center justify-end gap-0.5">
                ▲ 13%
              </div>
            </div>
          </div>

          {/* 4 Stacked Sub-breakdown Bars matching reference */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-xs font-bold text-canary-text flex items-center gap-1 w-20">
                <span className="text-canary-amber text-[10px]">▲</span> 28,431
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#F2A33A] to-[#EDCB63] w-[75%]" />
              </div>
              <span className="text-[10px] font-mono font-medium text-canary-amber w-10 text-right">~ 8%</span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-xs font-bold text-canary-text flex items-center gap-1 w-20">
                <span className="text-[#EDCB63] text-[10px]">▲</span> 15,866
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#EDCB63] to-[#F2A33A] w-[55%]" />
              </div>
              <span className="text-[10px] font-mono font-medium text-[#EDCB63] w-10 text-right">+11%</span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-xs font-bold text-canary-text flex items-center gap-1 w-20">
                <span className="text-[#E5483D] text-[10px]">●</span> 12,745
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#E5483D] to-[#F08A2E] w-[45%]" />
              </div>
              <span className="text-[10px] font-mono font-medium text-[#E5483D] w-10 text-right">~ 5%</span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-xs font-bold text-canary-text flex items-center gap-1 w-20">
                <span className="text-[#7FB45A] text-[10px]">▲</span> 10,541
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#7FB45A] to-[#A3C87C] w-[35%]" />
              </div>
              <span className="text-[10px] font-mono font-medium text-[#7FB45A] w-10 text-right">- 3%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
