'use client';

import React from 'react';
import { useDemoRole } from '@/context/RoleContext';
import { DEMO_ROLES } from '@/lib/data/seededData';
import { ShieldCheck, Activity, Users, ShieldAlert } from 'lucide-react';

export const SurveillanceHeader: React.FC = () => {
  const { activeRole, setRole, roleInfo } = useDemoRole();

  return (
    <div className="relative mb-6 rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#1A1A1C] via-[#141416] to-[#0D0D0E] border border-white/10 shadow-2xl">
      {/* Topographic Background Art (SVGs with gentle contour curves) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 1200 240"
          className="w-full h-full object-cover"
          fill="none"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.2"
        >
          <path d="M0,80 C200,140 400,20 600,90 C800,160 1000,40 1200,100" />
          <path d="M0,120 C250,50 450,170 700,80 C950,-10 1100,130 1200,140" />
          <path d="M0,160 C300,190 500,90 750,160 C1000,230 1150,100 1200,180" />
          <path d="M0,60 C150,20 350,110 550,50 C750,-10 950,90 1200,40" strokeOpacity="0.4" />
        </svg>
      </div>

      {/* Luminous Warm Backlight Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[200px] bg-gradient-to-r from-[#F2A33A]/10 via-[#EDCB63]/8 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-3xl space-y-2.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-canary-text tracking-wider uppercase">
              Disease Surveillance
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM ACTIVE
            </span>
          </div>

          <p className="text-xs sm:text-sm text-canary-text-2 leading-relaxed font-light">
            Epidemiologists, occupational health physicians, and health officers monitor and analyze disease surveillance data from healthcare facilities, laboratories, and environmental sensors to detect outbreaks, track disease trends over time, and identify emerging health threats.
          </p>
        </div>

        {/* Role Switcher Filter Pills */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2.5 self-start lg:self-center">
          <div className="text-[11px] font-mono uppercase tracking-wider text-canary-text-3 font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-canary-amber" />
            <span>Demonstration Profile</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-canvas-deep/80 border border-white/10 backdrop-blur-md">
            {DEMO_ROLES.map((r) => {
              const isActive = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F2A33A] to-[#EDCB63] text-canvas-deep shadow-md font-bold'
                      : 'text-canary-text-2 hover:text-canary-text hover:bg-white/5'
                  }`}
                  title={r.description}
                >
                  {r.shortName}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
