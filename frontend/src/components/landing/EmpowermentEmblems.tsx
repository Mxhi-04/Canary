'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CanaryLineArtLogo } from '@/components/shared/CanaryLineArtLogo';
import {
  Sparkles,
  Palette,
  Wind,
  ShieldCheck,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  DollarSign,
  Cpu,
  LineChart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Lock,
  EyeOff,
  type LucideIcon,
} from 'lucide-react';

interface MetricBadge {
  icon: LucideIcon;
  label: string;
  color: string;
}

interface EmpowermentPillar {
  id: string;
  tag: string;
  headlineRegular: string;
  headlineHighlight: string;
  title: string;
  description: string;
  emblemGold: string;
  emblemTheme: string;
  accentColor: string;
  glowColor: string;
  borderHover: string;
  shadowHover: string;
  metrics: MetricBadge[];
}

const EMPOWERMENT_PILLARS: EmpowermentPillar[] = [
  {
    id: '01',
    tag: 'Early Precursor',
    headlineRegular: 'Detect. Understand. ',
    headlineHighlight: 'Act.',
    title: 'Protect your workforce before risks escalate.',
    description:
      'A sudden increase in heat exposure, pollution or illness can put workers at risk before organisations realise something is wrong. Canary identifies unusual patterns early, giving companies an opportunity to investigate and take preventive action before situations become more serious.',
    emblemGold: '/images/empowerment/emblem-gold-1.png',
    emblemTheme: '/images/empowerment/emblem-theme-1.png',
    accentColor: '#F2A33A',
    glowColor: 'rgba(242, 163, 58, 0.45)',
    borderHover: 'hover:border-[#F2A33A]/60',
    shadowHover: 'hover:shadow-[0_24px_54px_-8px_rgba(242,163,58,0.22)]',
    metrics: [
      { icon: ShieldCheck, label: 'Early Risk Detection', color: '#F2A33A' },
      { icon: Users, label: 'Workforce Wellbeing', color: '#EDCB63' },
      { icon: TrendingUp, label: 'Data-Driven Decisions', color: '#E8C14A' },
    ],
  },
  {
    id: '02',
    tag: 'Cost Containment',
    headlineRegular: 'Anticipate. Stabilise. ',
    headlineHighlight: 'Sustain.',
    title: 'Reduce operational disruptions and unexpected costs.',
    description:
      'Health incidents can lead to increased absenteeism, reduced productivity, emergency responses and workforce shortages. By highlighting emerging risks, Canary helps organisations plan ahead, minimise avoidable disruptions and make better use of their resources.',
    emblemGold: '/images/empowerment/emblem-gold-2.png',
    emblemTheme: '/images/empowerment/emblem-theme-2.png',
    accentColor: '#6FA8C7',
    glowColor: 'rgba(111, 168, 199, 0.45)',
    borderHover: 'hover:border-[#6FA8C7]/60',
    shadowHover: 'hover:shadow-[0_24px_54px_-8px_rgba(111,168,199,0.22)]',
    metrics: [
      { icon: TrendingDown, label: 'Absenteeism Reduction', color: '#F2A33A' },
      { icon: CheckCircle2, label: 'Avoidable Disruption', color: '#EDCB63' },
      { icon: Shield, label: 'Resource Efficiency', color: '#E8C14A' },
    ],
  },
  {
    id: '03',
    tag: 'Decision Science',
    headlineRegular: 'Analyze. Correlate. ',
    headlineHighlight: 'Decide.',
    title: 'Make decisions backed by evidence, not guesswork.',
    description:
      'Instead of relying on scattered reports or isolated warning signs, Canary brings multiple data sources together. It shows what changed, where the risk is emerging and which signals contributed, allowing decision-makers to respond with greater clarity and confidence.',
    emblemGold: '/images/empowerment/emblem-gold-3.png',
    emblemTheme: '/images/empowerment/emblem-theme-3.png',
    accentColor: '#C58BD9',
    glowColor: 'rgba(197, 139, 217, 0.45)',
    borderHover: 'hover:border-[#C58BD9]/60',
    shadowHover: 'hover:shadow-[0_24px_54px_-8px_rgba(197,139,217,0.22)]',
    metrics: [
      { icon: Cpu, label: 'Dual-Stage Fusion', color: '#F2A33A' },
      { icon: LineChart, label: 'Signal Attribution', color: '#EDCB63' },
      { icon: CheckCircle2, label: 'Evidence Actions', color: '#E8C14A' },
    ],
  },
  {
    id: '04',
    tag: 'Proactive Safety',
    headlineRegular: 'Forecast. Intervene. ',
    headlineHighlight: 'Prevent.',
    title: 'Stay one step ahead with a proactive safety strategy.',
    description:
      'Traditional responses often begin after incidents have already occurred. Canary encourages organisations to move from reactive problem-solving to preventive risk management, helping safety teams identify patterns, prioritise locations and plan timely interventions.',
    emblemGold: '/images/empowerment/emblem-gold-4.png',
    emblemTheme: '/images/empowerment/emblem-theme-4.png',
    accentColor: '#EDCB63',
    glowColor: 'rgba(237, 203, 99, 0.45)',
    borderHover: 'hover:border-[#EDCB63]/60',
    shadowHover: 'hover:shadow-[0_24px_54px_-8px_rgba(237,203,99,0.22)]',
    metrics: [
      { icon: AlertTriangle, label: 'Hazard Prioritisation', color: '#F2A33A' },
      { icon: Clock, label: '48h Early Lead', color: '#EDCB63' },
      { icon: ShieldAlert, label: 'Targeted Playbooks', color: '#E8C14A' },
    ],
  },
  {
    id: '05',
    tag: 'Privacy by Design',
    headlineRegular: 'Aggregate. Protect. ',
    headlineHighlight: 'Trust.',
    title: 'Build trust through responsible, privacy-first monitoring.',
    description:
      'Workforce health should never come at the cost of employee privacy. Canary works with aggregated data rather than individual health records, allowing organisations to monitor broader health trends while respecting employee confidentiality.',
    emblemGold: '/images/empowerment/emblem-gold-5.png',
    emblemTheme: '/images/empowerment/emblem-theme-5.png',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    borderHover: 'hover:border-emerald-500/60',
    shadowHover: 'hover:shadow-[0_24px_54px_-8px_rgba(16,185,129,0.22)]',
    metrics: [
      { icon: Lock, label: 'Aggregated Telemetry', color: '#F2A33A' },
      { icon: EyeOff, label: 'Zero PII Retention', color: '#EDCB63' },
      { icon: ShieldCheck, label: 'Confidentiality First', color: '#E8C14A' },
    ],
  },
];

