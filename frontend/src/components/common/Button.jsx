import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-250 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.96] hover:-translate-y-0.5 cursor-pointer';

  const variants = {
    primary: 'bg-[#064e3b] hover:bg-[#047857] text-white shadow-sm hover:shadow-md hover:shadow-emerald-900/20 focus:ring-[#064e3b]',
    navy: 'bg-[#0a192f] hover:bg-[#1b3353] text-white shadow-sm hover:shadow-md hover:shadow-slate-900/30 focus:ring-[#0a192f]',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 focus:ring-slate-400',
    outline: 'border border-slate-300 dark:border-slate-700 hover:border-emerald-700 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-200 focus:ring-emerald-700',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-rose-600/30 focus:ring-rose-500',
    success: 'bg-[#047857] hover:bg-[#065f46] text-white shadow-sm hover:shadow-emerald-700/30 focus:ring-emerald-600',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
