import React from 'react';
import { Lock } from 'lucide-react';

interface SuppressedCellProps {
  threshold?: number;
  isSecondary?: boolean;
  className?: string;
}

export const SuppressedCell: React.FC<SuppressedCellProps> = ({
  threshold = 5,
  isSecondary = false,
  className = '',
}) => {
  const tooltip = isSecondary
    ? 'Hidden under secondary suppression to prevent calculation from row or column totals.'
    : `Counts below k=${threshold} are hidden under aggregate privacy rules to prevent re-identification.`;

  return (
    <div
      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono hatched-suppressed border border-border text-canary-text-3 select-none cursor-help ${className}`}
      title={tooltip}
    >
      <Lock className="w-3 h-3 text-[#E8C14A]/70" />
      <span>&lt; {threshold}</span>
      {isSecondary && <span className="text-[10px] text-[#B89A5B] font-sans">secondary</span>}
    </div>
  );
};

