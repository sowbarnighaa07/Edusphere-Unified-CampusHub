import { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, forwardRef } from 'react';

export const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(({
  className = '',
  ...props
}, ref) => (
  <div className="w-full overflow-x-auto">
    <table ref={ref} className={`w-full text-left text-sm text-slate-600 ${className}`} {...props} />
  </div>
));
Table.displayName = 'Table';

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(({
  className = '',
  ...props
}, ref) => (
  <thead ref={ref} className={`bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600 ${className}`} {...props} />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(({
  className = '',
  ...props
}, ref) => (
  <tbody ref={ref} className={`divide-y divide-slate-100 ${className}`} {...props} />
));
TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(({
  className = '',
  ...props
}, ref) => (
  <tr ref={ref} className={`hover:bg-slate-50/75 transition-colors duration-100 ${className}`} {...props} />
));
TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(({
  className = '',
  ...props
}, ref) => (
  <th ref={ref} className={`px-4 py-3 font-semibold text-slate-700 ${className}`} {...props} />
));
TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(({
  className = '',
  ...props
}, ref) => (
  <td ref={ref} className={`px-4 py-3.5 align-middle ${className}`} {...props} />
));
TableCell.displayName = 'TableCell';
