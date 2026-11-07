'use client';

import React from 'react';

interface EmblemProps {
  className?: string;
  size?: number;
}

/**
 * Common linear gradient definitions for the luxury Canary gold/amber palette.
 */
const EmblemGradients: React.FC<{ idPrefix: string }> = ({ idPrefix }) => (
  <defs>
    {/* Primary Metallic Gold Gradient */}
    <linearGradient id={`${idPrefix}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFF0C2" />
      <stop offset="35%" stopColor="#EDCB63" />
      <stop offset="70%" stopColor="#F2A33A" />
      <stop offset="100%" stopColor="#C97A1E" />
    </linearGradient>

    {/* Secondary Soft Gold for fills & accents */}
    <linearGradient id={`${idPrefix}-soft`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#EDCB63" stopOpacity="0.28" />
      <stop offset="100%" stopColor="#F2A33A" stopOpacity="0.05" />
    </linearGradient>

    {/* Subtle Inner Glow Filter */}
    <filter id={`${idPrefix}-glow`} x1="-20%" y1="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F2A33A" floodOpacity="0.4" />
    </filter>
  </defs>
);

/**
 * 1. Protect your workforce before risks escalate
 * Motif: Heraldic shield + arching protective hand + 3 workforce silhouettes in hardhats + ascending breakout arrow
 */
export const WorkforceProtectionEmblem: React.FC<EmblemProps> = ({
  className = '',
  size = 72,
}) => {
  const id = 'emblem-workforce';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none filter drop-shadow-[0_4px_14px_rgba(242,163,58,0.25)] ${className}`}
    >
      <EmblemGradients idPrefix={id} />

      {/* Outer Shield Backplate */}
      <path
        d="M20 22 L50 11 L80 22 C80 48 66 74 50 88 C34 74 20 48 20 22 Z"
        fill={`url(#${id}-soft)`}
        stroke={`url(#${id}-gold)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Decorative Shield Contour */}
      <path
        d="M26 26 L50 17 L74 26 C74 46 62 67 50 79 C38 67 26 46 26 26 Z"
        stroke={`url(#${id}-gold)`}
        strokeWidth="1"
        strokeOpacity="0.35"
        strokeDasharray="2 3"
        fill="none"
      />

      {/* Sheltering Protective Hand Arch */}
      <path
        d="M30 46 C30 33 42 27 54 28 C62 29 69 33 73 37 C70 40 64 36 57 34 C46 32 37 36 36 46 C36 49 32 49 30 46 Z"
        fill={`url(#${id}-gold)`}
      />

      {/* Upward Growth / Breakout Arrow on the right */}
      <g filter={`url(#${id}-glow)`}>
        <path
          d="M68 62 L74 52 L80 57 L91 38"
          stroke={`url(#${id}-gold)`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points="91,38 82,38 88,48" fill={`url(#${id}-gold)`} />
      </g>

      {/* Workforce Figures Group */}
      {/* Center Primary Worker */}
      <g>
        {/* Helmet */}
        <path
          d="M44 48 C44 43 47 40 50 40 C53 40 56 43 56 48 Z"
          fill={`url(#${id}-gold)`}
        />
        <path d="M42 48 H58" stroke={`url(#${id}-gold)`} strokeWidth="2" strokeLinecap="round" />
        {/* Face */}
        <circle cx="50" cy="53" r="3.5" fill={`url(#${id}-gold)`} />
        {/* Shoulders / Torso */}
        <path
          d="M41 71 C41 62 44 60 50 60 C56 60 59 62 59 71 Z"
          fill={`url(#${id}-gold)`}
          fillOpacity="0.9"
        />
      </g>

      {/* Left Worker (Flanking) */}
      <g opacity="0.8">
        <path
          d="M34 52 C34 48 36.5 45 39 45 C41.5 45 44 48 44 52 Z"
          fill={`url(#${id}-gold)`}
        />
        <path d="M32 52 H46" stroke={`url(#${id}-gold)`} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="39" cy="56" r="3" fill={`url(#${id}-gold)`} />
        <path
          d="M32 70 C32 64 35 62 39 62 C41 62 42.5 63 43 64"
          stroke={`url(#${id}-gold)`}
          strokeWidth="2"
          fill="none"
        />
      </g>

      {/* Right Worker (Flanking) */}
      <g opacity="0.8">
        <path
          d="M56 52 C56 48 58.5 45 61 45 C63.5 45 66 48 66 52 Z"
          fill={`url(#${id}-gold)`}
        />
        <path d="M54 52 H68" stroke={`url(#${id}-gold)`} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="61" cy="56" r="3" fill={`url(#${id}-gold)`} />
        <path
          d="M57 64 C57.5 63 59 62 61 62 C65 62 68 64 68 70"
          stroke={`url(#${id}-gold)`}
          strokeWidth="2"
          fill="none"
        />
      </g>
    </svg>
  );
};

/**
 * 2. Reduce operational disruptions and unexpected costs
 * Motif: Heraldic shield + sheltering hand + mechanical gears + currency ($) + downward disruption reduction arrow
 */
export const OperationalDisruptionEmblem: React.FC<EmblemProps> = ({
  className = '',
  size = 72,
}) => {
  const id = 'emblem-disruption';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none filter drop-shadow-[0_4px_14px_rgba(242,163,58,0.25)] ${className}`}
    >
      <EmblemGradients idPrefix={id} />

      {/* Outer Shield Backplate */}
      <path
        d="M20 22 L50 11 L80 22 C80 48 66 74 50 88 C34 74 20 48 20 22 Z"
        fill={`url(#${id}-soft)`}
        stroke={`url(#${id}-gold)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Decorative Shield Contour */}
      <path
        d="M26 26 L50 17 L74 26 C74 46 62 67 50 79 C38 67 26 46 26 26 Z"
        stroke={`url(#${id}-gold)`}
        strokeWidth="1"
        strokeOpacity="0.35"
        strokeDasharray="2 3"
        fill="none"
      />

      {/* Sheltering Protective Hand Arch */}
      <path
        d="M30 44 C30 31 42 25 54 26 C62 27 69 31 73 35 C70 38 64 34 57 32 C46 30 37 34 36 44 C36 47 32 47 30 44 Z"
        fill={`url(#${id}-gold)`}
      />

      {/* Downward Disruption / Cost Arrow on the right */}
      <g filter={`url(#${id}-glow)`}>
        <path
          d="M68 42 L74 52 L80 46 L91 66"
          stroke={`url(#${id}-gold)`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points="91,66 82,65 91,55" fill={`url(#${id}-gold)`} />
      </g>

      {/* Primary Mechanical Gear */}
      <g transform="translate(42, 60)">
        <circle cx="0" cy="0" r="9" stroke={`url(#${id}-gold)`} strokeWidth="2.5" fill="none" />
        <circle cx="0" cy="0" r="3.5" fill={`url(#${id}-gold)`} />
        {/* Gear Teeth */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
          <rect
            key={idx}
            x="-2"
            y="-12"
            width="4"
            height="3.5"
            rx="1"
            fill={`url(#${id}-gold)`}
            transform={`rotate(${angle})`}
          />
        ))}
      </g>

      {/* Interlocking Secondary Cog (Upper Right) */}
      <g transform="translate(56, 47)">
        <circle cx="0" cy="0" r="6" stroke={`url(#${id}-gold)`} strokeWidth="2" fill="none" opacity="0.8" />
        <circle cx="0" cy="0" r="2" fill={`url(#${id}-gold)`} opacity="0.8" />
        {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
          <rect
            key={idx}
            x="-1.5"
            y="-8.5"
            width="3"
            height="2.5"
            rx="0.8"
            fill={`url(#${id}-gold)`}
            transform={`rotate(${angle})`}
            opacity="0.8"
          />
        ))}
      </g>

      {/* Prominent Dollar Symbol ($) Representing Cost Savings */}
      <g transform="translate(58, 64)">
        {/* Vertical Stroke */}
        <line x1="0" y1="-10" x2="0" y2="10" stroke={`url(#${id}-gold)`} strokeWidth="2" strokeLinecap="round" />
        {/* S-curves */}
        <path
          d="M4 -5 C4 -8 -4 -8 -4 -3 C-4 2 4 1 4 6 C4 10 -4 10 -4 7"
          stroke={`url(#${id}-gold)`}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
};

/**
 * 3. Make decisions backed by evidence, not guesswork
 * Motif: Heraldic shield + analytical thinker profile with brain cogs + evidence document & checklist + magnifying glass + upward trend
 */
export const EvidenceDecisionEmblem: React.FC<EmblemProps> = ({
  className = '',
  size = 72,
}) => {
  const id = 'emblem-evidence';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none filter drop-shadow-[0_4px_14px_rgba(242,163,58,0.25)] ${className}`}
    >
      <EmblemGradients idPrefix={id} />

      {/* Outer Shield Backplate */}
      <path
        d="M20 22 L50 11 L80 22 C80 48 66 74 50 88 C34 74 20 48 20 22 Z"
        fill={`url(#${id}-soft)`}
        stroke={`url(#${id}-gold)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Decorative Shield Contour */}
      <path
        d="M26 26 L50 17 L74 26 C74 46 62 67 50 79 C38 67 26 46 26 26 Z"
        stroke={`url(#${id}-gold)`}
        strokeWidth="1"
        strokeOpacity="0.35"
        strokeDasharray="2 3"
        fill="none"
      />

      {/* Upward Evidence Breakout Arrow on the right */}
      <g filter={`url(#${id}-glow)`}>
        <path
          d="M68 62 L74 52 L80 57 L91 38"
          stroke={`url(#${id}-gold)`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points="91,38 82,38 88,48" fill={`url(#${id}-gold)`} />
      </g>

      {/* Supporting Hand Underneath */}
      <path
        d="M32 74 C38 72 45 74 52 72 C58 70 64 64 66 61 C63 60 58 63 52 64 C44 65 37 68 32 74 Z"
        fill={`url(#${id}-gold)`}
        opacity="0.9"
      />

      {/* Analytical Mind Silhouette (Profile facing right) */}
      <g>
        <path
          d="M30 64 C30 54 32 46 36 41 C40 36 45 36 48 39 C49 41 49 44 48 45 C49 46 48 48 46 49 C47 50 46 52 44 53 C43 54 44 56 42 58 C41 61 36 63 30 64 Z"
          fill={`url(#${id}-gold)`}
          opacity="0.85"
        />
        {/* Neural Gears inside the head */}
        <circle cx="41" cy="42" r="3" stroke="#1B1B1C" strokeWidth="1" fill={`url(#${id}-gold)`} />
        <circle cx="37" cy="46" r="2" stroke="#1B1B1C" strokeWidth="1" fill={`url(#${id}-gold)`} />
      </g>

      {/* Verified Evidence Document */}
      <g transform="translate(50, 36)">
        {/* Document sheet */}
        <rect
          x="0"
          y="0"
          width="18"
          height="24"
          rx="2"
          fill="#161617"
          stroke={`url(#${id}-gold)`}
          strokeWidth="1.8"
        />
        {/* Checklist lines with checkmarks */}
        <path d="M4 6 L6 8 L9 4" stroke={`url(#${id}-gold)`} strokeWidth="1.2" fill="none" />
        <line x1="11" y1="6" x2="15" y2="6" stroke={`url(#${id}-gold)`} strokeWidth="1.2" strokeLinecap="round" />

        <path d="M4 11 L6 13 L9 9" stroke={`url(#${id}-gold)`} strokeWidth="1.2" fill="none" />
        <line x1="11" y1="11" x2="15" y2="11" stroke={`url(#${id}-gold)`} strokeWidth="1.2" strokeLinecap="round" />

        {/* Mini Evidence Bar Chart */}
        <rect x="4" y="19" width="2" height="3" fill={`url(#${id}-gold)`} rx="0.5" />
        <rect x="7.5" y="17" width="2" height="5" fill={`url(#${id}-gold)`} rx="0.5" />
        <rect x="11" y="15" width="2" height="7" fill={`url(#${id}-gold)`} rx="0.5" />
        <rect x="14.5" y="18" width="2" height="4" fill={`url(#${id}-gold)`} rx="0.5" />
      </g>

      {/* Magnifying Glass Inspecting Document */}
      <g transform="translate(62, 45)">
        <circle cx="0" cy="0" r="5" stroke={`url(#${id}-gold)`} strokeWidth="2" fill="#1B1B1C" fillOpacity="0.6" />
        <line x1="3.5" y1="3.5" x2="8" y2="8" stroke={`url(#${id}-gold)`} strokeWidth="2.5" strokeLinecap="round" />
        {/* Lens reflection glint */}
        <path d="M-2 -2 C-1 -3 1 -3 2 -2" stroke="#FFF0C2" strokeWidth="1" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};

/**
 * 4. Stay one step ahead with a proactive safety strategy
 * Motif: Heraldic shield + ascending staircase + figure climbing stairs holding safety check shield + supporting hand + upward growth arrow
 */
export const ProactiveSafetyEmblem: React.FC<EmblemProps> = ({
  className = '',
  size = 72,
}) => {
  const id = 'emblem-proactive';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none filter drop-shadow-[0_4px_14px_rgba(242,163,58,0.25)] ${className}`}
    >
      <EmblemGradients idPrefix={id} />

      {/* Outer Shield Backplate */}
      <path
        d="M20 22 L50 11 L80 22 C80 48 66 74 50 88 C34 74 20 48 20 22 Z"
        fill={`url(#${id}-soft)`}
        stroke={`url(#${id}-gold)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Decorative Shield Contour */}
      <path
        d="M26 26 L50 17 L74 26 C74 46 62 67 50 79 C38 67 26 46 26 26 Z"
        stroke={`url(#${id}-gold)`}
        strokeWidth="1"
        strokeOpacity="0.35"
        strokeDasharray="2 3"
        fill="none"
      />

      {/* Upward Proactive Arrow on the right */}
      <g filter={`url(#${id}-glow)`}>
        <path
          d="M68 62 L74 52 L80 57 L91 38"
          stroke={`url(#${id}-gold)`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points="91,38 82,38 88,48" fill={`url(#${id}-gold)`} />
      </g>

      {/* Supporting Hand Underneath Steps */}
      <path
        d="M32 74 C38 72 45 74 52 72 C58 70 64 64 66 61 C63 60 58 63 52 64 C44 65 37 68 32 74 Z"
        fill={`url(#${id}-gold)`}
        opacity="0.9"
      />

      {/* Ascending Steps / Stairs */}
      <path
        d="M34 68 H44 V60 H54 V52 H64 V44"
        stroke={`url(#${id}-gold)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Stepping Figure (Walking upwards) */}
      <g>
        {/* Head */}
        <circle cx="48" cy="34" r="3.5" fill={`url(#${id}-gold)`} />
        {/* Torso */}
        <line x1="48" y1="38" x2="47" y2="48" stroke={`url(#${id}-gold)`} strokeWidth="2.5" strokeLinecap="round" />
        {/* Forward stride legs */}
        <path
          d="M47 48 L52 54 L56 52"
          stroke={`url(#${id}-gold)`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M47 48 L44 56 L39 60"
          stroke={`url(#${id}-gold)`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Arms */}
        <line x1="48" y1="41" x2="43" y2="45" stroke={`url(#${id}-gold)`} strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Mini Proactive Safety Shield with Checkmark */}
      <g transform="translate(56, 50)">
        <path
          d="M0 0 L6 2 L12 0 C12 6 10 10 6 13 C2 10 0 6 0 0 Z"
          fill="#1B1B1C"
          stroke={`url(#${id}-gold)`}
          strokeWidth="1.8"
        />
        {/* Checkmark */}
        <path
          d="M3 6 L5.5 8.5 L9 4"
          stroke={`url(#${id}-gold)`}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
};

/**
 * 5. Build trust through responsible, privacy-first monitoring
 * Motif: Double-layered heraldic shield + security padlock with health vital-pulse wave + mutual trusting handshake
 */
export const PrivacyTrustEmblem: React.FC<EmblemProps> = ({
  className = '',
  size = 72,
}) => {
  const id = 'emblem-privacy';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none filter drop-shadow-[0_4px_14px_rgba(242,163,58,0.25)] ${className}`}
    >
      <EmblemGradients idPrefix={id} />

      {/* Outer Double-Layered Shield Backplate */}
      <path
        d="M20 22 L50 11 L80 22 C80 48 66 74 50 88 C34 74 20 48 20 22 Z"
        fill={`url(#${id}-soft)`}
        stroke={`url(#${id}-gold)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Concentric Shield Rim */}
      <path
        d="M26 26 L50 17 L74 26 C74 46 62 67 50 79 C38 67 26 46 26 26 Z"
        stroke={`url(#${id}-gold)`}
        strokeWidth="1.5"
        strokeDasharray="3 3"
        fill="none"
      />

      {/* Privacy Padlock Body */}
      <g transform="translate(38, 30)">
        {/* Shackle */}
        <path
          d="M4 11 V6 C4 1.5 8 -1 12 -1 C16 -1 20 1.5 20 6 V11"
          stroke={`url(#${id}-gold)`}
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Sturdy Lock Plate */}
        <rect
          x="0"
          y="10"
          width="24"
          height="18"
          rx="3"
          fill="#1B1B1C"
          stroke={`url(#${id}-gold)`}
          strokeWidth="2.2"
        />
        {/* Health Vital Pulse Wave across the padlock face */}
        <path
          d="M3 19 H7 L9 15 L12 23 L15 17 L17 19 H21"
          stroke={`url(#${id}-gold)`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Trust Handshake Group (Beneath Padlock) */}
      <g transform="translate(50, 64)">
        {/* Left Hand / Cuff */}
        <path
          d="M-22 3 L-13 8 L-15 13 L-24 8 Z"
          fill={`url(#${id}-gold)`}
          opacity="0.8"
        />
        {/* Right Hand / Cuff */}
        <path
          d="M22 3 L13 8 L15 13 L24 8 Z"
          fill={`url(#${id}-gold)`}
          opacity="0.8"
        />

        {/* Clasped Interlocking Fingers / Handshake */}
        <path
          d="M-13 8 L-4 3 C-1 1 3 1 7 4 L13 8 C14 9 13 11 11 12 L7 10 L5 13 L0 10 L-2 13 L-7 10 L-9 12 C-11 11 -13 10 -13 8 Z"
          fill={`url(#${id}-gold)`}
          stroke="#1B1B1C"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
};
