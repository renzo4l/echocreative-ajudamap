import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const dimensions = {
    sm: { width: 36, height: 36, textSize: 'text-sm' },
    md: { width: 48, height: 48, textSize: 'text-base' },
    lg: { width: 80, height: 80, textSize: 'text-xl' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Emblem SVG reproducing the exact uploaded user logo */}
      <div 
        className="relative shrink-0 rounded-xl overflow-hidden bg-[#0d120f] border border-emerald-500/30 flex items-center justify-center shadow-lg"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <svg 
          viewBox="0 0 160 160" 
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dark Background */}
          <rect width="160" height="160" fill="#0d120f" />

          {/* Green Continents Map Contours (South America, North America, Africa, Europe, Asia) */}
          <g fill="none" stroke="#059669" strokeWidth="1.2" opacity="0.65">
            {/* North America */}
            <path d="M 20 25 Q 35 20, 50 30 Q 40 45, 30 55 Q 22 45, 20 25 Z" />
            <path d="M 38 18 Q 45 15, 52 20 Q 48 24, 40 22 Z" />
            {/* South America */}
            <path d="M 28 65 Q 42 62, 45 75 Q 40 100, 32 115 Q 26 100, 26 80 Z" />
            {/* Europe */}
            <path d="M 70 28 Q 85 24, 92 35 Q 85 45, 72 42 Z" />
            <path d="M 68 32 Q 72 26, 76 30 Q 74 36, 68 35 Z" />
            {/* Africa */}
            <path d="M 66 52 Q 88 50, 95 65 Q 92 90, 80 112 Q 70 105, 64 78 Z" />
            {/* Asia & Middle East */}
            <path d="M 95 30 Q 125 22, 142 38 Q 138 65, 120 70 Q 102 55, 95 38 Z" />
            <path d="M 88 52 Q 98 50, 104 58 Q 96 66, 88 60 Z" />
            <path d="M 125 68 Q 138 72, 144 85 Q 132 90, 122 82 Z" />
            {/* Australia */}
            <path d="M 130 98 Q 145 95, 148 108 Q 138 118, 128 112 Z" />
          </g>

          {/* Arched AJUDAMAP Typography */}
          <g>
            <path id="curve" d="M 16 88 Q 80 48, 144 88" fill="transparent" />
            <text fill="#ffffff" fontWeight="900" fontSize="21" fontFamily="system-ui, sans-serif" letterSpacing="1.5">
              <textPath href="#curve" startOffset="50%" textAnchor="middle">
                AJUDAMAP
              </textPath>
            </text>
          </g>

          {/* ECOCREATIVE Sub-label */}
          <text 
            x="80" 
            y="98" 
            fill="#a3e635" 
            fontSize="9" 
            fontWeight="800" 
            letterSpacing="2.5" 
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
          >
            ECOCREATIVE
          </text>

          {/* Accent dot under P */}
          <circle cx="123" cy="102" r="3" fill="#ffffff" />
        </svg>
      </div>

      {showSubtitle && (
        <div className="flex flex-col">
          <span className={`font-display font-black tracking-tight text-white leading-tight ${dimensions.textSize}`}>
            AJUDAMAP
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">
            Echocreative · São Luís
          </span>
        </div>
      )}
    </div>
  );
};
