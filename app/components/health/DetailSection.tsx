'use client'

import { useState, type ReactNode } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface DetailSectionProps {
  id: string
  title: string
  /** the one number that matters, shown collapsed */
  headline: ReactNode
  /** quiet secondary stat, shown collapsed on wider screens */
  aside?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

/**
 * Detail-on-demand row. Collapsed: title + headline stat. Expanded: the
 * server-rendered detail passed as children.
 */
export function DetailSection({ id, title, headline, aside, defaultOpen = false, children }: DetailSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="border-t border-stone-200" id={id}>
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className="group flex w-full items-center gap-4 py-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbfaf8] md:gap-8"
          aria-label={`${open ? 'Collapse' : 'Expand'} ${title}`}
        >
          <span className="w-24 shrink-0 text-[11px] uppercase tracking-[0.14em] text-stone-500 md:w-32">{title}</span>
          <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-display text-2xl font-light tabular-nums tracking-tight text-stone-900 md:text-3xl">{headline}</span>
            {aside && <span className="text-sm text-stone-500">{aside}</span>}
          </span>
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 text-stone-400 transition-transform duration-300 group-hover:text-stone-900', open && 'rotate-180')}
            aria-hidden
          />
        </button>
      </Collapsible.Trigger>
      <AnimatePresence initial={false}>
        {open && (
          <Collapsible.Content forceMount asChild>
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="pb-10 pt-2 md:pl-40">{children}</div>
            </motion.div>
          </Collapsible.Content>
        )}
      </AnimatePresence>
    </Collapsible.Root>
  )
}
