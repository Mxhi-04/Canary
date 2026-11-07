import React from 'react';
import { ProvenanceKind } from '@/lib/types/domain';

interface ProvenanceBadgeProps {
  kind: ProvenanceKind;
  sourceName?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  kind,
  sourceName,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  if (kind === 'real') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded bg-[#6FA8C7]/15 border border-[#6FA8C7]/30 text-[#6FA8C7] font-medium ${sizeClasses} ${className}`}
        title="Real environmental observation feed"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#6FA8C7]" />
        <span>Real{sourceName ? ` · ${sourceName}` : ''}</span>
      </span>
    );
  }

  if (kind === 'simulated') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded bg-[#C58BD9]/15 border border-[#C58BD9]/30 text-[#C58BD9] font-medium hatched-simulated ${sizeClasses} ${className}`}
        title="Simulated health or workplace outcome data"
      >
        <span className="w-1.5 h-1.5 rounded-sm bg-[#C58BD9]" />
        <span>Simulated{sourceName ? ` · ${sourceName}` : ''}</span>
      </span>
    );
  }

  if (kind === 'illustrative') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded bg-[#D9B26F]/10 border border-dashed border-[#D9B26F]/50 text-[#D9B26F] font-medium ${sizeClasses} ${className}`}
        title="Illustrative scenario-based estimate"
      >
        <span className="text-[10px]">◇</span>
        <span>Illustrative</span>
      </span>
    );
  }

  // Approximation (e.g. WBGT)
  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-[#B89A5B]/15 border border-[#B89A5B]/30 text-[#E8C14A] font-medium ${sizeClasses} ${className}`}
      title="Approximation derived from ambient parameters"
    >
      <span>≈ Approximation</span>
    </span>
  );
};
