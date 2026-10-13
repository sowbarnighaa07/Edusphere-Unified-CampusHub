import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  className = '',
  hoverEffect = false,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`
        bg-white rounded-lg border border-slate-200 shadow-xs
        ${hoverEffect ? 'hover:border-slate-300 transition-colors duration-150' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({
  children,
  className = '',
  ...props
}, ref) => (
  <div ref={ref} className={`px-5 py-4 border-b border-slate-100 ${className}`} {...props}>
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(({
  children,
  className = '',
  ...props
}, ref) => (
  <h3 ref={ref} className={`text-base font-semibold text-slate-900 ${className}`} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(({
  children,
  className = '',
  ...props
}, ref) => (
  <p ref={ref} className={`text-xs text-slate-500 mt-0.5 ${className}`} {...props}>
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({
  children,
  className = '',
  ...props
}, ref) => (
  <div ref={ref} className={`p-5 ${className}`} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({
  children,
  className = '',
  ...props
}, ref) => (
  <div ref={ref} className={`px-5 py-3 bg-slate-50/50 border-t border-slate-100 rounded-b-lg flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';
