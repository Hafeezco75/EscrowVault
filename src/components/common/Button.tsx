'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  children,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  // Base button styles
  const baseStyles = 'font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';
  
  // Variant styles (following UI color scheme with light gray background and Sui blue accents)
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white focus:ring-green-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white focus:ring-yellow-500',
    danger: 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white focus:ring-red-500',
    outline: 'border border-gray-300 hover:border-gray-400 disabled:border-gray-200 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 focus:ring-gray-500'
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg'
  };
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Combine all styles
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;
  
  return (
    <button
      className={buttonStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner text={loadingText || 'Loading...'} />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;