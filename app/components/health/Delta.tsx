import { cn } from '@/app/lib/utils'
import type { Trend } from '@/app/types/health'

interface DeltaProps {
  display: string | null
  trend: Trend
  higherIsBetter: boolean
  className?: string
}

/** Signed change with a quiet good / bad tint. Flat stays neutral. */
export function Delta({ display, trend, higherIsBetter, className }: DeltaProps) {
  if (!display) return <span className={cn('text-stone-400', className)}>—</span>
  const good = trend === 'flat' ? null : (trend === 'up') === higherIsBetter
  return (
    <span
      className={cn(
        'tabular-nums',
        good === null && 'text-stone-400',
        good === true && 'text-emerald-700',
        good === false && 'text-rose-700',
        className,
      )}
    >
      {trend === 'up' && '↑ '}
      {trend === 'down' && '↓ '}
      {display}
    </span>
  )
}
