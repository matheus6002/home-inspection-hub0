'use client'

import type { ItemStatus } from '@/types'
import { useApp } from '@/contexts/AppContext'

const BADGE_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  ok:      { bg: 'bg-green-100 dark:bg-green-900/40',   text: 'text-green-800 dark:text-green-300',   dot: '✓' },
  repair:  { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300', dot: '⚠' },
  replace: { bg: 'bg-red-100 dark:bg-red-900/40',       text: 'text-red-800 dark:text-red-300',       dot: '✗' },
  na:      { bg: 'bg-gray-100 dark:bg-gray-700',        text: 'text-gray-500 dark:text-gray-400',     dot: '—' },
}

export default function StatusBadge({ status }: { status: ItemStatus }) {
  const { t } = useApp()

  if (!status) {
    return <span className="text-xs text-slate-400 italic">{t.notAssessed}</span>
  }

  const labels: Record<string, string> = {
    ok: t.ok,
    repair: t.needsRepair,
    replace: t.needsReplacement,
    na: t.na,
  }

  const b = BADGE_STYLE[status]
  if (!b) return null

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${b.bg} ${b.text}`}>
      {b.dot} {labels[status]}
    </span>
  )
}
