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
  CheckCircle2,
  ChevronDown,
  Bell,
  Sun,
  CloudFog,
  CloudSun,
  CloudRain,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface GlassmorphismTelemetryHUDProps {
  scrollProgress: number; // 0.0 to 1.0
  className?: string;
}

export const GlassmorphismTelemetryHUD: React.FC<GlassmorphismTelemetryHUDProps> = ({
  scrollProgress,
  className = '',
}) => {
  // Interactive toggle switches matching the UI reference
  const [wbgtActive, setWbgtActive] = useState(true);
  const [pmActive, setPmActive] = useState(true);
  const [secondaryTriggerActive, setSecondaryTriggerActive] = useState(true);
  const [timelineActive, setTimelineActive] = useState(true);
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Wed');

  // Progressive flight narrative stages based on scroll:
  // Phase 1 (0.00 - 0.28): Dawn Precursor / Environmental Lead
  // Phase 2 (0.28 - 0.62): Valley Traverse / Multi-Signal Syndromic Fusion
  // Phase 3 (0.62 - 0.88): Detection Horizon / +2.9d Lead Gain Zenith
  // Phase 4 (0.88 - 1.00): Proportionate Action Playbooks
  const isPhase1 = scrollProgress < 0.28;
  const isPhase2 = scrollProgress >= 0.28 && scrollProgress < 0.62;
  const isPhase3 = scrollProgress >= 0.62 && scrollProgress < 0.88;
  const isPhase4 = scrollProgress >= 0.88;

  // Active highlighted day shifts dynamically with scroll progress if user hasn't overridden
  const activeForecastDay = isPhase1 ? 'Mon' : isPhase2 ? 'Tue' : 'Wed';

  return (
    <div
      className={`w-full max-w-xl xl:max-w-2xl flex flex-col gap-3.5 select-none pointer-events-auto transition-all duration-700 ease-out ${className}`}
    >
      {/* Top Floating Telemetry Header (Quick-Status Pill, Bell Icon, Avatar) matching UI reference */}
      <div className="flex items-center justify-between px-1">
        {/* Live Surveillance Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D0F14]/70 backdrop-blur-xl border border-white/10 shadow-lg text-[11px] text-canary-text-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="font-semibold text-canary-text">Live Telemetry</span>
          <span className="text-canary-text-3">·</span>
          <span className="text-canary-amber font-mono font-medium">
            {isPhase1 && 'Phase 1: Environmental Lead'}
            {isPhase2 && 'Phase 2: Syndromic Fusion'}
            {isPhase3 && 'Phase 3: Lead-Time Zenith'}
            {isPhase4 && 'Phase 4: Action Playbooks'}
          </span>
        </div>

        {/* Right Notification Bell + User Avatar (Direct from UI Reference) */}
        <div className="flex items-center gap-2">
          <Link
            href="/alerts"
            className="relative p-2 rounded-2xl bg-[#0D0F14]/70 hover:bg-[#0D0F14]/90 backdrop-blur-xl border border-white/10 text-canary-text-2 hover:text-canary-amber transition-colors shadow-lg group"
            title="Active Surveillance Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F2A33A] text-canvas-deep text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(242,163,58,0.8)]">
              3
            </span>
          </Link>
          <div
            className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#F2A33A] to-[#EDCB63] p-0.5 shadow-lg border border-white/15 flex items-center justify-center overflow-hidden cursor-pointer"
            title="Surveillance Officer (MOHAP Demo Role)"
          >
            <div className="w-full h-full rounded-[14px] bg-[#161617] flex items-center justify-center text-[10px] font-bold text-canary-amber">
              SO
            </div>
          </div>
        </div>
      </div>

      {/* Top Grid: Semicircular Arc Gauge Card + Sparkline Air Quality Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* =========================================================================
            CARD 1: Semicircular Hazard Gauge (Thermal Stress WBGT)
            Matches the semicircular arc gauge with toggle in UI reference
            ========================================================================= */}
        <div className="relative rounded-3xl bg-[#0D0F14]/65 backdrop-blur-2xl border border-white/12 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)] overflow-hidden transition-all duration-300 hover:border-[#F2A33A]/40 group">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#F2A33A]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header with Pill Toggle Switch */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-canary-text">
              <Flame className="w-3.5 h-3.5 text-[#F2A33A]" />
              <span>Thermal Stress (WBGT)</span>
            </div>

            {/* Pill Toggle Switch (Matches UI Reference) */}
            <button
              onClick={() => setWbgtActive(!wbgtActive)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                wbgtActive
                  ? 'bg-gradient-to-r from-[#EDCB63] to-[#F2A33A] shadow-[0_0_10px_rgba(242,163,58,0.5)]'
                  : 'bg-white/10 border border-white/10'
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

              {/* Background Grey Arc */}
              <path
                d="M 20 75 A 60 60 0 0 1 140 75"
                fill="none"
                stroke="#2B2B30"
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

              {/* Min and Max Markers (0 and 50) */}
              <text x="18" y="88" fill="#6E7784" fontSize="8" fontFamily="monospace" textAnchor="middle">0</text>
              <text x="140" y="88" fill="#6E7784" fontSize="8" fontFamily="monospace" textAnchor="middle">50</text>

              {/* Needle Glow Indicator Dot at Current Reading */}
              {wbgtActive && (
                <>
                  <circle
                    cx="126"
                    cy="42"
                    r="6"
                    fill="#F2A33A"
                    className="filter drop-shadow-[0_0_10px_rgba(242,163,58,0.9)] animate-pulse"
                  />
                  <circle cx="126" cy="42" r="2.5" fill="#FFFFFF" />
                </>
              )}
            </svg>

            {/* Value in Center */}
            <div className="absolute bottom-0 flex flex-col items-center">
              <span className="text-2xl font-bold font-mono text-canary-text tracking-tight tabular-nums">
                {wbgtActive ? '32.4°C' : '--.-°C'}
              </span>
              <span className="text-[10px] text-canary-amber font-medium uppercase tracking-wider">
                {wbgtActive ? 'High Alert Tier' : 'Feed Paused'}
              </span>
            </div>
          </div>

          {/* Footnote Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-canary-text-3">
            <span>Ambient: 41.5°C</span>
            <span className="text-canary-amber font-semibold font-mono">+2.4d Lead</span>
          </div>
        </div>

        {/* =========================================================================
            CARD 2: Air Quality (PM2.5) Signal Sparkline with Grid & Secondary Toggle
            Matches the line chart card with double toggle in UI reference
            ========================================================================= */}
        <div className="relative rounded-3xl bg-[#0D0F14]/65 backdrop-blur-2xl border border-white/12 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)] overflow-hidden transition-all duration-300 hover:border-[#F2A33A]/40 group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#6FA8C7]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header with Top Toggle */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-canary-text">
              <Wind className="w-3.5 h-3.5 text-[#6FA8C7]" />
              <span>Air Quality (PM2.5)</span>
            </div>

            {/* Top Toggle Switch */}
            <button
              onClick={() => setPmActive(!pmActive)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                pmActive
                  ? 'bg-gradient-to-r from-[#EDCB63] to-[#F2A33A] shadow-[0_0_10px_rgba(242,163,58,0.5)]'
                  : 'bg-white/10 border border-white/10'
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

          {/* Sparkline Curve with Y-Grid (600, 400, 200, 0 like reference) */}
          <div className="relative h-20 w-full my-1 flex items-end">
            <svg viewBox="0 0 220 80" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="pmAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F2A33A" stopOpacity={pmActive ? '0.45' : '0.05'} />
                  <stop offset="100%" stopColor="#F2A33A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines (matching reference image) */}
              <line x1="24" y1="18" x2="215" y2="18" stroke="#2B2B30" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="24" y1="42" x2="215" y2="42" stroke="#2B2B30" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="24" y1="68" x2="215" y2="68" stroke="#2B2B30" strokeWidth="0.5" />

              {/* Y-Axis Labels (0, 200, 400, 600) */}
              <text x="18" y="21" fill="#6E7784" fontSize="7" fontFamily="monospace" textAnchor="end">600</text>
              <text x="18" y="45" fill="#6E7784" fontSize="7" fontFamily="monospace" textAnchor="end">400</text>
              <text x="18" y="71" fill="#6E7784" fontSize="7" fontFamily="monospace" textAnchor="end">0</text>

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
                stroke={pmActive ? '#F2A33A' : '#3F4450'}
                strokeWidth="2.2"
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
                    className="filter drop-shadow-[0_0_8px_rgba(242,163,58,0.9)]"
                  />
                  <circle cx="135" cy="22" r="2" fill="#FFFFFF" />
                </>
              )}
            </svg>

            {/* Peak Callout Badge */}
            {pmActive && (
              <div className="absolute top-0 right-2 bg-canvas-deep/85 backdrop-blur-md px-1.5 py-0.5 rounded border border-[#F2A33A]/40 text-[9px] font-mono text-canary-amber">
                Peak: 118 µg/m³
              </div>
            )}
          </div>

          {/* Time axis matching UI reference (10am, 3pm, 6pm, Sun, 12pm) */}
          <div className="flex items-center justify-between text-[9px] text-canary-text-3 font-mono pt-1 border-t border-white/5 pl-6">
            <span>10am</span>
            <span>3pm</span>
            <span>6pm</span>
            <span className="text-canary-amber font-semibold">Sun</span>
            <span>12pm</span>
          </div>

          {/* Secondary Row with Second Toggle (Matches UI Reference Second Toggle) */}
          <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-white/5 text-[11px] text-canary-text-2">
            <span className="text-canary-text-2">Threshold Alert Trigger</span>
            <button
              onClick={() => setSecondaryTriggerActive(!secondaryTriggerActive)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                secondaryTriggerActive
                  ? 'bg-[#F2A33A]'
                  : 'bg-white/10 border border-white/10'
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
          CARD 3: Detection Horizon Timeline Card (Bell Curve + 7-Day Forecast Strip)
          Matches Golden Hour Timeline card with bell curve and weather strip in UI reference
          ========================================================================= */}
      <div className="relative rounded-3xl bg-[#0D0F14]/65 backdrop-blur-2xl border border-white/12 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)] overflow-hidden transition-all duration-300 hover:border-[#F2A33A]/40">
        <div className="absolute -bottom-16 -left-12 w-48 h-48 bg-[#F2A33A]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header with Toggle Switch */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-canary-text">
            <Clock className="w-3.5 h-3.5 text-canary-amber" />
            <span>Early Detection Horizon (+2.9d Lead)</span>
          </div>

          {/* Pill Toggle Switch */}
          <button
            onClick={() => setTimelineActive(!timelineActive)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
              timelineActive
                ? 'bg-gradient-to-r from-[#EDCB63] to-[#F2A33A] shadow-[0_0_10px_rgba(242,163,58,0.5)]'
                : 'bg-white/10 border border-white/10'
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
              stroke={timelineActive ? '#F2A33A' : '#3F4450'}
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
                  className="filter drop-shadow-[0_0_10px_rgba(242,163,58,0.9)]"
                />
                <circle cx="160" cy="16" r="2" fill="#FFFFFF" />
              </>
            )}
          </svg>

          {/* Floating Callout at Peak */}
          {timelineActive && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-panel-raised/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#F2A33A]/50 text-[10px] font-mono text-canary-amber shadow-lg whitespace-nowrap">
              +2.9 Days Lead Gain Peak
            </div>
          )}
        </div>

        {/* Time Markers under Bell Curve (8am, 10am, 12pm, 1pm, 3pm like reference image) */}
        <div className="flex items-center justify-between text-[9px] text-canary-text-3 font-mono px-4 pb-2 border-b border-white/5">
          <span>8am</span>
          <span>10am</span>
          <span className="text-canary-amber font-semibold">12pm</span>
          <span>1pm</span>
          <span>3pm</span>
        </div>

        {/* 7-Day Day-of-Week Forecast Strip (Mon Thu Fri Sat Sun with highlighted day pill) */}
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
                    ? 'bg-white/10 border border-white/25 shadow-lg scale-105'
                    : 'bg-transparent border border-transparent hover:bg-white/5'
                }`}
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

        {/* Down Chevron Centered (Directly from UI Reference) */}
        <div className="flex items-center justify-center pt-2 text-canary-text-3 hover:text-canary-amber transition-colors">
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </div>

      {/* =========================================================================
          CARD 4: Synchronized Narrative & Multi-Signal Fusion Card
          Shows core principles seamlessly on the right side without covering Canary on the left!
          ========================================================================= */}
      <div className="relative rounded-3xl bg-[#0D0F14]/75 backdrop-blur-2xl border border-white/12 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition-all duration-500 overflow-hidden">
        {/* Dynamic Story Segment synchronized with scroll flight */}
        {isPhase1 && (
          <div className="space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-canary-amber inline-flex items-center gap-1.5">
                <Wind className="w-3 h-3" />
                <span>Phase 1 · Exposure Leads</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
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
              <span className="text-[10px] font-mono text-[#C58BD9] bg-[#C58BD9]/10 px-2 py-0.5 rounded border border-[#C58BD9]/20">
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
              <div className="px-2 py-1 rounded bg-white/5 border border-white/5 flex justify-between">
                <span className="text-canary-text-3 text-[10px]">Sensitivity:</span>
                <span className="font-mono font-bold text-canary-text">91.8%</span>
              </div>
              <div className="px-2 py-1 rounded bg-white/5 border border-white/5 flex justify-between">
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
              <span className="text-[10px] font-mono text-canary-amber bg-[#F2A33A]/15 px-2 py-0.5 rounded border border-[#F2A33A]/30 font-bold">
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
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
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
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-canary-text font-semibold transition-colors"
              >
                View Alerts (3)
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Safety & Privacy Note */}
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-canary-text-3">
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
