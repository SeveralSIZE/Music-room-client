import { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`bg-zinc-800 border ${
          error ? 'border-red-500' : 'border-zinc-700'
        } rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500
        focus:outline-none focus:border-zinc-500 transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}