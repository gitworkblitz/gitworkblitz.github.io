import React from 'react'

export default function ActionButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  fullWidth = false,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md focus:ring-primary-500',
    secondary: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-400',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md focus:ring-red-500',
    ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-400',
    outline: 'border-2 border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
    xl: 'px-10 py-4 text-lg',
  }

  const sizeWithIcon = {
    sm: 'px-3 py-1.5 text-xs',
    md: icon && iconPosition === 'left' ? 'px-4 py-2.5 text-sm' : 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }

  const spinnerSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizeWithIcon[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <div className={`${spinnerSizes[size]} border-2 ${variant === 'secondary' || variant === 'ghost' || variant === 'outline' ? 'border-gray-400 border-t-transparent' : 'border-white border-t-transparent'} rounded-full animate-spin`} />
          <span>Loading…</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  )
}
