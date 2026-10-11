import React from 'react';
import { AlertCircle } from 'lucide-react';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-lg border text-sm transition-colors py-2.5 px-3.5 ${
            error
              ? 'border-rose-300 dark:border-rose-600 text-rose-900 dark:text-rose-200 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/30 dark:bg-rose-950/20'
              : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500 bg-white dark:bg-slate-900'
          } disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:cursor-not-allowed`}
          {...props}
        >
          {placeholder && <option value="" className="dark:bg-slate-900 dark:text-slate-400">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="dark:bg-slate-900 dark:text-white">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Select;
