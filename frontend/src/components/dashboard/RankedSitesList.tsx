'use client';

import React from 'react';
import { MonitoringUnit } from '@/lib/types/domain';
import { RiskTierBadge } from '../shared/RiskTierBadge';

interface RankedSitesListProps {
  units: MonitoringUnit[];
  onSelectUnit?: (unit: MonitoringUnit) => void;
}

export const RankedSitesList: React.FC<RankedSitesListProps> = ({ units, onSelectUnit }) => {
  // Sort by severity (Action first, then Alert, then Watch, then nominal)
  const tierWeight = { ACTION: 4, ALERT: 3, WATCH: 2 };
  const sorted = [...units]
    .filter((u) => u.currentTier !== null)
    .sort((a, b) => {
      const wA = a.currentTier ? tierWeight[a.currentTier] || 1 : 0;
      const wB = b.currentTier ? tierWeight[b.currentTier] || 1 : 0;
      if (wA !== wB) return wB - wA;
      return (b.observedTrendPercent || 0) - (a.observedTrendPercent || 0);
    });

  return (
    <div className="flex flex-col gap-2.5">
      {sorted.map((unit) => {
        const trend = unit.observedTrendPercent || 0;
        const tier = unit.currentTier;

        let barColor = 'bg-[#7FB45A]';
        if (tier === 'ACTION') barColor = 'bg-[#E5483D]';
        else if (tier === 'ALERT') barColor = 'bg-[#F08A2E]';
        else if (tier === 'WATCH') barColor = 'bg-[#E8C14A]';

        return (
          <div
            key={unit.id}
            onClick={() => onSelectUnit && onSelectUnit(unit)}
            className="flex items-center gap-3 p-2.5 rounded-control canary-panel-inset hover:bg-panel-raised transition-colors cursor-pointer"
          >
            {/* Tier Shape */}
            <div className="flex-shrink-0">
              <RiskTierBadge tier={unit.currentTier} size="sm" showLabel={false} />
            </div>

            {/* Site Name and District */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-canary-text truncate max-w-[180px]">
                  {unit.name}
                </span>
                <span className="font-light text-xs tabular-nums text-canary-text-2">
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
              </div>

              {/* Ranked bar with 2px brighter leading cap (DESIGN.md Section 2.2) */}
              <div className="w-full bg-panel rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(15, trend * 1.4))}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {sorted.length === 0 && (
        <div className="py-6 text-center text-xs text-canary-text-3">
          No monitoring units currently elevated to Watch, Alert, or Action tiers.
        </div>
      )}
    </div>
  );
};

