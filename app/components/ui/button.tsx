import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function Button({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'transparent text-blue-600 hover:bg-blue-100'
  }
  const sizeStyles = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1.5 text-sm',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2'
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    />
  )
}