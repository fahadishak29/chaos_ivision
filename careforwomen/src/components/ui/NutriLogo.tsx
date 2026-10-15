import React from 'react';

export interface NutriLogoProps {
  compact?: boolean;
  className?: string;
}

export const NutriLogo: React.FC<NutriLogoProps> = ({ compact = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="logo-mark">
        <span />
      </div>
      {!compact && (
        <div>
          <div className="font-serif text-[19px] font-semibold leading-none tracking-[-0.03em] text-plum">
            NutriLens
          </div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-plum/45">
            See beyond the label
          </div>
        </div>
      )}
    </div>
  );
};

export default NutriLogo;
