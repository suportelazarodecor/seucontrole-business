import { ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

const variants: Record<Variant, string> = {
  primary: 'bg-petroleo text-white hover:bg-sky-600 disabled:opacity-50',
  secondary: 'bg-surface border text-text hover:bg-black/5 dark:hover:bg-white/5',
  ghost: 'text-text hover:bg-black/5 dark:hover:bg-white/5',
  danger: 'bg-coral text-white hover:bg-red-600',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...rest }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-petroleo/50',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        variants[variant],
        className
      )}
      {...rest}
    />
  )
)
Button.displayName = 'Button'
