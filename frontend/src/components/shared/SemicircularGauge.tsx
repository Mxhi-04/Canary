import React from 'react';

interface SemicircularGaugeProps {
  value: number; // 0 to 100 or numeric
  maxValue?: number;
  label: string;
  variant?: 'neutral' | 'warning' | 'critical';
  unit?: string;
  deltaText?: string;
  deltaDirection?: 'up' | 'down' | 'neutral';
  deltaColor?: 'amber' | 'ok' | 'neutral';
  className?: string;
}

export const SemicircularGauge: React.FC<SemicircularGaugeProps> = ({
  value,
  maxValue = 100,
  label,
  variant = 'neutral',
  unit = '%',
  deltaText,
  deltaDirection = 'up',
  deltaColor = 'amber',
  className = '',
}) => {
  // 240 degree gauge arc
  // Angles in degrees: start at 150 deg, end at 390 deg (sweep = 240)
  const radius = 62;
  const strokeWidth = 10;
  const center = 80;
  const arcLength = 240;

  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const currentAngle = (percentage / 100) * arcLength;

  // SVG arc calculation helper
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const bgPath = describeArc(center, center, radius, 150, 390);
  const activePath = currentAngle > 0 ? describeArc(center, center, radius, 150, 150 + currentAngle) : '';

  // Gradients matching DESIGN.md Section 2.2
  const gradientId = `gauge-grad-${variant}-${label.replace(/\s+/g, '-').toLowerCase()}`;
  let startColor = '#7FB45A';
  let endColor = '#E8C14A';

  if (variant === 'warning') {
    startColor = '#E8C14A';
    endColor = '#F08A2E';
  } else if (variant === 'critical') {
    startColor = '#F08A2E';
    endColor = '#E5483D';
  }

  const deltaColorClass =
    deltaColor === 'ok'
      ? 'text-[#7FB45A]'
      : deltaColor === 'amber'
      ? 'text-[#F2A33A]'
      : 'text-canary-text-3';

  return (
    <div className={`flex flex-col items-center justify-center p-3 canary-panel-inset relative ${className}`}>
      <div className="relative w-40 h-28 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 160 120" className="w-full h-full">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={startColor} />
              <stop offset="100%" stopColor={endColor} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={bgPath}
            fill="none"
            stroke="#262628"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active arc */}
          {currentAngle > 0 && (
            <path
              d={activePath}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Center Display Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-5">
          <span className="text-3xl font-light text-canary-text tabular-nums tracking-tight">
            {value}
            <span className="text-sm font-normal text-canary-text-2 ml-0.5">{unit}</span>
          </span>
          <span className="text-[11px] font-medium text-canary-text-3 uppercase tracking-wider text-center px-2 truncate max-w-[140px]">
            {label}
          </span>
        </div>
      </div>

      {/* Delta Row */}
      {deltaText && (
        <div className={`text-xs flex items-center gap-1 font-medium mt-1 ${deltaColorClass}`}>
          <span>{deltaDirection === 'up' ? '▲' : deltaDirection === 'down' ? '▼' : '●'}</span>
          <span className="tabular-nums">{deltaText}</span>
        </div>
      )}
    </div>
  );
};

