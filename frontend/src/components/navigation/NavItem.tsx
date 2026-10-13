import React, { ElementType } from 'react';
import { NavLink } from 'react-router-dom';

export interface NavItemProps {
  to: string;
  icon: ElementType;
  label: string;
  badge?: string | number;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({
  to,
  icon: Icon,
  label,
  badge,
  onClick,
}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `
        group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors duration-150
        ${isActive
          ? 'bg-brand-50 text-brand-700 font-semibold'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }
      `}
    >
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4 shrink-0 transition-colors" />
        <span className="truncate">{label}</span>
      </div>
      {badge !== undefined && (
        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-slate-200 text-slate-700 group-hover:bg-slate-300">
          {badge}
        </span>
      )}
    </NavLink>
  );
};
