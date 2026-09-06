import React from 'react';

interface MtccLogoProps {
  variant?: 'full' | 'compact' | 'icon-only' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  logoUrl?: string;
  siteName?: string;
  tagline?: string;
}

export const MtccLogo: React.FC<MtccLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  logoUrl,
  siteName,
  tagline,
}) => {
  const iconDimensions = {
    sm: { w: 32, h: 32 },
    md: { w: 42, h: 42 },
    lg: { w: 54, h: 54 },
    xl: { w: 68, h: 68 },
  }[size];

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }[size];

  const displayTitle = siteName || 'MTCC BillPro';
  const displayTagline = tagline || 'Smart • Simple • Professional Billing';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} id="mtcc-brand-logo">
      {/* Brand Icon or Custom Uploaded Logo */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0B1A30] to-[#040C1A] border border-amber-500/40 shadow-lg shadow-amber-500/10 p-1 overflow-hidden"
        style={{ width: iconDimensions.w, height: iconDimensions.h }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={displayTitle}
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_2px_4px_rgba(234,179,8,0.3)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            {/* Shield */}
            <path
              d="M 50 6 L 86 20 C 86 58, 74 82, 50 94 C 26 82, 14 58, 14 20 Z"
              fill="#0A182F"
              stroke="url(#crestGold)"
              strokeWidth="4"
            />
            {/* Monogram M */}
            <path
              d="M 32 64 L 32 36 L 43 52 L 50 42 L 57 52 L 68 36 L 68 64"
              stroke="url(#crestGold)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Checkmark Accent Dot */}
            <circle cx="50" cy="74" r="5" fill="#FDE047" />
          </svg>
        )}
      </div>

      {variant !== 'icon-only' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold tracking-tight text-white font-['Space_Grotesk'] ${titleSizes}`}>
              {displayTitle.split(' ')[0] || 'MTCC'}
            </span>
            <span className={`font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent ${titleSizes}`}>
              {displayTitle.split(' ').slice(1).join(' ') || 'BillPro'}
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
              NON-GST
            </span>
          </div>

          {variant === 'full' && (
            <span className="text-[11px] font-medium tracking-wide text-slate-400 mt-1">
              {displayTagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
