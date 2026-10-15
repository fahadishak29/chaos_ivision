import React from 'react';
import { Check, AlertTriangle, X, HelpCircle } from 'lucide-react';
import { VerdictLevel } from '../../types/verdict';

export type DisplayVerdict = 'SUITABLE' | 'CAUTION' | 'AVOID' | 'INCOMPLETE' | VerdictLevel;

export interface NutriVerdictBadgeProps {
  verdict: DisplayVerdict | string;
  className?: string;
}

export const NutriVerdictBadge: React.FC<NutriVerdictBadgeProps> = ({ verdict, className = '' }) => {
  const norm = String(verdict).toUpperCase();

  let config = {
    icon: Check,
    className: 'bg-sage/15 text-sage-strong',
    label: 'Suitable',
  };

  if (norm === 'CAUTION' || norm === 'YELLOW') {
    config = {
      icon: AlertTriangle,
      className: 'bg-amber/15 text-amber-strong',
      label: 'Caution',
    };
  } else if (norm === 'AVOID' || norm === 'RED') {
    config = {
      icon: X,
      className: 'bg-danger/10 text-danger',
      label: 'Avoid',
    };
  } else if (norm === 'INSUFFICIENT_DATA' || norm === 'INSUFFICIENT' || norm === 'INCOMPLETE') {
    config = {
      icon: HelpCircle,
      className: 'bg-muted text-muted-foreground',
      label: 'Incomplete',
    };
  }

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${config.className} ${className}`}
    >
      <Icon className="size-3" />
      <span>{config.label}</span>
    </span>
  );
};

export default NutriVerdictBadge;
