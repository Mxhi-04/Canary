'use client';

import React from 'react';
import { MonitoringUnit } from '@/lib/types/domain';
import { RiskTierBadge } from '../shared/RiskTierBadge';
import { CompletenessMeter } from '../shared/CompletenessMeter';
import { ProvenanceBadge } from '../shared/ProvenanceBadge';
import { X, Building2, MapPin, Users, Activity, ExternalLink, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useDemoRole } from '@/context/RoleContext';

interface SiteDrawerProps {
  unit: MonitoringUnit | null;
  onClose: () => void;
}

export const SiteDrawer: React.FC<SiteDrawerProps> = ({ unit, onClose }) => {
  const { roleInfo, isRegulator } = useDemoRole();

  if (!unit) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-panel border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-5 border-b border-border flex items-center justify-between bg-panel-raised">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-canary-amber" />
          <div>
            <h3 className="text-base font-semibold text-canary-text tracking-tight truncate max-w-[280px]">
              {unit.name}
            </h3>
            <span className="text-xs text-canary-text-3 font-mono">{unit.id}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-control text-canary-text-3 hover:text-canary-text hover:bg-panel transition-colors"
          title="Close Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Risk Status Card */}
        <div className="canary-panel-inset p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-canary-text-3 block mb-1">
              Current Risk Tier
            </span>
            <RiskTierBadge tier={unit.currentTier} size="lg" />
          </div>

          {unit.observedTrendPercent !== undefined && (
            <div className="text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-canary-text-3 block mb-1">
                Trend vs Expected
              </span>
              <span
                className={`text-lg font-light tabular-nums ${
                  unit.observedTrendPercent > 10 ? 'text-[#F08A2E]' : 'text-canary-text-2'
                }`}
              >
                {unit.observedTrendPercent > 0 ? `+${unit.observedTrendPercent}%` : `${unit.observedTrendPercent}%`}
              </span>
            </div>
          )}
        </div>

        {/* Primary Observation / Reason */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-canary-text-3">
            Primary Risk Indicator
          </h4>
          <p className="text-sm text-canary-text-2 bg-panel-inset p-3 rounded-control border border-border">
            {unit.primaryRiskReason || 'Operating within normal expected baseline.'}
          </p>
        </div>

        {/* Site Profile Metadata */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-canary-text-3">
            Unit Metadata
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="canary-panel-inset p-3 flex flex-col gap-1">
              <span className="text-canary-text-3 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-canary-amber" /> District
              </span>
              <span className="font-medium text-canary-text">{unit.districtName}</span>
            </div>
            <div className="canary-panel-inset p-3 flex flex-col gap-1">
              <span className="text-canary-text-3 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-canary-amber" /> Headcount Band
              </span>
              <span className="font-medium text-canary-text">{unit.headcountBand} workers</span>
            </div>
          </div>
        </div>

        {/* Feed Health & Data Completeness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-canary-text-3">
              Data Completeness
            </span>
            <span className="text-canary-text font-medium">{unit.completeness}%</span>
          </div>
          <CompletenessMeter percentage={unit.completeness} showText={false} />
          {unit.completeness < 80 && (
            <p className="text-xs text-[#B89A5B] bg-[#B89A5B]/10 p-2.5 rounded border border-[#B89A5B]/30 flex items-start gap-1.5 mt-2">
              <span>⚠</span>
              <span>
                Delayed feed detected. Omitted from fused evidence calculations to prevent artificial confidence.
              </span>
            </p>
          )}
        </div>

        {/* Role Scoping Note */}
        <div className="p-3 rounded bg-panel-inset border border-border text-[11px] text-canary-text-3">
          <div className="flex items-center gap-1 text-canary-text font-medium mb-1">
            <Activity className="w-3.5 h-3.5 text-canary-amber" />
            <span>Role Scope Context:</span>
          </div>
          <span>
            Viewing as <strong className="text-canary-text-2">{roleInfo.title}</strong>.
            {isRegulator
              ? ' Granular syndromic clinical counts are masked under compliance view.'
              : ' Full multi-signal anomaly evidence is accessible.'}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-5 border-t border-border bg-panel-raised flex items-center gap-3">
        {unit.openAlertCount > 0 ? (
          <Link
            href={`/alerts`}
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-control bg-canary-amber hover:bg-canary-amber/90 text-canvas-deep font-semibold text-xs transition-colors shadow-amber-glow"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Open Alerts for Site ({unit.openAlertCount})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <div className="flex-1 text-center py-2 text-xs text-canary-text-3 font-medium bg-panel-inset rounded-control border border-border">
            No active alerts for this monitoring unit
          </div>
        )}
      </div>
    </div>
  );
};
