import { ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

const variants: Record<Variant, string> = {
  primary: 'border border-sky-300/40 bg-gradient-to-b from-sky-400 to-sky-600 text-white shadow-[0_4px_0_#0369a1,0_8px_18px_rgba(14,165,233,.24)] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#0369a1,0_12px_22px_rgba(14,165,233,.3)] active:translate-y-1 active:shadow-none disabled:opacity-50 dark:from-sky-400 dark:to-sky-600',
  secondary: 'border bg-gradient-to-b from-white to-slate-100 text-text shadow-[0_3px_0_#cbd5e1,0_7px_14px_rgba(15,23,42,.10)] hover:-translate-y-0.5 dark:from-slate-700 dark:to-slate-800 dark:shadow-[0_3px_0_#0f172a,0_7px_14px_rgba(0,0,0,.3)]',
  ghost: 'text-text hover:bg-black/5 dark:hover:bg-white/5',
  danger: 'border border-rose-300/40 bg-gradient-to-b from-rose-400 to-rose-600 text-white shadow-[0_4px_0_#be123c,0_8px_16px_rgba(244,63,94,.22)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...rest }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-petroleo/50',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        variants[variant],
        className
      )}
      {...rest}
    />
  )
)
Button.displayName = 'Button'
