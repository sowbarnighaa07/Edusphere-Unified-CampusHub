import { ReactNode } from 'react';

export type BadgeVariant = 'emerald' | 'amber' | 'rose' | 'blue' | 'slate' | 'indigo';

export interface BadgeProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  status?: string; // Optional auto-mapper from status strings
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  className = '',
  status,
}) => {
  let resolvedVariant: BadgeVariant = variant || 'slate';

  if (status) {
    const s = status.toUpperCase();
    if (['ACTIVE', 'APPROVED', 'EVALUATED', 'SUCCESS', 'VERIFIED'].includes(s)) {
      resolvedVariant = 'emerald';
    } else if (['PENDING', 'PENDING_STAFF', 'PENDING_HOD', 'LATE', 'WARNING'].includes(s)) {
      resolvedVariant = 'amber';
    } else if (['REJECTED', 'INACTIVE', 'DANGER', 'ERROR'].includes(s)) {
      resolvedVariant = 'rose';
    } else if (['SUBMITTED', 'INFO'].includes(s)) {
      resolvedVariant = 'blue';
    } else {
      resolvedVariant = 'slate';
    }
  }

  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variantStyles[resolvedVariant]} ${className}`}>
      {children || status}
    </span>
  );
};