export const EmpowermentEmblems: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [colorMode, setColorMode] = useState<'gold' | 'themed'>('gold');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll tracking across the section track
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!sectionRef.current) {
            ticking = false;
            return;
          }
          const rect = sectionRef.current.getBoundingClientRect();
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
  }, []);

  // Compute slide-in and fade animation state for each card
  // Transitions: outgoing card slides left (-60px) and fades out (1 -> 0)
  // while incoming card enters from right (+80px -> 0px) and fades in (0 -> 1)
  const getCardAnim = (index: number, p: number) => {
    // 5 card timelines
    if (index === 0) {
      if (p <= 0.16) {
        return { opacity: 1, translateX: 0, scale: 1, blur: 0, isVisible: true, isInteractive: true };
      } else if (p <= 0.22) {
        const t = (p - 0.16) / 0.06;
        return {
          opacity: 1 - t,
          translateX: -t * 60,
          scale: 1 - t * 0.04,
          blur: t * 5,
          isVisible: true,
          isInteractive: t < 0.5,
        };
      } else {
        return { opacity: 0, translateX: -60, scale: 0.96, blur: 5, isVisible: false, isInteractive: false };
      }
    }

    if (index === 4) {
      if (p < 0.82) {
        return { opacity: 0, translateX: 80, scale: 0.96, blur: 5, isVisible: false, isInteractive: false };
      } else if (p <= 0.88) {
        const t = (p - 0.82) / 0.06;
        return {
          opacity: t,
          translateX: (1 - t) * 80,
          scale: 0.96 + t * 0.04,
          blur: (1 - t) * 5,
          isVisible: true,
          isInteractive: t > 0.5,
        };
      } else {
        return { opacity: 1, translateX: 0, scale: 1, blur: 0, isVisible: true, isInteractive: true };
      }
    }

    const ranges: [number, number, number, number][] = [
      [0, 0, 0, 0], // unused
      [0.16, 0.22, 0.38, 0.44], // card 1
      [0.38, 0.44, 0.60, 0.66], // card 2
      [0.60, 0.66, 0.82, 0.88], // card 3
      [0, 0, 0, 0], // unused
    ];

    const [enterStart, enterEnd, exitStart, exitEnd] = ranges[index];

    if (p < enterStart) {
      return { opacity: 0, translateX: 80, scale: 0.96, blur: 5, isVisible: false, isInteractive: false };
    } else if (p <= enterEnd) {
      const t = (p - enterStart) / (enterEnd - enterStart);
      return {
        opacity: t,
        translateX: (1 - t) * 80,
        scale: 0.96 + t * 0.04,
        blur: (1 - t) * 5,
        isVisible: true,
        isInteractive: t > 0.5,
      };
    } else if (p <= exitStart) {
      return { opacity: 1, translateX: 0, scale: 1, blur: 0, isVisible: true, isInteractive: true };
    } else if (p <= exitEnd) {
      const t = (p - exitStart) / (exitEnd - exitStart);
      return {
        opacity: 1 - t,
        translateX: -t * 60,
        scale: 1 - t * 0.04,
        blur: t * 5,
        isVisible: true,
        isInteractive: t < 0.5,
      };
    } else {
      return { opacity: 0, translateX: -60, scale: 0.96, blur: 5, isVisible: false, isInteractive: false };
    }
  };

  // Determine currently active pillar index for indicator pills
  const activeIndex =
    scrollProgress < 0.19
      ? 0
      : scrollProgress < 0.41
      ? 1
      : scrollProgress < 0.63
      ? 2
      : scrollProgress < 0.85
      ? 3
      : 4;

  // Jump to specific pillar with smooth scroll
  const scrollToPillar = (idx: number) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const currentScrollY = window.scrollY;
    const sectionTop = currentScrollY + rect.top;
    const totalScrollable = rect.height - window.innerHeight;
    const targetProgressList = [0.05, 0.30, 0.52, 0.74, 0.95];
    const targetP = targetProgressList[idx] ?? 0;
    const targetScrollY = sectionTop + targetP * totalScrollable;
    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
  };

  return (
    <div ref={sectionRef} className="relative h-[320vh] w-full mb-16">
      {/* Sticky Viewport Stage: Pinned as user scrolls through the 320vh track */}
      <div className="sticky top-16 sm:top-20 md:top-24 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] min-h-[580px] max-h-[860px] flex items-center justify-center">
        {/* Full-Bleed Celestial Background with Seamless Blurred Boundaries */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen pointer-events-none select-none overflow-hidden z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/empowerment/empowerment-bg.png"
            alt="Canary Global Surveillance Background"
            className="w-full h-full object-cover object-right opacity-90 filter brightness-105"
          />

          {/* Boundary Blurring Layers (All 4 edges gracefully feathered into canvas) */}
          <div className="absolute inset-x-0 top-0 h-32 sm:h-44 bg-gradient-to-b from-canvas via-canvas/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-44 sm:h-64 bg-gradient-to-t from-canvas via-canvas/85 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-32 sm:w-64 md:w-96 bg-gradient-to-r from-canvas via-canvas/75 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-32 sm:w-64 md:w-96 bg-gradient-to-l from-canvas via-canvas/75 to-transparent" />
        </div>

        {/* Ambient Warm Glow behind Left Title */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[550px] h-[450px] bg-gradient-to-r from-[#F2A33A]/15 via-[#EDCB63]/10 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />

        {/* Two-Column Side-by-Side Hero Stage (Matching Image 3) */}
        <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 xl:gap-14">
          {/* =========================================================================
              LEFT COLUMN: HERO IDENTITY, LOGO, THEME PALETTE & PILLAR SELECTOR
              ========================================================================= */}
          <div className="w-full lg:w-[42%] xl:w-[40%] flex flex-col items-start justify-center text-left shrink-0">
            <span className="font-cursive-stylish text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#EDCB63] tracking-wide font-normal leading-none drop-shadow-[0_2px_16px_rgba(237,203,99,0.4)]">
              How
            </span>
            <div className="my-2 sm:my-3">
              <CanaryLineArtLogo size="hero" />
            </div>
            <span className="font-cursive-stylish text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-canary-text tracking-wide font-normal leading-tight drop-shadow-[0_2px_16px_rgba(255,255,255,0.2)]">
              Empowers Your Organisation
            </span>

            {/* Theme Palette Switcher Pill */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-canvas-deep/80 border border-white/10 backdrop-blur-md shadow-lg">
                <button
                  onClick={() => setColorMode('gold')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    colorMode === 'gold'
                      ? 'bg-gradient-to-r from-[#F2A33A] to-[#EDCB63] text-canvas-deep shadow-md'
                      : 'text-canary-text-2 hover:text-canary-text'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Signature Canary Gold</span>
                </button>
                <button
                  onClick={() => setColorMode('themed')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    colorMode === 'themed'
                      ? 'bg-white/20 text-canary-text shadow-md border border-white/20'
                      : 'text-canary-text-2 hover:text-canary-text'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Pillar Chromatic</span>
                </button>
              </div>
            </div>

            {/* Interactive 5-Pillar Step Progress Indicators */}
            <div className="mt-6 flex items-center gap-2">
              {EMPOWERMENT_PILLARS.map((pillar, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <button
                    key={pillar.id}
                    onClick={() => scrollToPillar(idx)}
                    title={`${pillar.id} - ${pillar.tag}`}
                    className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-300 ${
                      isCurrent
                        ? 'bg-white/15 border-canary-amber text-canary-amber shadow-[0_0_12px_rgba(242,163,58,0.35)] scale-105'
                        : 'bg-white/5 border-white/10 text-canary-text-3 hover:text-canary-text hover:border-white/20'
                    }`}
                  >
                    <span className="font-bold">{pillar.id}</span>
                    <span
                      className={`text-[10px] hidden xl:inline font-sans font-medium transition-opacity ${
                        isCurrent ? 'opacity-100 text-white' : 'opacity-60'
                      }`}
                    >
                      {pillar.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: FLOATING ANIMATED INFO CARD STAGE (FORMAT FROM IMAGE 1/IMAGE 2)
              ========================================================================= */}
          <div className="w-full lg:w-[58%] xl:w-[60%] relative flex items-center justify-center lg:justify-end min-h-[440px] sm:min-h-[460px]">
            <div className="relative w-full max-w-[620px] h-[440px] sm:h-[460px]">
              {EMPOWERMENT_PILLARS.map((pillar, idx) => {
                const anim = getCardAnim(idx, scrollProgress);
                if (!anim.isVisible) return null;

                const highlightColor =
                  colorMode === 'gold' ? '#EDCB63' : pillar.accentColor;

                return (
                  <div
                    key={pillar.id}
                    className="absolute inset-0 rounded-3xl p-7 sm:p-9 md:p-10 flex flex-col justify-between transition-all will-change-transform"
                    style={{
                      opacity: anim.opacity,
                      transform: `translate3d(${anim.translateX}px, 0, 0) scale(${anim.scale})`,
                      filter: `blur(${anim.blur}px)`,
                      pointerEvents: anim.isInteractive ? 'auto' : 'none',
                    }}
                  >
                    {/* Deeply Diffuse Gaussian-Blurred Golden Ambient Shade on Left Edge */}
                    <div
                      className="absolute -inset-y-12 -left-12 w-80 sm:w-[420px] rounded-l-full pointer-events-none -z-10 blur-[64px] opacity-80"
                      style={{
                        background: `radial-gradient(ellipse 95% 85% at 20% 50%, ${highlightColor}30 0%, ${highlightColor}10 50%, transparent 100%)`,
                      }}
                    />

                    {/* Glassmorphism Background Layer: Subtle blurred golden tint on left, transitioning to frosted glass, then fading out towards the right */}
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none -z-10"
                      style={{
                        background: `linear-gradient(90deg, ${highlightColor}08 0%, rgba(22, 26, 36, 0.65) 24%, rgba(16, 20, 30, 0.45) 54%, rgba(12, 16, 24, 0.12) 80%, rgba(10, 13, 20, 0) 100%)`,
                        backdropFilter: 'blur(24px) saturate(175%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(175%)',
                        maskImage:
                          'linear-gradient(90deg, black 0%, black 48%, rgba(0,0,0,0.4) 75%, transparent 100%)',
                        WebkitMaskImage:
                          'linear-gradient(90deg, black 0%, black 48%, rgba(0,0,0,0.4) 75%, transparent 100%)',
                      }}
                    />

                    {/* Luminous Glassmorphism Border Highlight: High-intensity golden stroke along top & left, fading out to the right */}
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none -z-10"
                      style={{
                        borderTop: `1.5px solid ${highlightColor}D0`,
                        borderLeft: `1.5px solid ${highlightColor}A8`,
                        borderBottom: `1px solid ${highlightColor}20`,
                        borderRight: 'none',
                        boxShadow: `inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.35), inset 1.5px 0 2px 0 ${highlightColor}45, 0 0 24px -2px ${highlightColor}40, 0 20px 48px -12px rgba(0, 0, 0, 0.6)`,
                        maskImage:
                          'linear-gradient(90deg, black 0%, black 52%, rgba(0,0,0,0.3) 82%, transparent 100%)',
                        WebkitMaskImage:
                          'linear-gradient(90deg, black 0%, black 52%, rgba(0,0,0,0.3) 82%, transparent 100%)',
                      }}
                    />

                    {/* Card Body (Unmasked, Crisp, High-Contrast & Highly Legible) */}
                    <div className="relative z-10">
                      {/* Top Row: Tag + Accent Line Divider (Matching Reference Image) */}
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className="font-mono text-xs sm:text-[13px] font-bold uppercase tracking-widest whitespace-nowrap drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                          style={{ color: highlightColor }}
                        >
                          REAL-TIME INTELLIGENCE
                        </span>
                        <span className="text-white/40 text-xs font-mono">·</span>
                        <span className="font-mono text-xs sm:text-[13px] font-semibold uppercase tracking-wider text-white/80 whitespace-nowrap drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                          {pillar.tag}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/25 via-white/10 to-transparent ml-2" />
                      </div>

                      {/* Main Action Headline (Format: "Detect. Understand. Act.") */}
                      <h3 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        <span>{pillar.headlineRegular}</span>
                        <span style={{ color: highlightColor }}>
                          {pillar.headlineHighlight}
                        </span>
                      </h3>

                      {/* Subheading Title (Bold, High-Contrast White) */}
                      <p className="text-base sm:text-lg font-bold text-white mt-3 leading-snug drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                        {pillar.title}
                      </p>

                      {/* Narrative Description (Increased Font Size, Weight 450, High-Contrast Crisp Zinc-200) */}
                      <p className="text-sm sm:text-[15px] font-normal text-zinc-200 leading-relaxed mt-2.5 max-w-xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                        {pillar.description}
                      </p>
                    </div>

                    {/* Bottom Row: 3 Clean Inline Badges with Icons & Vertical Separators (Crisp High-Contrast Text) */}
                    <div className="relative z-10 pt-5 mt-4 border-t border-white/15 grid grid-cols-3 gap-2 sm:gap-4 items-center">
                      {pillar.metrics.map((metric, mIdx) => {
                        const Icon = metric.icon;
                        return (
                          <div
                            key={mIdx}
                            className={`flex items-center gap-2 sm:gap-2.5 ${
                              mIdx > 0 ? 'sm:border-l sm:border-white/15 sm:pl-3' : ''
                            }`}
                          >
                            <Icon
                              className="w-4.5 h-4.5 shrink-0 transition-colors drop-shadow-[0_0_8px_rgba(242,163,58,0.45)]"
                              style={{ color: highlightColor }}
                            />
                            <span className="text-xs sm:text-[13px] font-semibold text-zinc-100 leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                              {metric.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


