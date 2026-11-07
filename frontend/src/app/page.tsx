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
  Layers,
  TrendingDown,
  CheckCircle2,
  Shield
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
          <div className="hidden lg:flex absolute right-6 sm:right-8 md:right-10 lg:right-12 xl:right-16 top-20 sm:top-24 md:top-28 z-20 pointer-events-auto w-[440px] max-w-[440px]">
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
        {/* =========================================================================
            WORKFORCE PROTECTION & PREVENTIVE RISK BANNER (GLASSMORPHISM EFFECT)
            ========================================================================= */}
        <div className="relative mb-14">
          {/* Luminous ambient background glow for glassmorphism refraction */}
          <div className="absolute -top-16 -left-12 w-[500px] h-[350px] bg-gradient-to-br from-[#F2A33A]/20 via-[#EDCB63]/12 to-transparent rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-16 -right-12 w-[500px] h-[350px] bg-gradient-to-tl from-[#6FA8C7]/20 via-[#C58BD9]/12 to-transparent rounded-full blur-[90px] pointer-events-none" />

          {/* Frosted Glassmorphism Panel */}
          <div
            className="relative rounded-3xl p-8 sm:p-10 md:p-14 overflow-hidden transition-all duration-300"
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(14, 18, 28, 0.22) 100%)',
              backdropFilter: 'blur(32px) saturate(200%)',
              WebkitBackdropFilter: 'blur(32px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.26)',
              boxShadow:
                'inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.06), 0 30px 70px -15px rgba(0, 0, 0, 0.65)',
            }}
          >
            {/* Subtle internal specular sheen sweep */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-4xl space-y-4">
              {/* Glass Tag Badge */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-canary-amber shadow-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.24)',
                  boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-canary-amber" />
                <span>Workforce Health &amp; Prevention</span>
              </div>

              {/* Headline with Specular Warm Gradient */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-canary-text tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                Protect Your Workforce.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EDCB63] via-[#F2A33A] to-[#E5483D]">
                  Stay Ahead of Risk.
                </span>
              </h2>

              {/* Prose Body */}
              <p className="text-base sm:text-lg md:text-xl text-canary-text-2 leading-relaxed font-light pt-1 drop-shadow-sm">
                Your people are your greatest asset. Don&apos;t wait for health risks to turn into workplace incidents. Canary brings environmental and health signals together to identify early warning signs, helping your organisation make smarter decisions, take preventive action, and build a safer, healthier workforce.
              </p>

              {/* Strategic Value Pillars: 3 Frosted Glass Mini-Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/15">
                {/* Pillar 1 */}
                <div
                  className="p-4 rounded-2xl flex items-start gap-3.5 transition-all duration-200 group hover:border-white/30"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.20)',
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#6FA8C7]/20 border border-[#6FA8C7]/35 flex items-center justify-center text-[#6FA8C7] shrink-0 mt-0.5 shadow-sm">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-canary-text group-hover:text-canary-amber transition-colors">
                      Environmental Precursors
                    </h4>
                    <p className="text-[11px] text-canary-text-3 mt-1 leading-normal">
                      Detect acute heat and air quality anomalies 24–48h before symptoms rise.
                    </p>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div
                  className="p-4 rounded-2xl flex items-start gap-3.5 transition-all duration-200 group hover:border-white/30"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.20)',
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#C58BD9]/20 border border-[#C58BD9]/35 flex items-center justify-center text-[#C58BD9] shrink-0 mt-0.5 shadow-sm">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-canary-text group-hover:text-canary-amber transition-colors">
                      Syndromic Fusion
                    </h4>
                    <p className="text-[11px] text-canary-text-3 mt-1 leading-normal">
                      Correlate workplace sick leaves with clinic encounters with zero individual tracking.
                    </p>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div
                  className="p-4 rounded-2xl flex items-start gap-3.5 transition-all duration-200 group hover:border-white/30"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.20)',
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-canary-text group-hover:text-canary-amber transition-colors">
                      Proportionate Playbooks
                    </h4>
                    <p className="text-[11px] text-canary-text-3 mt-1 leading-normal">
                      Deploy hydration hubs, shift rotations, and early outreach before incidents happen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            HOW CANARY EMPOWERS YOUR ORGANISATION (5 BOXES SECTION)
            ========================================================================= */}
        <div className="relative mb-20">
          {/* Luminous ambient background glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-[#F2A33A]/10 via-[#EDCB63]/8 to-[#6FA8C7]/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Heading with Cursive Stylish Font & Canary Logo */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center mb-16">
            <span className="font-cursive-stylish text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#EDCB63] tracking-wide font-normal leading-tight drop-shadow-[0_2px_16px_rgba(237,203,99,0.4)]">
              How
            </span>
            <div className="my-1 sm:my-2">
              <CanaryLogo variant="full" size="hero" glow="metallic" priority />
            </div>
            <span className="font-cursive-stylish text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-canary-text tracking-wide font-normal leading-tight drop-shadow-[0_2px_16px_rgba(255,255,255,0.2)]">
              Empowers Your Organisation
            </span>
          </div>

          {/* 5 Glassmorphism Boxes */}
          <div className="relative z-10 space-y-6">
            {/* Row 1: 3 Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1 */}
              <div
                className="relative rounded-3xl p-7 sm:p-8 overflow-hidden transition-all duration-300 group hover:border-[#F2A33A]/50 hover:shadow-[0_24px_54px_-8px_rgba(242,163,58,0.18)] flex flex-col justify-between"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(14, 18, 28, 0.22) 100%)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  boxShadow:
                    'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35), 0 20px 48px -10px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-canary-amber px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/15">
                      01
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#F2A33A]/15 border border-[#F2A33A]/30 flex items-center justify-center text-[#F2A33A] group-hover:scale-110 transition-transform">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-canary-text tracking-tight mt-5 group-hover:text-canary-amber transition-colors leading-snug">
                    Protect your workforce before risks escalate.
                  </h3>
                  <p className="text-xs sm:text-sm text-canary-text-2 leading-relaxed font-light mt-3">
                    A sudden increase in heat exposure, pollution or illness can put workers at risk before organisations realise something is wrong. Canary identifies unusual patterns early, giving companies an opportunity to investigate and take preventive action before situations become more serious.
                  </p>
                </div>
              </div>

              {/* Box 2 */}
              <div
                className="relative rounded-3xl p-7 sm:p-8 overflow-hidden transition-all duration-300 group hover:border-[#F2A33A]/50 hover:shadow-[0_24px_54px_-8px_rgba(242,163,58,0.18)] flex flex-col justify-between"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(14, 18, 28, 0.22) 100%)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  boxShadow:
                    'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35), 0 20px 48px -10px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-canary-amber px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/15">
                      02
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#6FA8C7]/15 border border-[#6FA8C7]/30 flex items-center justify-center text-[#6FA8C7] group-hover:scale-110 transition-transform">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-canary-text tracking-tight mt-5 group-hover:text-canary-amber transition-colors leading-snug">
                    Reduce operational disruptions and unexpected costs.
                  </h3>
                  <p className="text-xs sm:text-sm text-canary-text-2 leading-relaxed font-light mt-3">
                    Health incidents can lead to increased absenteeism, reduced productivity, emergency responses and workforce shortages. By highlighting emerging risks, Canary helps organisations plan ahead, minimise avoidable disruptions and make better use of their resources.
                  </p>
                </div>
              </div>

              {/* Box 3 */}
              <div
                className="relative rounded-3xl p-7 sm:p-8 overflow-hidden transition-all duration-300 group hover:border-[#F2A33A]/50 hover:shadow-[0_24px_54px_-8px_rgba(242,163,58,0.18)] flex flex-col justify-between"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(14, 18, 28, 0.22) 100%)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  boxShadow:
                    'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35), 0 20px 48px -10px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-canary-amber px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/15">
                      03
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#C58BD9]/15 border border-[#C58BD9]/30 flex items-center justify-center text-[#C58BD9] group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-canary-text tracking-tight mt-5 group-hover:text-canary-amber transition-colors leading-snug">
                    Make decisions backed by evidence, not guesswork.
                  </h3>
                  <p className="text-xs sm:text-sm text-canary-text-2 leading-relaxed font-light mt-3">
                    Instead of relying on scattered reports or isolated warning signs, Canary brings multiple data sources together. It shows what changed, where the risk is emerging and which signals contributed, allowing decision-makers to respond with greater clarity and confidence.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: 2 Boxes (Balanced & Centered) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Box 4 */}
              <div
                className="relative rounded-3xl p-7 sm:p-8 overflow-hidden transition-all duration-300 group hover:border-[#F2A33A]/50 hover:shadow-[0_24px_54px_-8px_rgba(242,163,58,0.18)] flex flex-col justify-between"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(14, 18, 28, 0.22) 100%)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  boxShadow:
                    'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35), 0 20px 48px -10px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-canary-amber px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/15">
                      04
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#EDCB63]/15 border border-[#EDCB63]/30 flex items-center justify-center text-[#EDCB63] group-hover:scale-110 transition-transform">
                      <Compass className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-canary-text tracking-tight mt-5 group-hover:text-canary-amber transition-colors leading-snug">
                    Stay one step ahead with a proactive safety strategy.
                  </h3>
                  <p className="text-xs sm:text-sm text-canary-text-2 leading-relaxed font-light mt-3">
                    Traditional responses often begin after incidents have already occurred. Canary encourages organisations to move from reactive problem-solving to preventive risk management, helping safety teams identify patterns, prioritise locations and plan timely interventions.
                  </p>
                </div>
              </div>

              {/* Box 5 */}
              <div
                className="relative rounded-3xl p-7 sm:p-8 overflow-hidden transition-all duration-300 group hover:border-[#F2A33A]/50 hover:shadow-[0_24px_54px_-8px_rgba(242,163,58,0.18)] flex flex-col justify-between"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(14, 18, 28, 0.22) 100%)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  boxShadow:
                    'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35), 0 20px 48px -10px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-canary-amber px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/15">
                      05
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-canary-text tracking-tight mt-5 group-hover:text-canary-amber transition-colors leading-snug">
                    Build trust through responsible, privacy-first monitoring.
                  </h3>
                  <p className="text-xs sm:text-sm text-canary-text-2 leading-relaxed font-light mt-3">
                    Workforce health should never come at the cost of employee privacy. Canary works with aggregated data rather than individual health records, allowing organisations to monitor broader health trends while respecting employee confidentiality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
