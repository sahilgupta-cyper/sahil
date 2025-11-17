
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  // FIX: Specified a more precise type for the icon prop to resolve the React.cloneElement type error.
  icon?: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  // FIX: Added optional `helpText` prop to display hints below the input.
  helpText?: string;
}

const Input: React.FC<InputProps> = ({ label, id, icon, className, helpText, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-secondary mb-1">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">{React.cloneElement(icon, { className: 'w-5 h-5' })}</div>}
        <input
          id={id}
          className={`w-full bg-base-100 border border-base-300 rounded-md py-2 text-neutral placeholder-secondary/60 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm ${icon ? 'pl-10' : 'px-3'} ${className}`}
          {...props}
        />
      </div>
      {helpText && <p className="mt-1 text-xs text-secondary">{helpText}</p>}
    </div>
  );
};

export default Input;