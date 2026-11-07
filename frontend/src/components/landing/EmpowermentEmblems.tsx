'use client';

import React, { useState } from 'react';
import { CanaryLogo } from '@/components/shared/CanaryLogo';
import { Sparkles, Palette } from 'lucide-react';

interface EmpowermentPillar {
  id: string;
  tag: string;
  title: string;
  description: string;
  emblemGold: string;
  emblemTheme: string;
  accentColor: string;
  glowColor: string;
  borderHover: string;
  shadowHover: string;
}

const EMPOWERMENT_PILLARS: EmpowermentPillar[] = [
  {
    id: '01',
    tag: 'Early Precursor',
    title: 'Protect your workforce before risks escalate.',
    description:
      'A sudden increase in heat exposure, pollution or illness can put workers at risk before organisations realise something is wrong. Canary identifies unusual patterns early, giving companies an opportunity to investigate and take preventive action before situations become more serious.',
    emblemGold: '/images/empowerment/emblem-gold-1.png',
    emblemTheme: '/images/empowerment/emblem-theme-1.png',
    accentColor: '#F2A33A',
    glowColor: 'rgba(242, 163, 58, 0.45)',
    borderHover: 'hover:border-[#F2A33A]/60',
    shadowHover: 'hover:shadow-[0_24px_54px_-8px_rgba(242,163,58,0.22)]',
  },
  {
    id: '02',
    tag: 'Cost Containment',
    title: 'Reduce operational disruptions and unexpected costs.',
    description:
      'Health incidents can lead to increased absenteeism, reduced productivity, emergency responses and workforce shortages. By highlighting emerging risks, Canary helps organisations plan ahead, minimise avoidable disruptions and make better use of their resources.',
    emblemGold: '/images/empowerment/emblem-gold-2.png',
    emblemTheme: '/images/empowerment/emblem-theme-2.png',
    accentColor: '#6FA8C7',
    glowColor: 'rgba(111, 168, 199, 0.45)',
    borderHover: 'hover:border-[#6FA8C7]/60',
    shadowHover: 'hover:shadow-[0_24px_54px_-8px_rgba(111,168,199,0.22)]',
  },
  {
    id: '03',
    tag: 'Decision Science',
    title: 'Make decisions backed by evidence, not guesswork.',
    description:
      'Instead of relying on scattered reports or isolated warning signs, Canary brings multiple data sources together. It shows what changed, where the risk is emerging and which signals contributed, allowing decision-makers to respond with greater clarity and confidence.',
    emblemGold: '/images/empowerment/emblem-gold-3.png',
    emblemTheme: '/images/empowerment/emblem-theme-3.png',
    accentColor: '#C58BD9',
    glowColor: 'rgba(197, 139, 217, 0.45)',
    borderHover: 'hover:border-[#C58BD9]/60',
    shadowHover: 'hover:shadow-[0_24px_54px_-8px_rgba(197,139,217,0.22)]',
  },
  {
    id: '04',
    tag: 'Proactive Safety',
    title: 'Stay one step ahead with a proactive safety strategy.',
    description:
      'Traditional responses often begin after incidents have already occurred. Canary encourages organisations to move from reactive problem-solving to preventive risk management, helping safety teams identify patterns, prioritise locations and plan timely interventions.',
    emblemGold: '/images/empowerment/emblem-gold-4.png',
    emblemTheme: '/images/empowerment/emblem-theme-4.png',
    accentColor: '#EDCB63',
    glowColor: 'rgba(237, 203, 99, 0.45)',
    borderHover: 'hover:border-[#EDCB63]/60',
    shadowHover: 'hover:shadow-[0_24px_54px_-8px_rgba(237,203,99,0.22)]',
  },
  {
    id: '05',
    tag: 'Privacy by Design',
    title: 'Build trust through responsible, privacy-first monitoring.',
    description:
      'Workforce health should never come at the cost of employee privacy. Canary works with aggregated data rather than individual health records, allowing organisations to monitor broader health trends while respecting employee confidentiality.',
    emblemGold: '/images/empowerment/emblem-gold-5.png',
    emblemTheme: '/images/empowerment/emblem-theme-5.png',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    borderHover: 'hover:border-emerald-500/60',
    shadowHover: 'hover:shadow-[0_24px_54px_-8px_rgba(16,185,129,0.22)]',
  },
];

export const EmpowermentEmblems: React.FC = () => {
  const [colorMode, setColorMode] = useState<'gold' | 'themed'>('gold');

  return (
    <div className="relative mb-24">
      {/* Luminous ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[480px] bg-gradient-to-r from-[#F2A33A]/12 via-[#EDCB63]/10 to-[#6FA8C7]/12 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header: Cursive Stylish Heading with Canary Logo */}
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

        {/* Theme Palette Switcher Pill */}
        <div className="mt-6 inline-flex items-center gap-1.5 p-1 rounded-full bg-canvas-deep/80 border border-white/10 backdrop-blur-md shadow-lg">
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

      {/* 5 Glassmorphism Boxes */}
      <div className="relative z-10 space-y-6">
        {/* Row 1: 3 Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EMPOWERMENT_PILLARS.slice(0, 3).map((pillar) => (
            <div
              key={pillar.id}
              className={`relative rounded-3xl p-7 sm:p-8 overflow-hidden transition-all duration-500 group flex flex-col justify-between ${pillar.borderHover} ${pillar.shadowHover}`}
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(14, 18, 28, 0.28) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                boxShadow:
                  'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35), 0 20px 48px -10px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Card Header: 01 Pill + Custom Logo Shield Emblem */}
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex flex-col gap-1.5">
                    <span
                      className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 shadow-sm inline-block w-fit"
                      style={{ color: pillar.accentColor }}
                    >
                      {pillar.id}
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-canary-text-3 font-semibold">
                      {pillar.tag}
                    </span>
                  </div>

                  {/* Emblem Logo with Ambient Glow */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 -mt-2 -mr-1 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div
                      className="absolute inset-2 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ backgroundColor: pillar.glowColor }}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={colorMode === 'gold' ? pillar.emblemGold : pillar.emblemTheme}
                      alt={pillar.title}
                      className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] select-none transition-all duration-300"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-canary-text tracking-tight group-hover:text-canary-amber transition-colors leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-canary-text-2 leading-relaxed font-light mt-3">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: 2 Boxes (Centered & Balanced) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {EMPOWERMENT_PILLARS.slice(3, 5).map((pillar) => (
            <div
              key={pillar.id}
              className={`relative rounded-3xl p-7 sm:p-8 overflow-hidden transition-all duration-500 group flex flex-col justify-between ${pillar.borderHover} ${pillar.shadowHover}`}
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(14, 18, 28, 0.28) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                boxShadow:
                  'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35), 0 20px 48px -10px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex flex-col gap-1.5">
                    <span
                      className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 shadow-sm inline-block w-fit"
                      style={{ color: pillar.accentColor }}
                    >
                      {pillar.id}
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-canary-text-3 font-semibold">
                      {pillar.tag}
                    </span>
                  </div>

                  {/* Emblem Logo with Ambient Glow */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 -mt-2 -mr-1 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div
                      className="absolute inset-2 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ backgroundColor: pillar.glowColor }}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={colorMode === 'gold' ? pillar.emblemGold : pillar.emblemTheme}
                      alt={pillar.title}
                      className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] select-none transition-all duration-300"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-canary-text tracking-tight group-hover:text-canary-amber transition-colors leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-canary-text-2 leading-relaxed font-light mt-3">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
