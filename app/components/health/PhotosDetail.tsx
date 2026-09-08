import Image from 'next/image'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { fmtDate } from '@/app/lib/health/format'
import type { ISODate, ProgressPhoto } from '@/app/types/health'
import { Eyebrow } from './primitives'

interface PhotosDetailProps {
  photos: ProgressPhoto[]
  dayZero: ISODate | null
}

/** Weekly front-pose grid with weight under each. Missing images render as quiet tiles. */
export function PhotosDetail({ photos, dayZero }: PhotosDetailProps) {
  const front = photos.filter((p) => p.pose === 'front').sort((a, b) => a.date.localeCompare(b.date))
  const recent = front.slice(-8)
  const weekOf = (date: ISODate) => (dayZero ? Math.floor(differenceInCalendarDays(parseISO(date), parseISO(dayZero)) / 7) : null)
  const pending = photos.filter((p) => !p.url).length

  return (
    <div className="space-y-6">
      <Eyebrow>
        Front pose, weekly · {front.length} weeks
        {pending > 0 && <span className="text-stone-400"> · {pending} awaiting upload</span>}
      </Eyebrow>
      <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
        {recent.map((p) => {
          const wk = weekOf(p.date)
          return (
            <figure key={p.id} className="space-y-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-stone-100 ring-1 ring-inset ring-stone-200">
                {p.url ? (
                  <Image src={p.url} alt={`Progress photo, ${fmtDate(p.date, 'MMM d, yyyy')}`} fill sizes="(min-width: 768px) 12vw, 25vw" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-end justify-center pb-3">
                    <span className="font-display text-2xl font-light text-stone-300">{wk === null ? '' : wk === 0 ? '0' : wk}</span>
                  </div>
                )}
              </div>
              <figcaption className="text-[11px] leading-tight text-stone-500">
                <div className="text-stone-700">{wk === 0 ? 'Day 0' : wk !== null ? `Week ${wk}` : fmtDate(p.date)}</div>
                <div className="tabular-nums text-stone-400">{p.weightKg ? `${p.weightKg.toFixed(1)} kg` : fmtDate(p.date)}</div>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </div>
  )
}
