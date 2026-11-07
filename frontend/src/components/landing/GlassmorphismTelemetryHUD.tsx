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
 * Helper to compute smooth Hermite smoothstep (0.0 to 1.0)
 * over a normalized scroll window [start, end].
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
  // Step 0: Top Header (0.02 -> 0.08)
  // Step 1: Card 1 - Thermal WBGT Arc Gauge (0.05 -> 0.20)
  // Step 2: Card 2 - Air Quality PM2.5 Curve (0.20 -> 0.38)
  // Step 3: Card 3 - Early Detection Horizon Timeline (0.38 -> 0.60)
  // Step 4: Card 4 - Syndromic Fusion & Proportionate Action (0.60 -> 0.85)
  // =========================================================================
  const pHeader = computeStep(scrollProgress, 0.02, 0.08);
  const pCard1 = computeStep(scrollProgress, 0.05, 0.20);
  const pCard2 = computeStep(scrollProgress, 0.20, 0.38);
  const pCard3 = computeStep(scrollProgress, 0.38, 0.60);
  const pCard4 = computeStep(scrollProgress, 0.60, 0.85);

  // Common ultra-glassmorphic style:
  // Low alpha (26%-36%), high optical blur (28px), rich color saturation (170%),
  // with specular top reflection and inner lighting so background scenery shows through!
  const glassPanelStyle: React.CSSProperties = {
    background:
      'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(18, 22, 34, 0.28) 45%, rgba(10, 13, 22, 0.36) 100%)',
    backdropFilter: 'blur(28px) saturate(170%)',
    WebkitBackdropFilter: 'blur(28px) saturate(170%)',
    boxShadow:
      'inset 0 1px 1px 0 rgba(255, 255, 255, 0.24), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.35), 0 20px 48px -10px rgba(0, 0, 0, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
  };

  return (
    <div
      className={`w-full max-w-xl xl:max-w-2xl flex flex-col gap-3 select-none transition-all duration-300 ${className}`}
    >
      {/* =========================================================================
          STEP 0: Top Floating Header (Appears first: 2% - 8% scroll)
          ========================================================================= */}
      <div
        className="flex items-center justify-between px-1 transition-all duration-500 ease-out"
        style={{
          opacity: pHeader,
          transform: `translateY(${(1 - pHeader) * -14}px)`,
          pointerEvents: pHeader > 0.2 ? 'auto' : 'none',
        }}
      >
        {/* Live Surveillance Indicator */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg text-[11px] text-canary-text-2 transition-all"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(18, 22, 32, 0.30) 100%)',
            backdropFilter: 'blur(24px) saturate(160%)',
            borderColor: 'rgba(255, 255, 255, 0.18)',
            boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.20)',
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
            className="relative p-2 rounded-2xl border text-canary-text-2 hover:text-canary-amber transition-all shadow-lg group hover:border-[#F2A33A]/40"
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(18, 22, 32, 0.30) 100%)',
              backdropFilter: 'blur(24px) saturate(160%)',
              borderColor: 'rgba(255, 255, 255, 0.18)',
              boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.20)',
            }}
            title="Active Surveillance Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F2A33A] text-canvas-deep text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(242,163,58,0.8)]">
              3
            </span>
          </Link>
          <div
            className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#F2A33A] to-[#EDCB63] p-0.5 shadow-lg border border-white/20 flex items-center justify-center overflow-hidden cursor-pointer"
            title="Surveillance Officer (MOHAP Demo Role)"
          >
            <div className="w-full h-full rounded-[14px] bg-[#161617]/90 flex items-center justify-center text-[10px] font-bold text-canary-amber">
              SO
            </div>
          </div>
        </div>
      </div>

      {/* Top Row: Cards 1 and 2 (Appear sequentially in flight) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* =========================================================================
            STEP 1: CARD 1 - Semicircular Hazard Gauge (Thermal Stress WBGT)
            Appears second: 5% - 20% scroll
            ========================================================================= */}
        <div
          className="relative rounded-3xl border p-4 transition-all duration-500 ease-out overflow-hidden group hover:border-[#F2A33A]/50"
          style={{
            ...glassPanelStyle,
            opacity: pCard1,
            transform: `translateY(${(1 - pCard1) * 28}px) scale(${0.95 + 0.05 * pCard1})`,
            pointerEvents: pCard1 > 0.2 ? 'auto' : 'none',
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#F2A33A]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header with Pill Toggle Switch */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-canary-text drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              <Flame className="w-3.5 h-3.5 text-[#F2A33A]" />
              <span>Thermal Stress (WBGT)</span>
            </div>

            {/* Pill Toggle Switch */}
            <button
              onClick={() => setWbgtActive(!wbgtActive)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                wbgtActive
                  ? 'bg-gradient-to-r from-[#EDCB63] to-[#F2A33A] shadow-[0_0_12px_rgba(242,163,58,0.6)]'
                  : 'bg-white/10 border border-white/15'
              }`}
              title="Toggle WBGT Sensor Feed"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  wbgtActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Semicircular Arc Gauge SVG */}
          <div className="relative flex flex-col items-center justify-center my-1.5">
            <svg viewBox="0 0 160 90" className="w-36 h-22 overflow-visible">
              <defs>
                <linearGradient id="wbgtGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EDCB63" />
                  <stop offset="65%" stopColor="#F2A33A" />
                  <stop offset="100%" stopColor="#E5483D" />
                </linearGradient>
              </defs>

              {/* Background Arc */}
              <path
                d="M 20 75 A 60 60 0 0 1 140 75"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="7"
                strokeLinecap="round"
              />

              {/* Active Golden Amber Arc */}
              {wbgtActive && (
                <path
                  d="M 20 75 A 60 60 0 0 1 126 42"
                  fill="none"
                  stroke="url(#wbgtGaugeGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              )}

              {/* Min and Max Markers */}
              <text x="18" y="88" fill="#9BA1B0" fontSize="8" fontFamily="monospace" textAnchor="middle">0</text>
              <text x="140" y="88" fill="#9BA1B0" fontSize="8" fontFamily="monospace" textAnchor="middle">50</text>

              {/* Needle Glow Indicator Dot at Current Reading */}
              {wbgtActive && (
                <>
                  <circle
                    cx="126"
                    cy="42"
                    r="6"
                    fill="#F2A33A"
                    className="filter drop-shadow-[0_0_10px_rgba(242,163,58,0.95)] animate-pulse"
                  />
                  <circle cx="126" cy="42" r="2.5" fill="#FFFFFF" />
                </>
              )}
            </svg>

            {/* Value in Center */}
            <div className="absolute bottom-0 flex flex-col items-center">
              <span className="text-2xl font-bold font-mono text-canary-text tracking-tight tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {wbgtActive ? '32.4°C' : '--.-°C'}
              </span>
              <span className="text-[10px] text-canary-amber font-medium uppercase tracking-wider drop-shadow-sm">
                {wbgtActive ? 'High Alert Tier' : 'Feed Paused'}
              </span>
            </div>
          </div>

          {/* Footnote Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-canary-text-3 font-mono">
            <span>Ambient: 41.5°C</span>
            <span className="text-canary-amber font-semibold">+2.4d Lead</span>
          </div>
        </div>

        {/* =========================================================================
            STEP 2: CARD 2 - Air Quality (PM2.5) Signal Sparkline with Grid & Toggle
            Appears third: 20% - 38% scroll
            ========================================================================= */}
        <div
          className="relative rounded-3xl border p-4 transition-all duration-500 ease-out overflow-hidden group hover:border-[#F2A33A]/50"
          style={{
            ...glassPanelStyle,
            opacity: pCard2,
            transform: `translateY(${(1 - pCard2) * 28}px) scale(${0.95 + 0.05 * pCard2})`,
            pointerEvents: pCard2 > 0.2 ? 'auto' : 'none',
          }}
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#6FA8C7]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header with Top Toggle */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-canary-text drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              <Wind className="w-3.5 h-3.5 text-[#6FA8C7]" />
              <span>Air Quality (PM2.5)</span>
            </div>

            {/* Top Toggle Switch */}
            <button
              onClick={() => setPmActive(!pmActive)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                pmActive
                  ? 'bg-gradient-to-r from-[#EDCB63] to-[#F2A33A] shadow-[0_0_12px_rgba(242,163,58,0.6)]'
                  : 'bg-white/10 border border-white/15'
              }`}
              title="Toggle PM2.5 Feed"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  pmActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sparkline Curve with Y-Grid (600, 400, 0) */}
          <div className="relative h-20 w-full my-1 flex items-end">
            <svg viewBox="0 0 220 80" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="pmAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F2A33A" stopOpacity={pmActive ? '0.45' : '0.05'} />
                  <stop offset="100%" stopColor="#F2A33A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="24" y1="18" x2="215" y2="18" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="24" y1="42" x2="215" y2="42" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="24" y1="68" x2="215" y2="68" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

              {/* Y-Axis Labels */}
              <text x="18" y="21" fill="#9BA1B0" fontSize="7" fontFamily="monospace" textAnchor="end">600</text>
              <text x="18" y="45" fill="#9BA1B0" fontSize="7" fontFamily="monospace" textAnchor="end">400</text>
              <text x="18" y="71" fill="#9BA1B0" fontSize="7" fontFamily="monospace" textAnchor="end">0</text>

              {/* Area Fill */}
              {pmActive && (
                <path
                  d="M 28 68 Q 60 66 85 45 T 135 22 T 175 48 T 215 30 L 215 68 L 28 68 Z"
                  fill="url(#pmAreaGradient)"
                />
              )}

              {/* Main Glowing Amber Line */}
              <path
                d="M 28 68 Q 60 66 85 45 T 135 22 T 175 48 T 215 30"
                fill="none"
                stroke={pmActive ? '#F2A33A' : 'rgba(255,255,255,0.2)'}
                strokeWidth="2.4"
                strokeLinecap="round"
              />

              {/* Peak Indicator Dot */}
              {pmActive && (
                <>
                  <circle
                    cx="135"
                    cy="22"
                    r="4.5"
                    fill="#F2A33A"
                    className="filter drop-shadow-[0_0_8px_rgba(242,163,58,0.95)]"
                  />
                  <circle cx="135" cy="22" r="2" fill="#FFFFFF" />
                </>
              )}
            </svg>

            {/* Peak Callout Badge */}
            {pmActive && (
              <div
                className="absolute top-0 right-2 px-1.5 py-0.5 rounded border text-[9px] font-mono text-canary-amber shadow-md"
                style={{
                  background: 'rgba(18, 22, 34, 0.65)',
                  backdropFilter: 'blur(12px)',
                  borderColor: 'rgba(242, 163, 58, 0.4)',
                }}
              >
                Peak: 118 µg/m³
              </div>
            )}
          </div>

          {/* Time axis */}
          <div className="flex items-center justify-between text-[9px] text-canary-text-3 font-mono pt-1 border-t border-white/10 pl-6">
            <span>10am</span>
            <span>3pm</span>
            <span>6pm</span>
            <span className="text-canary-amber font-semibold">Sun</span>
            <span>12pm</span>
          </div>

          {/* Secondary Row with Second Toggle */}
          <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-white/10 text-[11px] text-canary-text-2">
            <span>Threshold Alert Trigger</span>
            <button
              onClick={() => setSecondaryTriggerActive(!secondaryTriggerActive)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                secondaryTriggerActive
                  ? 'bg-[#F2A33A]'
                  : 'bg-white/10 border border-white/15'
              }`}
              title="Toggle Threshold Trigger"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                  secondaryTriggerActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STEP 3: CARD 3 - Detection Horizon Timeline Card (Bell Curve + 7-Day Forecast)
          Appears fourth: 38% - 60% scroll
          ========================================================================= */}
      <div
        className="relative rounded-3xl border p-4 transition-all duration-500 ease-out overflow-hidden group hover:border-[#F2A33A]/50"
        style={{
          ...glassPanelStyle,
          opacity: pCard3,
          transform: `translateY(${(1 - pCard3) * 32}px) scale(${0.96 + 0.04 * pCard3})`,
          pointerEvents: pCard3 > 0.2 ? 'auto' : 'none',
        }}
      >
        <div className="absolute -bottom-16 -left-12 w-48 h-48 bg-[#F2A33A]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header with Toggle Switch */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-canary-text drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            <Clock className="w-3.5 h-3.5 text-canary-amber" />
            <span>Early Detection Horizon (+2.9d Lead)</span>
          </div>

          {/* Pill Toggle Switch */}
          <button
            onClick={() => setTimelineActive(!timelineActive)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
              timelineActive
                ? 'bg-gradient-to-r from-[#EDCB63] to-[#F2A33A] shadow-[0_0_12px_rgba(242,163,58,0.6)]'
                : 'bg-white/10 border border-white/15'
            }`}
            title="Toggle Horizon Timeline"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                timelineActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Smooth Lead Gain Bell Curve Distribution SVG */}
        <div className="relative h-18 w-full my-1">
          <svg viewBox="0 0 320 65" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="horizonBellGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F2A33A" stopOpacity={timelineActive ? '0.45' : '0.05'} />
                <stop offset="100%" stopColor="#F2A33A" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Bell Curve Area */}
            {timelineActive && (
              <path
                d="M 10 60 C 60 60 110 54 160 16 C 210 54 260 60 310 60 L 310 63 L 10 63 Z"
                fill="url(#horizonBellGrad)"
              />
            )}

            {/* Glowing Bell Stroke */}
            <path
              d="M 10 60 C 60 60 110 54 160 16 C 210 54 260 60 310 60"
              fill="none"
              stroke={timelineActive ? '#F2A33A' : 'rgba(255,255,255,0.2)'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Zenith Dot */}
            {timelineActive && (
              <>
                <circle
                  cx="160"
                  cy="16"
                  r="5"
                  fill="#F2A33A"
                  className="filter drop-shadow-[0_0_12px_rgba(242,163,58,0.95)]"
                />
                <circle cx="160" cy="16" r="2" fill="#FFFFFF" />
              </>
            )}
          </svg>

          {/* Floating Callout at Peak */}
          {timelineActive && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full border text-[10px] font-mono text-canary-amber shadow-lg whitespace-nowrap"
              style={{
                background: 'rgba(18, 22, 34, 0.70)',
                backdropFilter: 'blur(16px)',
                borderColor: 'rgba(242, 163, 58, 0.5)',
              }}
            >
              +2.9 Days Lead Gain Peak
            </div>
          )}
        </div>

        {/* Time Markers */}
        <div className="flex items-center justify-between text-[9px] text-canary-text-3 font-mono px-4 pb-2 border-b border-white/10">
          <span>8am</span>
          <span>10am</span>
          <span className="text-canary-amber font-semibold">12pm</span>
          <span>1pm</span>
          <span>3pm</span>
        </div>

        {/* 7-Day Day-of-Week Forecast Strip */}
        <div className="grid grid-cols-7 gap-1 pt-2.5 text-center">
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
                className={`py-1.5 px-1 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center ${
                  isHighlight
                    ? 'border shadow-lg scale-105'
                    : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.08]'
                }`}
                style={
                  isHighlight
                    ? {
                        background: 'rgba(255, 255, 255, 0.14)',
                        borderColor: 'rgba(255, 255, 255, 0.35)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                      }
                    : undefined
                }
                title={`${item.day}: ${item.temp} (${item.status})`}
              >
                <span
                  className={`text-[10px] font-semibold block ${
                    isHighlight ? 'text-canary-amber' : 'text-canary-text-3'
                  }`}
                >
                  {item.day}
                </span>

                <Icon
                  className={`w-3.5 h-3.5 my-1 ${
                    isHighlight ? 'text-canary-amber' : 'text-canary-text-3'
                  }`}
                />

                <span className="text-[11px] font-mono font-bold text-canary-text block">
                  {item.temp}
                </span>
              </button>
            );
          })}
        </div>

        {/* Down Chevron Centered */}
        <div className="flex items-center justify-center pt-2 text-canary-text-3 hover:text-canary-amber transition-colors">
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </div>

      {/* =========================================================================
          STEP 4: CARD 4 - Synchronized Narrative & Multi-Signal Fusion Card
          Appears fifth: 60% - 85% scroll
          ========================================================================= */}
      <div
        className="relative rounded-3xl border p-4 transition-all duration-500 ease-out overflow-hidden hover:border-[#F2A33A]/50"
        style={{
          ...glassPanelStyle,
          opacity: pCard4,
          transform: `translateY(${(1 - pCard4) * 32}px) scale(${0.96 + 0.04 * pCard4})`,
          pointerEvents: pCard4 > 0.2 ? 'auto' : 'none',
        }}
      >
        {/* Dynamic Story Segment synchronized with scroll flight */}
        {isPhase1 && (
          <div className="space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-canary-amber inline-flex items-center gap-1.5">
                <Wind className="w-3 h-3" />
                <span>Phase 1 · Exposure Leads</span>
              </span>
              <span
                className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded border"
                style={{
                  background: 'rgba(52, 211, 153, 0.12)',
                  borderColor: 'rgba(52, 211, 153, 0.25)',
                }}
              >
                +48h Precursor Active
              </span>
            </div>
            <h4 className="text-sm font-semibold text-canary-text">
              Environmental Hazards Lead the Signal
            </h4>
            <p className="text-xs text-canary-text-2 leading-relaxed">
              Real-time CAMS PM2.5 and WBGT heat stress sensors track acute atmospheric conditions before population symptoms manifest.
            </p>
          </div>
        )}

        {isPhase2 && (
          <div className="space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C58BD9] inline-flex items-center gap-1.5">
                <Activity className="w-3 h-3" />
                <span>Phase 2 · Outcomes Confirm</span>
              </span>
              <span
                className="text-[10px] font-mono text-[#C58BD9] px-2 py-0.5 rounded border"
                style={{
                  background: 'rgba(197, 139, 217, 0.12)',
                  borderColor: 'rgba(197, 139, 217, 0.25)',
                }}
              >
                Fusion Engine Running
              </span>
            </div>
            <h4 className="text-sm font-semibold text-canary-text">
              Multi-Signal Syndromic & Absence Fusion
            </h4>
            <p className="text-xs text-canary-text-2 leading-relaxed">
              Aggregated clinic encounters, teleconsultations, and sickness absences confirm developing clusters across UAE accommodation villages.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div
                className="px-2 py-1 rounded border flex justify-between"
                style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <span className="text-canary-text-3 text-[10px]">Sensitivity:</span>
                <span className="font-mono font-bold text-canary-text">91.8%</span>
              </div>
              <div
                className="px-2 py-1 rounded border flex justify-between"
                style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <span className="text-canary-text-3 text-[10px]">Alert PPV:</span>
                <span className="font-mono font-bold text-canary-text">86.4%</span>
              </div>
            </div>
          </div>
        )}

        {isPhase3 && (
          <div className="space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-canary-amber inline-flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" />
                <span>Phase 3 · Lead-Time Zenith</span>
              </span>
              <span
                className="text-[10px] font-mono text-canary-amber px-2 py-0.5 rounded border font-bold"
                style={{
                  background: 'rgba(242, 163, 58, 0.15)',
                  borderColor: 'rgba(242, 163, 58, 0.35)',
                }}
              >
                +2.9 Days Lead Gain
              </span>
            </div>
            <h4 className="text-sm font-semibold text-canary-text">
              Intervention Window Maximized
            </h4>
            <p className="text-xs text-canary-text-2 leading-relaxed">
              Public health authorities and enterprise safety teams gain nearly 3 days of actionable runway before peak clinical admissions.
            </p>
          </div>
        )}

        {isPhase4 && (
          <div className="space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F06B5E] inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Phase 4 · Actionable Response</span>
              </span>
              <span
                className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded border"
                style={{
                  background: 'rgba(52, 211, 153, 0.12)',
                  borderColor: 'rgba(52, 211, 153, 0.25)',
                }}
              >
                Playbooks Ready
              </span>
            </div>
            <h4 className="text-sm font-semibold text-canary-text">
              Sense. Explain. Act Sooner.
            </h4>
            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/dashboard"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-canary-amber hover:bg-canary-amber/90 text-canvas-deep font-bold text-xs shadow-amber-glow transition-all"
              >
                <span>Open Surveillance Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/alerts"
                className="py-2 px-3 rounded-xl border text-xs text-canary-text font-semibold transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.10)',
                  borderColor: 'rgba(255, 255, 255, 0.20)',
                }}
              >
                View Alerts (3)
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Safety & Privacy Note */}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-canary-text-3">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Aggregate k ≥ 5 Enforced</span>
          </div>
          <span>Decision support only · No clinical diagnosis</span>
        </div>
      </div>
    </div>
  );
};
