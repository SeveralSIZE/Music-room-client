import { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'danger' | 'icon'
  loading?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  loading,
  className = '',
  disabled,
  ...props
}: Props) {
  const base = 'inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors rounded focus:outline-none disabled:opacity-40'
  const variants = {
    primary: 'bg-zinc-100 text-zinc-900 hover:bg-white px-4 py-2',
    ghost: 'bg-transparent border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 px-4 py-2',
    danger: 'bg-transparent border border-red-800 text-red-400 hover:border-red-600 hover:text-red-300 px-4 py-2',
    icon: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 w-8 h-8 rounded',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : children}
    </button>
  )
}