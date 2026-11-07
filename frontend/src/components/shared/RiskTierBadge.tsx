import React from 'react';
import { RiskTier } from '@/lib/types/domain';

interface RiskTierBadgeProps {
  tier: RiskTier | null | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const RiskTierBadge: React.FC<RiskTierBadgeProps> = ({
  tier,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  if (!tier) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs text-canary-text-3 bg-panel-inset border border-border ${className}`}>
        <span className="w-2 h-2 rounded-full bg-border-strong inline-block" />
        {showLabel && <span>Nominal</span>}
      </span>
    );
  }

  const normalized = tier.toUpperCase();

  let shape = '●';
  let label = 'Watch';
  let badgeClasses = 'bg-[#E8C14A]/15 border-[#E8C14A]/30 text-[#EDCB63]';
  let dotColor = '#E8C14A';

  if (normalized === 'ALERT') {
    shape = '▲';
    label = 'Alert';
    badgeClasses = 'bg-[#F08A2E]/15 border-[#F08A2E]/30 text-[#F59A4A]';
    dotColor = '#F08A2E';
  } else if (normalized === 'ACTION') {
    shape = '◆';
    label = 'Action';
    badgeClasses = 'bg-[#E5483D]/15 border-[#E5483D]/40 text-[#F06B5E] shadow-action-glow';
    dotColor = '#E5483D';
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-badge border font-medium ${badgeClasses} ${sizeClasses} ${className}`}
      title={`Risk Tier: ${label}`}
    >
      <span style={{ color: dotColor }} className="text-[10px] leading-none select-none">
        {shape}
      </span>
      {showLabel && <span className="tracking-wide uppercase font-semibold text-[11px]">{label}</span>}
    </span>
  );
};
