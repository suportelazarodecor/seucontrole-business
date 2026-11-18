import { ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

const variants: Record<Variant, string> = {
  primary: 'relative border border-sky-300/50 bg-gradient-to-b from-sky-300 via-sky-500 to-blue-700 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.65),0_4px_0_#075985,0_9px_18px_rgba(14,165,233,.22)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,.7),0_5px_0_#075985,0_13px_23px_rgba(14,165,233,.28)] active:translate-y-[3px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,.18),0_1px_0_#075985] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none',
  secondary: 'border bg-gradient-to-b from-white to-slate-100 text-text shadow-[inset_0_1px_1px_rgba(255,255,255,.9),0_3px_0_#cbd5e1,0_7px_14px_rgba(15,23,42,.08)] hover:-translate-y-0.5 hover:border-sky-300 dark:from-slate-700 dark:to-slate-800 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,.08),0_3px_0_#0b1220,0_7px_14px_rgba(0,0,0,.24)]',
  ghost: 'text-text transition-colors hover:bg-surface-soft',
  danger: 'border border-rose-300/40 bg-gradient-to-b from-rose-400 to-rose-600 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,.55),0_4px_0_#be123c,0_8px_16px_rgba(244,63,94,.2)] hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,.18),0_1px_0_#be123c]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...rest }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-petroleo/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        size === 'sm' ? 'min-h-9 px-3 py-2 text-xs' : 'min-h-11 px-5 py-2.5 text-sm',
        variants[variant],
        className
      )}
      {...rest}
    />
  )
)
Button.displayName = 'Button'
