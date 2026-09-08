import type { ReactNode } from 'react'
import { cn } from '@/app/lib/utils'

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('text-[11px] uppercase tracking-[0.14em] text-stone-500', className)}>{children}</div>
}

interface StatProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  className?: string
}

/** Label over a number, optional one-line context below. */
export function Stat({ label, value, sub, className }: StatProps) {
  return (
    <div className={className}>
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-1.5 font-display text-2xl font-light tabular-nums tracking-tight text-stone-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-stone-500">{sub}</div>}
    </div>
  )
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4', className)}>{children}</div>
}

interface TableProps {
  head: ReactNode[]
  rows: ReactNode[][]
  /** column indexes to right-align (numbers) */
  numeric?: number[]
  className?: string
  caption?: string
}

/** Hairline table with tabular numbers; scrolls horizontally on small screens. */
export function Table({ head, rows, numeric = [], className, caption }: TableProps) {
  const align = (i: number) => (numeric.includes(i) ? 'text-right' : 'text-left')
  return (
    <div className={cn('-mx-1 overflow-x-auto px-1', className)}>
      <table className="w-full min-w-[520px] border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-stone-200">
            {head.map((h, i) => (
              <th key={i} scope="col" className={cn('py-2 pr-4 text-[11px] font-normal uppercase tracking-[0.14em] text-stone-500', align(i), i === head.length - 1 && 'pr-0')}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-stone-100 last:border-0">
              {row.map((cell, c) => (
                <td key={c} className={cn('py-2.5 pr-4 tabular-nums text-stone-800', align(c), c === row.length - 1 && 'pr-0', c === 0 && 'text-stone-500')}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-stone-200', className)} />
}
