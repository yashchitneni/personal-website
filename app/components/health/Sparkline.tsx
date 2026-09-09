interface SparkBarsProps {
  values: Array<number | null>
  width?: number
  height?: number
  className?: string
  /** index of a bar to emphasise (defaults to the last) */
  highlight?: number
  /**
   * value that maps to zero height. Defaults to 0 (counts). For series that
   * hover in a narrow band (calories) pass 'auto' to expand the visible range.
   */
  floor?: number | 'auto'
}

/** Thin bars for daily counts (training load, calories). Stretches to its container. */
export function SparkBars({ values, width = 240, height = 40, className, highlight, floor = 0 }: SparkBarsProps) {
  const nums = values.map((v) => (typeof v === 'number' ? v : 0))
  const max = Math.max(...nums, 1)
  const present = nums.filter((v) => v > 0)
  const min = present.length ? Math.min(...present) : 0
  const base = floor === 'auto' ? Math.max(0, min - (max - min)) : floor
  const range = max - base || 1
  const gap = 2
  const bw = Math.max(1, (width - gap * (nums.length - 1)) / nums.length)
  const hi = highlight ?? nums.length - 1
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={className} aria-hidden>
      {nums.map((v, i) => {
        const h = v === 0 ? 1 : Math.max(1, ((v - base) / range) * height)
        return (
          <rect
            key={i}
            x={i * (bw + gap)}
            y={height - h}
            width={bw}
            height={h}
            fill="currentColor"
            opacity={v === 0 ? 0.15 : i === hi ? 1 : 0.45}
          />
        )
      })}
    </svg>
  )
}

interface SparklineProps {
  values: Array<number | null>
  width?: number
  height?: number
  className?: string
  /** draw a soft area under the line */
  fill?: boolean
}

/**
 * Tiny inline SVG line. Server-safe, no dependencies. Nulls are skipped so the
 * line breaks rather than dropping to zero. Stretches to its container with a
 * constant stroke width.
 */
export function Sparkline({ values, width = 96, height = 28, className, fill = false }: SparklineProps) {
  const points = values
    .map((v, i) => (typeof v === 'number' ? { i, v } : null))
    .filter((p): p is { i: number; v: number } => p !== null)
  if (points.length < 2) return <svg width={width} height={height} className={className} aria-hidden />

  const min = Math.min(...points.map((p) => p.v))
  const max = Math.max(...points.map((p) => p.v))
  const range = max - min || 1
  const pad = 3
  const x = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2)
  const y = (v: number) => height - pad - ((v - min) / range) * (height - pad * 2)

  let d = ''
  let prevIndex: number | null = null
  for (const p of points) {
    const cmd = prevIndex === null || p.i - prevIndex > 1 ? 'M' : 'L'
    d += `${cmd}${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)} `
    prevIndex = p.i
  }
  const lastPoint = points[points.length - 1]
  const area = `${d}L${x(lastPoint.i).toFixed(1)} ${height} L${x(points[0].i).toFixed(1)} ${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={className} aria-hidden>
      {fill && <path d={area} fill="currentColor" opacity={0.08} />}
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {/* a zero-length round-capped stroke stays circular under non-uniform scaling */}
      <path d={`M${x(lastPoint.i).toFixed(1)} ${y(lastPoint.v).toFixed(1)} h0.01`} stroke="currentColor" strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
