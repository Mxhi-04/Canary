'use client';

import React, { useState } from 'react';
import { useDemoRole } from '@/context/RoleContext';
import { DEMO_ROLES } from '@/lib/data/seededData';
import { ProvenanceBadge } from '../shared/ProvenanceBadge';
import { Info, Shield, RefreshCw } from 'lucide-react';

interface TopBarProps {
  title: string;
  description: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, description }) => {
  const { activeRole, setRole, roleInfo } = useDemoRole();
  const [showLegend, setShowLegend] = useState(false);

  return (
    <header className="relative w-full bg-canvas-deep border-b border-border z-20 flex flex-col">
      {/* Topographic Background Header Band */}
      <div className="relative px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 topo-pattern overflow-hidden">
        {/* Subtle decorative contour SVG line overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none overflow-hidden select-none">
          <svg viewBox="0 0 400 120" className="w-full h-full stroke-[#F2A33A]" fill="none">
            <path d="M0,60 Q100,20 200,80 T400,30" strokeWidth="1.5" />
            <path d="M0,80 Q120,40 220,100 T400,50" strokeWidth="1" />
            <path d="M0,100 Q140,60 240,110 T400,70" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Title and one-sentence description */}
        <div className="relative z-10 flex flex-col">
          <h1 className="text-xl md:text-2xl font-semibold tracking-wide uppercase text-canary-text">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-canary-text-2 mt-0.5 line-clamp-1">
            {description}
          </p>
        </div>

        {/* Right side controls: Role Switcher, Legend, Freshness */}
        <div className="relative z-10 flex items-center flex-wrap gap-3">
          {/* Provenance Legend Trigger */}
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-control text-xs font-medium text-canary-text-2 bg-panel hover:bg-panel-raised border border-border transition-colors"
            title="Open Data Provenance Legend"
          >
            <Info className="w-3.5 h-3.5 text-canary-amber" />
            <span className="hidden sm:inline">Provenance Legend</span>
          </button>

          {/* Data Freshness Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-control text-xs font-medium bg-panel-inset border border-border text-canary-text-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7FB45A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7FB45A]"></span>
            </span>
            <span className="tabular-nums">Fresh · 12m ago</span>
            <RefreshCw className="w-3 h-3 text-canary-text-3 hover:text-canary-amber cursor-pointer transition-colors" />
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-2 bg-panel border border-border-strong rounded-control px-3 py-1.5 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-canary-amber flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-canary-text-3 tracking-wider leading-none">
                Demo Role
              </span>
              <select
                value={activeRole}
                onChange={(e) => setRole(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-canary-text focus:outline-none cursor-pointer pr-1"
                title="Demonstration control only. Production uses real identity and access management."
              >
                {DEMO_ROLES.map((r) => (
                  <option key={r.id} value={r.id} className="bg-panel text-canary-text">
                    {r.shortName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Provenance Legend Popover */}
      {showLegend && (
        <div className="px-6 py-3 bg-panel-inset border-t border-border flex items-center flex-wrap gap-4 text-xs text-canary-text-2 animate-in fade-in duration-200">
          <span className="font-semibold text-canary-text text-[11px] uppercase tracking-wider">
            Honest Data Markers:
          </span>
          <div className="flex items-center gap-2">
            <ProvenanceBadge kind="real" sourceName="Open-Meteo" size="sm" />
            <span className="text-canary-text-3">European CAMS / ECMWF feeds</span>
          </div>
          <div className="flex items-center gap-2">
            <ProvenanceBadge kind="simulated" sourceName="Clinical / Absence" size="sm" />
            <span className="text-canary-text-3">Synthetic scenario outcome data</span>
          </div>
          <div className="flex items-center gap-2">
            <ProvenanceBadge kind="approximation" size="sm" />
            <span className="text-canary-text-3">Derived WBGT heat stress proxy</span>
          </div>
          <div className="flex items-center gap-2">
            <ProvenanceBadge kind="illustrative" size="sm" />
            <span className="text-canary-text-3">Scenario model projection</span>
          </div>
          <button
            onClick={() => setShowLegend(false)}
            className="ml-auto text-xs text-canary-text-3 hover:text-canary-text underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Persistent Demo Strip (24px) from DESIGN.md Section 3.1 */}
      <div className="w-full bg-[#1A1608] border-t border-b border-[#F2A33A]/25 px-6 py-1 flex items-center justify-between text-[11px] text-[#EDCB63]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-canary-amber" />
          <span className="font-medium">
            Demo mode · Outcome data is simulated · Decision support only.
          </span>
          <span className="hidden md:inline text-canary-text-3">
            Active view: <strong className="text-canary-text font-medium">{roleInfo.title}</strong> ({roleInfo.scope})
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-canary-text-3 text-[10px]">
          <span>PRD v1.0 Prototype</span>
          <span>•</span>
          <span>Challenge 06 Future Health</span>
        </div>
      </div>
    </header>
  );
};
