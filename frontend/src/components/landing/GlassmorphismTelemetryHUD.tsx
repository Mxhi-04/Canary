'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Wind,
  Activity,
  TrendingUp,
  Clock,
  ShieldCheck,
  ChevronDown,
  Bell,
  Sun,
  CloudFog,
  CloudSun,
  CloudRain,
  ArrowRight
} from 'lucide-react';

interface GlassmorphismTelemetryHUDProps {
  scrollProgress: number; // 0.0 to 1.0
  className?: string;
}

/**
 * Smooth Hermite cubic interpolation over a normalized scroll window [start, end].
 */
function computeStep(scroll: number, start: number, end: number): number {
  if (scroll <= start) return 0;
  if (scroll >= end) return 1;
  const t = (scroll - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export const GlassmorphismTelemetryHUD: React.FC<GlassmorphismTelemetryHUDProps> = ({
  scrollProgress,
  className = '',
}) => {
  // Interactive toggle switches
  const [wbgtActive, setWbgtActive] = useState(true);
  const [pmActive, setPmActive] = useState(true);
  const [secondaryTriggerActive, setSecondaryTriggerActive] = useState(true);
  const [timelineActive, setTimelineActive] = useState(true);
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Wed');

  // Progressive flight narrative stages based on scroll:
  const isPhase1 = scrollProgress < 0.28;
  const isPhase2 = scrollProgress >= 0.28 && scrollProgress < 0.62;
  const isPhase3 = scrollProgress >= 0.62 && scrollProgress < 0.88;
  const isPhase4 = scrollProgress >= 0.88;

  // Active highlighted forecast day shifts dynamically with scroll progress
  const activeForecastDay = isPhase1 ? 'Mon' : isPhase2 ? 'Tue' : 'Wed';

  // =========================================================================
  // SCROLL-DRIVEN SEQUENTIAL REVEAL STEPS (APPEAR ONE BY ONE)
  // Step 0: Top Header (0.02 -> 0.07)
  // Step 1: Card 1 - Thermal WBGT Arc Gauge (0.05 -> 0.18)
  // Step 2: Card 2 - Air Quality PM2.5 Curve (0.18 -> 0.35)
  // Step 3: Card 3 - Early Detection Horizon Timeline (0.35 -> 0.58)
  // Step 4: Card 4 - Syndromic Fusion & Proportionate Action (0.58 -> 0.82)
  // =========================================================================
  const pHeader = computeStep(scrollProgress, 0.02, 0.07);
  const pCard1 = computeStep(scrollProgress, 0.05, 0.18);
  const pCard2 = computeStep(scrollProgress, 0.18, 0.35);
  const pCard3 = computeStep(scrollProgress, 0.35, 0.58);
  const pCard4 = computeStep(scrollProgress, 0.58, 0.82);

  // Reference-faithful sheer glassmorphism:
  // Optical transparency (>90% transparent), crisp defined borders (28% white),
  // luminous specular upper bevel highlight (42% white reflection), and silky backdrop blur.
  // Fixed size: strictly 440px wide without scaling or stretching.
  const glassPanelStyle: React.CSSProperties = {
    background:
      'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.02) 45%, rgba(12, 16, 26, 0.16) 100%)',
    backdropFilter: 'blur(18px) saturate(190%)',
    WebkitBackdropFilter: 'blur(18px) saturate(190%)',
    border: '1px solid rgba(255, 255, 255, 0.28)',
    boxShadow:
      'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.42), inset 0 0 0 1px rgba(255, 255, 255, 0.06), 0 20px 50px -10px rgba(0, 0, 0, 0.45)',
    willChange: 'transform, opacity',
  };

  return (
    <div
      className={`w-[440px] max-w-[440px] flex flex-col gap-2.5 select-none ${className}`}
      style={{ width: '440px', maxWidth: '440px' }}
    >
      {/* =========================================================================
          STEP 0: Top Floating Header (Appears first: 2% - 7% scroll)
          ========================================================================= */}
      <div
        className="flex items-center justify-between px-1"
        style={{
          opacity: pHeader,
          transform: `translate3d(0, ${(1 - pHeader) * -10}px, 0)`,
          pointerEvents: pHeader > 0.2 ? 'auto' : 'none',
          willChange: 'transform, opacity',
        }}
      >
        {/* Live Surveillance Indicator */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border shadow-lg text-[11px] text-canary-text-2"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.03) 100%)',
            backdropFilter: 'blur(18px) saturate(180%)',
            borderColor: 'rgba(255, 255, 255, 0.28)',
            boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
          <span className="font-semibold text-canary-text">Live Telemetry</span>
          <span className="text-canary-text-3">·</span>
          <span className="text-canary-amber font-mono font-medium">
            {isPhase1 && 'Phase 1: Environmental Lead (1/4)'}
            {isPhase2 && 'Phase 2: Syndromic Fusion (2/4)'}
            {isPhase3 && 'Phase 3: Lead-Time Zenith (3/4)'}
            {isPhase4 && 'Phase 4: Action Playbooks (4/4)'}
          </span>
        </div>

        {/* Right Notification Bell + User Avatar */}
        <div className="flex items-center gap-2">
          <Link
            href="/alerts"
            className="relative p-1.5 rounded-2xl border text-canary-text-2 hover:text-canary-amber transition-all shadow-lg group hover:border-[#F2A33A]/50"
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.03) 100%)',
              backdropFilter: 'blur(18px) saturate(180%)',
              borderColor: 'rgba(255, 255, 255, 0.28)',
              boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
            }}
            title="Active Surveillance Alerts"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#F2A33A] text-canvas-deep text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(242,163,58,0.8)]">
              3
            </span>
          </Link>
          <div
            className="w-7 h-7 rounded-2xl bg-gradient-to-tr from-[#F2A33A] to-[#EDCB63] p-0.5 shadow-lg border border-white/30 flex items-center justify-center overflow-hidden cursor-pointer"
            title="Surveillance Officer (MOHAP Demo Role)"
          >
            <div className="w-full h-full rounded-[14px] bg-[#161617]/80 backdrop-blur-sm flex items-center justify-center text-[9px] font-bold text-canary-amber">
              SO
            </div>
          </div>
        </div>
      </div>

      {/* Top Row: Cards 1 and 2 (Appear sequentially in flight) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* =========================================================================
            STEP 1: CARD 1 - Semicircular Hazard Gauge (Thermal Stress WBGT)
            Appears second: 5% - 18% scroll
            ========================================================================= */}
        <div
          className="relative rounded-2xl p-3 overflow-hidden group hover:border-[#F2A33A]/50 transition-colors duration-200"
          style={{
            ...glassPanelStyle,
            opacity: pCard1,
            transform: `translate3d(0, ${(1 - pCard1) * 20}px, 0)`,
            pointerEvents: pCard1 > 0.2 ? 'auto' : 'none',
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#F2A33A]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header with Pill Toggle Switch */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-canary-text drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] truncate">
              <Flame className="w-3 h-3 text-[#F2A33A] shrink-0" />
              <span className="truncate">Thermal (WBGT)</span>
            </div>

            {/* Pill Toggle Switch */}
            <button
              onClick={() => setWbgtActive(!wbgtActive)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 ${
                wbgtActive
                  ? 'bg-gradient-to-r from-[#EDCB63] to-[#F2A33A] shadow-[0_0_10px_rgba(242,163,58,0.7)]'
                  : 'bg-white/10 border border-white/25'
              }`}
              title="Toggle WBGT Sensor Feed"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  wbgtActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Semicircular Arc Gauge SVG */}
          <div className="relative flex flex-col items-center justify-center my-1">
            <svg viewBox="0 0 150 82" className="w-32 h-18 overflow-visible">
              <defs>
                <linearGradient id="wbgtGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EDCB63" />
                  <stop offset="65%" stopColor="#F2A33A" />
                  <stop offset="100%" stopColor="#E5483D" />
                </linearGradient>
              </defs>

              {/* Background Arc */}
              <path
                d="M 18 68 A 54 54 0 0 1 132 68"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="6.5"
                strokeLinecap="round"
              />

              {/* Active Golden Amber Arc */}
              {wbgtActive && (
                <path
                  d="M 18 68 A 54 54 0 0 1 119 38"
                  fill="none"
                  stroke="url(#wbgtGaugeGrad)"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                />
              )}

              {/* Min and Max Markers */}
              <text x="18" y="80" fill="#B4BAC8" fontSize="7.5" fontFamily="monospace" textAnchor="middle">0</text>
              <text x="132" y="80" fill="#B4BAC8" fontSize="7.5" fontFamily="monospace" textAnchor="middle">50</text>

              {/* Needle Glow Indicator Dot at Current Reading */}
              {wbgtActive && (
                <>
                  <circle
                    cx="119"
                    cy="38"
                    r="5.5"
                    fill="#F2A33A"
                    className="filter drop-shadow-[0_0_8px_rgba(242,163,58,0.95)] animate-pulse"
                  />
                  <circle cx="119" cy="38" r="2" fill="#FFFFFF" />
                </>
              )}
            </svg>

            {/* Value in Center */}
            <div className="absolute bottom-0 flex flex-col items-center">
              <span className="text-xl font-bold font-mono text-canary-text tracking-tight tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {wbgtActive ? '32.4°C' : '--.-°C'}
              </span>
              <span className="text-[9px] text-canary-amber font-medium uppercase tracking-wider">
                {wbgtActive ? 'High Alert Tier' : 'Feed Paused'}
              </span>
            </div>
          </div>

          {/* Footnote Stats */}
          <div className="flex items-center justify-between pt-1.5 border-t border-white/15 text-[10px] text-canary-text-3 font-mono">
            <span>Amb: 41.5°C</span>
            <span className="text-canary-amber font-semibold">+2.4d Lead</span>
          </div>
        </div>

        {/* =========================================================================
            STEP 2: CARD 2 - Air Quality (PM2.5) Signal Sparkline with Grid & Toggle
            Appears third: 18% - 35% scroll
            ========================================================================= */}
        <div
          className="relative rounded-2xl p-3 overflow-hidden group hover:border-[#F2A33A]/50 transition-colors duration-200"
          style={{
            ...glassPanelStyle,
            opacity: pCard2,
            transform: `translate3d(0, ${(1 - pCard2) * 20}px, 0)`,
            pointerEvents: pCard2 > 0.2 ? 'auto' : 'none',
          }}
        >
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#6FA8C7]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header with Top Toggle */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-canary-text drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] truncate">
              <Wind className="w-3 h-3 text-[#6FA8C7] shrink-0" />
              <span className="truncate">Air (PM2.5)</span>
            </div>

            {/* Top Toggle Switch */}
            <button
              onClick={() => setPmActive(!pmActive)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 ${
                pmActive
                  ? 'bg-gradient-to-r from-[#EDCB63] to-[#F2A33A] shadow-[0_0_10px_rgba(242,163,58,0.7)]'
                  : 'bg-white/10 border border-white/25'
              }`}
              title="Toggle PM2.5 Feed"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  pmActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sparkline Curve with Y-Grid */}
          <div className="relative h-18 w-full my-1 flex items-end">
            <svg viewBox="0 0 200 70" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="pmAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F2A33A" stopOpacity={pmActive ? '0.45' : '0.05'} />
                  <stop offset="100%" stopColor="#F2A33A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="20" y1="15" x2="195" y2="15" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="20" y1="36" x2="195" y2="36" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="20" y1="58" x2="195" y2="58" stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />

              {/* Y-Axis Labels */}
              <text x="16" y="18" fill="#B4BAC8" fontSize="7" fontFamily="monospace" textAnchor="end">600</text>
              <text x="16" y="39" fill="#B4BAC8" fontSize="7" fontFamily="monospace" textAnchor="end">400</text>
              <text x="16" y="61" fill="#B4BAC8" fontSize="7" fontFamily="monospace" textAnchor="end">0</text>

              {/* Area Fill */}
              {pmActive && (
                <path
                  d="M 24 58 Q 50 56 75 38 T 120 18 T 155 40 T 195 24 L 195 58 L 24 58 Z"
                  fill="url(#pmAreaGradient)"
                />
              )}

              {/* Main Glowing Amber Line */}
              <path
                d="M 24 58 Q 50 56 75 38 T 120 18 T 155 40 T 195 24"
                fill="none"
                stroke={pmActive ? '#F2A33A' : 'rgba(255,255,255,0.25)'}
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Peak Indicator Dot */}
              {pmActive && (
                <>
                  <circle
                    cx="120"
                    cy="18"
                    r="4"
                    fill="#F2A33A"
                    className="filter drop-shadow-[0_0_8px_rgba(242,163,58,0.95)]"
                  />
                  <circle cx="120" cy="18" r="1.5" fill="#FFFFFF" />
                </>
              )}
            </svg>

            {/* Peak Callout Badge */}
            {pmActive && (
              <div
                className="absolute top-0 right-1 px-1 py-0.5 rounded border text-[8.5px] font-mono text-canary-amber shadow-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  borderColor: 'rgba(242, 163, 58, 0.5)',
                }}
              >
                118 µg/m³
              </div>
            )}
          </div>

          {/* Time axis */}
          <div className="flex items-center justify-between text-[8.5px] text-canary-text-3 font-mono pt-1 border-t border-white/15 pl-4">
            <span>10a</span>
            <span>3p</span>
            <span>6p</span>
            <span className="text-canary-amber font-semibold">Sun</span>
            <span>12p</span>
          </div>

          {/* Secondary Row with Second Toggle */}
          <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-white/15 text-[10px] text-canary-text-2">
            <span>Threshold Trigger</span>
            <button
              onClick={() => setSecondaryTriggerActive(!secondaryTriggerActive)}
              className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                secondaryTriggerActive
                  ? 'bg-[#F2A33A]'
                  : 'bg-white/10 border border-white/25'
              }`}
              title="Toggle Threshold Trigger"
            >
              <div
                className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                  secondaryTriggerActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STEP 3: CARD 3 - Detection Horizon Timeline Card (Bell Curve + 7-Day Forecast)
          Appears fourth: 35% - 58% scroll
          ========================================================================= */}
      <div
        className="relative rounded-2xl p-3 overflow-hidden group hover:border-[#F2A33A]/50 transition-colors duration-200"
        style={{
          ...glassPanelStyle,
          opacity: pCard3,
          transform: `translate3d(0, ${(1 - pCard3) * 20}px, 0)`,
          pointerEvents: pCard3 > 0.2 ? 'auto' : 'none',
        }}
      >
        <div className="absolute -bottom-16 -left-12 w-40 h-40 bg-[#F2A33A]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header with Toggle Switch */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-canary-text drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            <Clock className="w-3.5 h-3.5 text-canary-amber" />
            <span>Early Detection Horizon (+2.9d Lead)</span>
          </div>

          {/* Pill Toggle Switch */}
          <button
            onClick={() => setTimelineActive(!timelineActive)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
              timelineActive
                ? 'bg-gradient-to-r from-[#EDCB63] to-[#F2A33A] shadow-[0_0_10px_rgba(242,163,58,0.7)]'
                : 'bg-white/10 border border-white/25'
            }`}
            title="Toggle Horizon Timeline"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                timelineActive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Smooth Lead Gain Bell Curve Distribution SVG */}
        <div className="relative h-16 w-full my-1">
          <svg viewBox="0 0 320 60" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="horizonBellGrad" x1="0%" y1="0%" x2="0%" y2="1">
                <stop offset="0%" stopColor="#F2A33A" stopOpacity={timelineActive ? '0.45' : '0.05'} />
                <stop offset="100%" stopColor="#F2A33A" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Bell Curve Area */}
            {timelineActive && (
              <path
                d="M 10 56 C 60 56 110 50 160 14 C 210 50 260 56 310 56 L 310 58 L 10 58 Z"
                fill="url(#horizonBellGrad)"
              />
            )}

            {/* Glowing Bell Stroke */}
            <path
              d="M 10 56 C 60 56 110 50 160 14 C 210 50 260 56 310 56"
              fill="none"
              stroke={timelineActive ? '#F2A33A' : 'rgba(255,255,255,0.25)'}
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Zenith Dot */}
            {timelineActive && (
              <>
                <circle
                  cx="160"
                  cy="14"
                  r="4.5"
                  fill="#F2A33A"
                  className="filter drop-shadow-[0_0_10px_rgba(242,163,58,0.95)]"
                />
                <circle cx="160" cy="14" r="1.5" fill="#FFFFFF" />
              </>
            )}
          </svg>

          {/* Floating Callout at Peak */}
          {timelineActive && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full border text-[9.5px] font-mono text-canary-amber shadow-lg whitespace-nowrap"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(16px)',
                borderColor: 'rgba(242, 163, 58, 0.55)',
              }}
            >
              +2.9 Days Lead Gain Peak
            </div>
          )}
        </div>

        {/* Time Markers */}
        <div className="flex items-center justify-between text-[8.5px] text-canary-text-3 font-mono px-3 pb-1.5 border-b border-white/15">
          <span>8am</span>
          <span>10am</span>
          <span className="text-canary-amber font-semibold">12pm</span>
          <span>1pm</span>
          <span>3pm</span>
        </div>

        {/* 7-Day Day-of-Week Forecast Strip */}
        <div className="grid grid-cols-7 gap-1 pt-2 text-center">
          {[
            { day: 'Mon' as const, temp: '28°', icon: CloudFog, status: 'Fog / Normal' },
            { day: 'Tue' as const, temp: '30°', icon: CloudSun, status: 'Warm / Watch' },
            { day: 'Wed' as const, temp: '33°', icon: Sun, status: 'Heat / Dust Wave', isPeak: true },
            { day: 'Thu' as const, temp: '34°', icon: Sun, status: 'Extreme Heat' },
            { day: 'Fri' as const, temp: '32°', icon: CloudFog, status: 'Hazy' },
            { day: 'Sat' as const, temp: '29°', icon: CloudSun, status: 'Easing' },
            { day: 'Sun' as const, temp: '27°', icon: CloudRain, status: 'Clear' },
          ].map((item) => {
            const isHighlight = item.day === activeForecastDay;
            const Icon = item.icon;

            return (
              <button
                key={item.day}
                onClick={() => setSelectedDay(item.day)}
                className={`py-1 px-0.5 rounded-xl transition-all duration-200 flex flex-col items-center justify-center ${
                  isHighlight
                    ? 'shadow-lg'
                    : 'bg-transparent border border-transparent hover:bg-white/10 hover:border-white/20'
                }`}
                style={
                  isHighlight
                    ? {
                        background: 'rgba(255, 255, 255, 0.16)',
                        border: '1.5px solid rgba(255, 255, 255, 0.40)',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.3)',
                      }
                    : undefined
                }
                title={`${item.day}: ${item.temp} (${item.status})`}
              >
                <span
                  className={`text-[9.5px] font-semibold block ${
                    isHighlight ? 'text-canary-amber' : 'text-canary-text-3'
                  }`}
                >
                  {item.day}
                </span>

                <Icon
                  className={`w-3 h-3 my-0.5 ${
                    isHighlight ? 'text-canary-amber' : 'text-canary-text-3'
                  }`}
                />

                <span className="text-[10px] font-mono font-bold text-canary-text block">
                  {item.temp}
                </span>
              </button>
            );
          })}
        </div>

        {/* Down Chevron Centered */}
        <div className="flex items-center justify-center pt-1.5 text-canary-text-3 hover:text-canary-amber transition-colors">
          <ChevronDown className="w-3 h-3 animate-bounce" />
        </div>
      </div>

      {/* =========================================================================
          STEP 4: CARD 4 - Synchronized Narrative & Multi-Signal Fusion Card
          Appears fifth: 58% - 82% scroll
          ========================================================================= */}
      <div
        className="relative rounded-2xl p-3 overflow-hidden hover:border-[#F2A33A]/50 transition-colors duration-200"
        style={{
          ...glassPanelStyle,
          opacity: pCard4,
          transform: `translate3d(0, ${(1 - pCard4) * 20}px, 0)`,
          pointerEvents: pCard4 > 0.2 ? 'auto' : 'none',
        }}
      >
        {/* Dynamic Story Segment synchronized with scroll flight */}
        {isPhase1 && (
          <div className="space-y-1 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-canary-amber inline-flex items-center gap-1">
                <Wind className="w-3 h-3" />
                <span>Phase 1 · Exposure Leads</span>
              </span>
              <span
                className="text-[9.5px] font-mono text-emerald-400 px-2 py-0.5 rounded border"
                style={{
                  background: 'rgba(52, 211, 153, 0.15)',
                  borderColor: 'rgba(52, 211, 153, 0.35)',
                }}
              >
                +48h Precursor Active
              </span>
            </div>
            <h4 className="text-xs font-semibold text-canary-text">
              Environmental Hazards Lead the Signal
            </h4>
            <p className="text-[11px] text-canary-text-2 leading-relaxed">
              Real-time CAMS PM2.5 and WBGT heat stress sensors track acute atmospheric conditions before population symptoms manifest.
            </p>
          </div>
        )}

        {isPhase2 && (
          <div className="space-y-1 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#C58BD9] inline-flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>Phase 2 · Outcomes Confirm</span>
              </span>
              <span
                className="text-[9.5px] font-mono text-[#C58BD9] px-2 py-0.5 rounded border"
                style={{
                  background: 'rgba(197, 139, 217, 0.15)',
                  borderColor: 'rgba(197, 139, 217, 0.35)',
                }}
              >
                Fusion Running
              </span>
            </div>
            <h4 className="text-xs font-semibold text-canary-text">
              Multi-Signal Syndromic & Absence Fusion
            </h4>
            <p className="text-[11px] text-canary-text-2 leading-relaxed">
              Aggregated clinic encounters, teleconsultations, and sickness absences confirm developing clusters across UAE accommodation villages.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-0.5 text-xs">
              <div
                className="px-2 py-1 rounded border flex justify-between"
                style={{ background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <span className="text-canary-text-3 text-[9.5px]">Sensitivity:</span>
                <span className="font-mono font-bold text-canary-text text-[11px]">91.8%</span>
              </div>
              <div
                className="px-2 py-1 rounded border flex justify-between"
                style={{ background: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <span className="text-canary-text-3 text-[9.5px]">Alert PPV:</span>
                <span className="font-mono font-bold text-canary-text text-[11px]">86.4%</span>
              </div>
            </div>
          </div>
        )}

        {isPhase3 && (
          <div className="space-y-1 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-canary-amber inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Phase 3 · Lead-Time Zenith</span>
              </span>
              <span
                className="text-[9.5px] font-mono text-canary-amber px-2 py-0.5 rounded border font-bold"
                style={{
                  background: 'rgba(242, 163, 58, 0.18)',
                  borderColor: 'rgba(242, 163, 58, 0.45)',
                }}
              >
                +2.9 Days Lead Gain
              </span>
            </div>
            <h4 className="text-xs font-semibold text-canary-text">
              Intervention Window Maximized
            </h4>
            <p className="text-[11px] text-canary-text-2 leading-relaxed">
              Public health authorities and enterprise safety teams gain nearly 3 days of actionable runway before peak clinical admissions.
            </p>
          </div>
        )}

        {isPhase4 && (
          <div className="space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#F06B5E] inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Phase 4 · Actionable Response</span>
              </span>
              <span
                className="text-[9.5px] font-mono text-emerald-400 px-2 py-0.5 rounded border"
                style={{
                  background: 'rgba(52, 211, 153, 0.15)',
                  borderColor: 'rgba(52, 211, 153, 0.35)',
                }}
              >
                Playbooks Ready
              </span>
            </div>
            <h4 className="text-xs font-semibold text-canary-text">
              Sense. Explain. Act Sooner.
            </h4>
            <div className="flex items-center gap-2 pt-0.5">
              <Link
                href="/dashboard"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-canary-amber hover:bg-canary-amber/90 text-canvas-deep font-bold text-xs shadow-amber-glow transition-all"
              >
                <span>Open Surveillance Map</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                href="/alerts"
                className="py-1.5 px-2.5 rounded-xl border text-[11px] text-canary-text font-semibold transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  borderColor: 'rgba(255, 255, 255, 0.28)',
                }}
              >
                Alerts (3)
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Safety & Privacy Note */}
        <div className="mt-2 pt-1.5 border-t border-white/15 flex items-center justify-between text-[9.5px] text-canary-text-3">
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Aggregate k ≥ 5 Enforced</span>
          </div>
          <span>Decision support only</span>
        </div>
      </div>
    </div>
  );
};
