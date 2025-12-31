import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden px-6 py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10 disabled:bg-gray-700 disabled:text-gray-500",
    secondary: "bg-white/5 text-gray-200 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 disabled:opacity-40 disabled:hover:bg-white/5",
    accent: "bg-gradient-to-r from-lime-400 to-lime-500 text-black shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 hover:from-lime-300 hover:to-lime-400 disabled:from-lime-900 disabled:to-lime-900 disabled:text-lime-700 disabled:shadow-none",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shine effect for accent buttons */}
      {variant === 'accent' && !disabled && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
      )}

      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="opacity-80">Working...</span>
        </>
      ) : children}
    </button>
  );
};