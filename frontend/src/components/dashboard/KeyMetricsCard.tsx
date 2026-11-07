'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ExternalLink } from 'lucide-react';

interface KeyMetricsCardProps {
  totalCases?: number;
  outbreaks?: number;
  criticalAlerts?: number;
}

export const KeyMetricsCard: React.FC<KeyMetricsCardProps> = ({
  totalCases = 87462,
  outbreaks = 26,
  criticalAlerts = 419,
}) => {
  // Semicircular gauge arc math (220 deg sweep)
  const radius = 54;
  const strokeWidth = 8;
  const center = 70;
  const startAngle = 160;
  const endAngle = 380;
  const arcSweep = 220;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
    const s = polarToCartesian(cx, cy, r, end);
    const e = polarToCartesian(cx, cy, r, start);
    const largeArc = end - start <= 180 ? '0' : '1';
    return ['M', s.x, s.y, 'A', r, r, 0, largeArc, 0, e.x, e.y].join(' ');
  };

  const bgTrack = describeArc(center, center, radius, startAngle, endAngle);

  // Compute active arcs based on target percentages
  const p1 = 0.72; // ~72% for total cases
  const p2 = 0.58; // ~58% for outbreaks
  const p3 = 0.84; // ~84% for critical alerts

  const arc1 = describeArc(center, center, radius, startAngle, startAngle + arcSweep * p1);
  const arc2 = describeArc(center, center, radius, startAngle, startAngle + arcSweep * p2);
  const arc3 = describeArc(center, center, radius, startAngle, startAngle + arcSweep * p3);

  return (
    <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[#1A1A1C] via-[#141416] to-[#0D0D0E] border border-white/10 shadow-2xl flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base sm:text-lg font-bold text-canary-text tracking-tight">
          Key Metrics
        </h2>

        <Link
          href="/alerts"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-canvas-deep/80 border border-white/10 text-xs font-semibold text-canary-text-2 hover:text-canary-text hover:border-canary-amber transition-colors shadow-sm"
        >
          <FileText className="w-3.5 h-3.5 text-canary-amber" />
          <span>Full Report</span>
        </Link>
      </div>

      {/* 3 Semicircular Gauges Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 my-auto">
        {/* Gauge 1: Total Cases */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-28 h-24 sm:w-32 sm:h-26 flex items-center justify-center">
            <svg viewBox="0 0 140 110" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="metricGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7FB45A" />
                  <stop offset="60%" stopColor="#E8C14A" />
                  <stop offset="100%" stopColor="#F2A33A" />
                </linearGradient>
              </defs>
              <path d={bgTrack} fill="none" stroke="#25262B" strokeWidth={strokeWidth} strokeLinecap="round" />
              <path
                d={arc1}
                fill="none"
                stroke="url(#metricGrad1)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                filter="drop-shadow(0 0 6px rgba(127,180,90,0.4))"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 pointer-events-none">
              <span className="text-base sm:text-lg font-extrabold text-canary-text tracking-tight font-mono">
                {totalCases.toLocaleString()}
              </span>
              <span className="text-[10px] text-canary-text-3 font-medium uppercase tracking-wider mt-0.5">
                Total cases
              </span>
              <span className="text-[10px] font-mono font-bold text-[#F2A33A] flex items-center gap-0.5 mt-0.5">
                ▲ 11%
              </span>
            </div>
          </div>
        </div>

        {/* Gauge 2: Outbreaks */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-28 h-24 sm:w-32 sm:h-26 flex items-center justify-center">
            <svg viewBox="0 0 140 110" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="metricGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E8C14A" />
                  <stop offset="70%" stopColor="#F2A33A" />
                  <stop offset="100%" stopColor="#F59A4A" />
                </linearGradient>
              </defs>
              <path d={bgTrack} fill="none" stroke="#25262B" strokeWidth={strokeWidth} strokeLinecap="round" />
              <path
                d={arc2}
                fill="none"
                stroke="url(#metricGrad2)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                filter="drop-shadow(0 0 6px rgba(242,163,58,0.4))"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 pointer-events-none">
              <span className="text-base sm:text-lg font-extrabold text-canary-text tracking-tight font-mono">
                {outbreaks}
              </span>
              <span className="text-[10px] text-canary-text-3 font-medium uppercase tracking-wider mt-0.5">
                Outbreaks
              </span>
              <span className="text-[10px] font-mono font-bold text-[#EDCB63] flex items-center gap-0.5 mt-0.5">
                ▲ 17%
              </span>
            </div>
          </div>
        </div>

        {/* Gauge 3: Critical Alerts */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-28 h-24 sm:w-32 sm:h-26 flex items-center justify-center">
            <svg viewBox="0 0 140 110" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="metricGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F2A33A" />
                  <stop offset="60%" stopColor="#F08A2E" />
                  <stop offset="100%" stopColor="#E5483D" />
                </linearGradient>
              </defs>
              <path d={bgTrack} fill="none" stroke="#25262B" strokeWidth={strokeWidth} strokeLinecap="round" />
              <path
                d={arc3}
                fill="none"
                stroke="url(#metricGrad3)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                filter="drop-shadow(0 0 8px rgba(229,72,61,0.5))"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 pointer-events-none">
              <span className="text-base sm:text-lg font-extrabold text-canary-text tracking-tight font-mono">
                {criticalAlerts}
              </span>
              <span className="text-[10px] text-canary-text-3 font-medium uppercase tracking-wider mt-0.5">
                Critical alerts
              </span>
              <span className="text-[10px] font-mono font-bold text-[#F06B5E] flex items-center gap-0.5 mt-0.5">
                ▲ 23%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full Report Action Pill */}
      <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-center">
        <Link
          href="/validation"
          className="w-full py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-canary-amber/40 text-xs font-semibold text-canary-text text-center flex items-center justify-center gap-1.5 transition-all shadow-sm group"
        >
          <span>Full Report</span>
          <ExternalLink className="w-3 h-3 text-canary-amber group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
