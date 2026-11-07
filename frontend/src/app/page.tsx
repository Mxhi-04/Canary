'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useDemoRole } from '@/context/RoleContext';
import { DEMO_ROLES } from '@/lib/data/seededData';
import { ScrollFrameCanvas } from '@/components/landing/ScrollFrameCanvas';
import { ScrollVideoScrubber } from '@/components/landing/ScrollVideoScrubber';
import { CanaryLogo } from '@/components/shared/CanaryLogo';
import { GlassmorphismTelemetryHUD } from '@/components/landing/GlassmorphismTelemetryHUD';
import {
  ShieldAlert,
  ArrowRight,
  Play,
  Pause,
  ChevronDown,
  Activity,
  Wind,
  ShieldCheck,
  BarChart3,
  Users,
  Compass,
  FileText,
  Building2,
  Lock,
  Sparkles,
  Film,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const { activeRole, setRole, roleInfo } = useDemoRole();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAutoFlying, setIsAutoFlying] = useState(false);
  const [renderEngine, setRenderEngine] = useState<'canvas' | 'video'>('canvas');
  const autoFlyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Window scroll event listener to compute normalized scroll progress (0.0 to 1.0)
  // RAF-throttled to synchronize with display V-Sync (60Hz / 120Hz ProMotion) with zero dropped frames
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!containerRef.current || isAutoFlying) return;

      if (!ticking) {
        requestAnimationFrame(() => {
          if (!containerRef.current) {
            ticking = false;
            return;
          }
          const rect = containerRef.current.getBoundingClientRect();
          const totalScrollable = rect.height - window.innerHeight;

          if (totalScrollable > 0) {
            const scrolled = -rect.top;
            const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
            setScrollProgress(progress);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAutoFlying]);

  // Auto Fly Preview toggle (hands-free animation play matching native 8s video duration)
  const toggleAutoFly = () => {
    if (isAutoFlying) {
      setIsAutoFlying(false);
      if (autoFlyTimerRef.current) clearInterval(autoFlyTimerRef.current);
    } else {
      setIsAutoFlying(true);
      const stepDuration = 40; // ms per step for native 24fps cadence
      const stepAmount = 0.005; // 200 steps * 40ms = 8.0 seconds total

      autoFlyTimerRef.current = setInterval(() => {
        setScrollProgress((prev) => {
          if (prev >= 1) {
            setIsAutoFlying(false);
            if (autoFlyTimerRef.current) clearInterval(autoFlyTimerRef.current);
            return 1;
          }
          return prev + stepAmount;
        });
      }, stepDuration);
    }
  };

  useEffect(() => {
    return () => {
      if (autoFlyTimerRef.current) clearInterval(autoFlyTimerRef.current);
    };
  }, []);

  return (
    <div className="bg-canvas text-canary-text min-h-screen selection:bg-canary-amber selection:text-canvas-deep">
      {/* Fixed Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-canvas-deep/80 backdrop-blur-md border-b border-border/80 px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group" title="Canary Home">
          <CanaryLogo variant="full" size="md" glow="subtle" />
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs text-canary-text-2 font-medium">
          <a href="#flight-story" className="hover:text-canary-amber transition-colors">
            Flight Story
          </a>
          <Link href="/dashboard" className="hover:text-canary-amber transition-colors">
            Surveillance Map
          </Link>
          <Link href="/alerts" className="hover:text-canary-amber transition-colors">
            Alert Inbox
          </Link>
          <Link href="/replay" className="hover:text-canary-amber transition-colors">
            Scenario Replay
          </Link>
          <Link href="/validation" className="hover:text-canary-amber transition-colors">
            Validation
          </Link>
          <Link href="/privacy" className="hover:text-canary-amber transition-colors">
            Privacy &amp; Governance
          </Link>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-control bg-canary-amber hover:bg-canary-amber/90 text-canvas-deep font-bold text-xs shadow-amber-glow transition-all"
          >
            <span>Enter Monitoring Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Main Scroll Animation Track (400vh tall scroll track) */}
      <div id="flight-story" ref={containerRef} className="relative h-[400vh] w-full">
        {/* Sticky 100vh Viewport Holding the High-Speed Canvas / All-Intra Video */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Hardware-Accelerated Animation Element (Zero-Lag Frame Scrubbing) */}
          <div className="absolute inset-0 w-full h-full">
            {renderEngine === 'canvas' ? (
              <ScrollFrameCanvas
                progress={scrollProgress}
                className="w-full h-full"
              />
            ) : (
              <ScrollVideoScrubber
                progress={scrollProgress}
                className="w-full h-full"
              />
            )}

            {/* Seamless Vignette Gradients */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-canvas-deep/90 via-canvas-deep/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-canvas via-canvas/60 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-canvas/60 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-canvas/60 to-transparent pointer-events-none" />
          </div>

          {/* Floating Flight Path & Progress Indicator (Bottom Center) */}
          <div className="absolute bottom-6 z-30 flex items-center gap-3 md:gap-4 bg-canvas-deep/90 backdrop-blur-md px-4 py-2 rounded-full border border-border-strong shadow-2xl">
            {/* Auto-fly Toggle Button */}
            <button
              onClick={toggleAutoFly}
              className="p-1.5 rounded-full bg-panel hover:bg-panel-raised text-canary-amber transition-colors flex items-center gap-1.5"
              title={isAutoFlying ? 'Pause auto flight' : 'Auto play flight (24fps)'}
            >
              {isAutoFlying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              <span className="hidden sm:inline text-[11px] font-semibold text-canary-text pr-1">
                {isAutoFlying ? 'Pause' : 'Auto Play'}
              </span>
            </button>

            {/* Renderer Switcher Toggle */}
            <button
              onClick={() => setRenderEngine(renderEngine === 'canvas' ? 'video' : 'canvas')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-panel-inset hover:bg-panel border border-border text-[11px] text-canary-text-2 hover:text-canary-amber transition-colors"
              title="Toggle between 190-Frame Canvas or All-Intra 1080p Video"
            >
              {renderEngine === 'canvas' ? (
                <>
                  <Layers className="w-3 h-3 text-canary-amber" />
                  <span>Engine: 190-Frame Canvas</span>
                </>
              ) : (
                <>
                  <Film className="w-3 h-3 text-[#6FA8C7]" />
                  <span>Engine: All-Intra 1080p Video</span>
                </>
              )}
            </button>

            {/* Flight Path Segment Markers */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-canary-text-2">
              <span
                className={`transition-colors ${
                  scrollProgress < 0.25 ? 'text-canary-amber font-bold' : 'text-canary-text-3'
                }`}
              >
                1. Dawn
              </span>
              <span className="text-canary-text-3">→</span>
              <span
                className={`transition-colors ${
                  scrollProgress >= 0.25 && scrollProgress < 0.5
                    ? 'text-canary-amber font-bold'
                    : 'text-canary-text-3'
                }`}
              >
                2. Left Arrival
              </span>
              <span className="text-canary-text-3">→</span>
              <span
                className={`transition-colors ${
                  scrollProgress >= 0.5 && scrollProgress < 0.75
                    ? 'text-canary-amber font-bold'
                    : 'text-canary-text-3'
                }`}
              >
                3. Valley Flight
              </span>
              <span className="text-canary-text-3">→</span>
              <span
                className={`transition-colors ${
                  scrollProgress >= 0.75 ? 'text-canary-amber font-bold' : 'text-canary-text-3'
                }`}
              >
                4. Right Exit
              </span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-20 md:w-24 bg-panel-inset rounded-full h-1.5 overflow-hidden border border-border">
              <div
                className="h-full bg-gradient-to-r from-[#E8C14A] to-[#F2A33A] rounded-full transition-all duration-150"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-canary-amber tabular-nums font-bold">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          {/* =========================================================================
              DYNAMIC NARRATIVE OVERLAYS (SYNCHRONIZED WITH SCROLL PROGRESS)
              ========================================================================= */}

          {/* =========================================================================
              HERO IDENTITY (LEFT-ALIGNED) — STAYS ANCHORED AS SCROLLING OCCURS
              ========================================================================= */}
          <div
            className="absolute left-6 sm:left-10 md:left-14 lg:left-16 xl:left-24 top-[14%] sm:top-[16%] md:top-[18%] z-20 max-w-lg xl:max-w-xl px-4 sm:px-0 text-left transition-all duration-500 ease-out flex flex-col items-start pointer-events-auto"
          >
            {/* Future Health Challenge 06 Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D0F14]/70 border border-white/10 backdrop-blur-xl mb-3 text-xs font-semibold uppercase tracking-wider text-canary-amber shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-canary-amber animate-pulse" />
              <span>Future Health Challenge 06</span>
            </div>

            {/* Authentic Brand Wordmark with Metallic Glow & Increased Size */}
            <div className="mb-2 -ml-2 sm:-ml-3">
              <CanaryLogo variant="full" size="hero" glow="metallic" priority />
            </div>

            {/* Tagline */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#EDCB63] tracking-tight leading-snug max-w-xl mt-1 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              A Healthier Tomorrow Starts with Early Detection.
            </h2>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-canary-text-2 mt-3 max-w-lg leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
              Sense emerging population and workforce health risks by combining environmental exposure leads with aggregated health-service and workplace outcomes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mt-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-3 rounded-control bg-canary-amber hover:bg-canary-amber/90 text-canvas-deep font-bold text-sm shadow-amber-glow hover:shadow-[0_0_24px_rgba(242,163,58,0.5)] transition-all"
              >
                <span>Launch Monitoring Room</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  window.scrollTo({
                    top: window.innerHeight * 1.1,
                    behavior: 'smooth',
                  });
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-control bg-[#0D0F14]/80 hover:bg-[#0D0F14] border border-white/15 text-xs font-semibold text-canary-text backdrop-blur-md transition-colors shadow-lg"
              >
                <span>Scroll to start bird flight</span>
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>

            {/* Subtle Flight Story Phase Indicator */}
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D0F14]/60 backdrop-blur-md border border-white/5 text-[11px] text-canary-text-3 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2A33A]" />
              <span>
                {scrollProgress < 0.25 && 'Story: 1. Dawn Precursor Detection'}
                {scrollProgress >= 0.25 && scrollProgress < 0.50 && 'Story: 2. Valley Exposure & Bird Arrival'}
                {scrollProgress >= 0.50 && scrollProgress < 0.75 && 'Story: 3. Syndromic Fusion Horizon'}
                {scrollProgress >= 0.75 && 'Story: 4. Proportionate Action & Exit'}
              </span>
            </div>
          </div>

          {/* =========================================================================
              RIGHT-SIDE SURVEILLANCE TELEMETRY HUD (GLASSMORPHISM CARDS FROM UI REF)
              Cards glide in one by one on GPU-composited layers during flight
              ========================================================================= */}
          <div className="hidden lg:flex absolute right-6 sm:right-8 md:right-10 lg:right-12 xl:right-16 top-[7%] sm:top-[8%] z-20 pointer-events-auto w-[440px] max-w-[440px]">
            <GlassmorphismTelemetryHUD scrollProgress={scrollProgress} />
          </div>

          {/* Mobile Telemetry Drawer / Teaser Pill */}
          <div
            className={`lg:hidden absolute bottom-20 left-4 right-4 z-20 transition-all duration-500 ${
              scrollProgress > 0.05 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <div className="rounded-2xl bg-[#0D0F14]/90 backdrop-blur-xl border border-white/10 p-3 shadow-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-canary-text">Surveillance Active</span>
                <span className="text-canary-amber font-mono font-bold">+2.9d Lead</span>
              </div>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg bg-canary-amber text-canvas-deep font-bold text-[11px] shadow-sm flex items-center gap-1"
              >
                <span>Enter Room</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          GATEWAY & FEATURE SHOWCASE SECTION (BELOW SCROLL TRACK)
          ========================================================================= */}
      <section className="relative z-30 bg-canvas px-6 md:px-12 py-16 max-w-[1440px] mx-auto border-t border-border">
        {/* Hero Entry Card */}
        <div className="canary-panel p-8 bg-gradient-to-br from-panel-raised to-panel border-2 border-canary-amber/50 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-canary-amber">
              <span className="w-2.5 h-2.5 rounded-full bg-canary-amber shadow-amber-glow" />
              <span>Active Prototype Operational Session</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-canary-text tracking-tight">
              Enter Canary Surveillance Room
            </h2>

            <p className="text-sm text-canary-text-2 leading-relaxed max-w-2xl">
              Select your demonstration profile to inspect real-time regional monitoring across Abu Dhabi, Musaffah, Al Ain, and Dubai South. Roles enforce strict backend scoping and small-cell privacy suppression.
            </p>

            {/* Quick Role Switcher Buttons */}
            <div className="pt-2 flex items-center flex-wrap gap-2 text-xs">
              <span className="text-canary-text-3 font-semibold mr-1">Demo Role:</span>
              {DEMO_ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`px-3 py-1.5 rounded-control font-medium transition-all ${
                    activeRole === r.id
                      ? 'bg-canary-amber text-canvas-deep font-bold shadow-amber-glow'
                      : 'bg-panel-inset text-canary-text-2 hover:bg-panel border border-border'
                  }`}
                >
                  {r.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Launch Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0 w-full lg:w-auto">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-control bg-canary-amber hover:bg-canary-amber/90 text-canvas-deep font-bold text-sm shadow-amber-glow transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Open Surveillance Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/alerts"
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-control bg-panel-raised hover:bg-panel border border-border text-xs font-semibold text-canary-text transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-[#F08A2E]" />
              <span>Alert Inbox (3 Active)</span>
            </Link>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Pillar 1 */}
          <Link
            href="/dashboard"
            className="canary-panel p-5 hover:border-canary-amber/60 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#6FA8C7]/15 border border-[#6FA8C7]/30 flex items-center justify-center text-[#6FA8C7]">
                <Wind className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-canary-text group-hover:text-canary-amber transition-colors">
                Dual-Stage Fusion
              </h3>
              <p className="text-xs text-canary-text-3 leading-relaxed">
                Negative-binomial GLM baseline modeling combined with environmental hazard leads to sense anomalies 48h before absence ledgers.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs text-canary-amber font-semibold gap-1">
              <span>View Map</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Pillar 2 */}
          <Link
            href="/replay"
            className="canary-panel p-5 hover:border-canary-amber/60 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#C58BD9]/15 border border-[#C58BD9]/30 flex items-center justify-center text-[#C58BD9]">
                <Play className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-canary-text group-hover:text-canary-amber transition-colors">
                Scenario Replay
              </h3>
              <p className="text-xs text-canary-text-3 leading-relaxed">
                Step day-by-day through 3 simulated scenarios with zero future leakage. Track Canary against EARS C2 and CUSUM.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs text-canary-amber font-semibold gap-1">
              <span>Replay Scenarios</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Pillar 3 */}
          <Link
            href="/validation"
            className="canary-panel p-5 hover:border-canary-amber/60 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#7FB45A]/15 border border-[#7FB45A]/30 flex items-center justify-center text-[#7FB45A]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-canary-text group-hover:text-canary-amber transition-colors">
                Validation Benchmarks
              </h3>
              <p className="text-xs text-canary-text-3 leading-relaxed">
                Held-out synthetic test seeds reporting 91.8% sensitivity, 86.4% PPV, and ablation stress test results.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs text-canary-amber font-semibold gap-1">
              <span>Inspect Metrics</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Pillar 4 */}
          <Link
            href="/privacy"
            className="canary-panel p-5 hover:border-canary-amber/60 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#E5483D]/15 border border-[#E5483D]/30 flex items-center justify-center text-[#E5483D]">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-canary-text group-hover:text-canary-amber transition-colors">
                Privacy by Design
              </h3>
              <p className="text-xs text-canary-text-3 leading-relaxed">
                Canonical 4-field aggregate contract, interactive k-suppression slider (k=5), and strict prohibition of disciplinary profiling.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs text-canary-amber font-semibold gap-1">
              <span>Review Privacy</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-canary-text-3">
          <div className="flex items-center gap-3">
            <CanaryLogo variant="mark" size="sm" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-canary-text">Canary Early-Warning Platform</span>
              <span>•</span>
              <span>Challenge 06 Future Health</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privacy" className="hover:text-canary-text underline">
              Data Governance &amp; Contract
            </Link>
            <Link href="/validation" className="hover:text-canary-text underline">
              Model Card
            </Link>
            <Link href="/impact" className="hover:text-canary-text underline">
              Impact Estimator
            </Link>
          </div>
        </footer>
      </section>
    </div>
  );
}
