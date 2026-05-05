'use client'

import type { ItemStatus } from '@/types'
import { useApp } from '@/contexts/AppContext'

interface Props {
  value: ItemStatus
  onChange: (status: ItemStatus) => void
}

export default function StatusSelector({ value, onChange }: Props) {
  const { t } = useApp()

  const BUTTONS = [
    {
      status: 'ok' as ItemStatus,
      dot: '✓',
      label: t.ok,
      active: 'bg-green-500 text-white border-transparent shadow-sm',
      inactive: 'bg-white dark:bg-slate-700 text-green-700 dark:text-green-400 border-green-400 hover:bg-green-50 dark:hover:bg-slate-600',
    },
    {
      status: 'repair' as ItemStatus,
      dot: '⚠',
      label: t.needsRepair,
      active: 'bg-yellow-500 text-white border-transparent shadow-sm',
      inactive: 'bg-white dark:bg-slate-700 text-yellow-700 dark:text-yellow-400 border-yellow-400 hover:bg-yellow-50 dark:hover:bg-slate-600',
    },
    {
      status: 'replace' as ItemStatus,
      dot: '✗',
      label: t.needsReplacement,
      active: 'bg-red-500 text-white border-transparent shadow-sm',
      inactive: 'bg-white dark:bg-slate-700 text-red-700 dark:text-red-400 border-red-400 hover:bg-red-50 dark:hover:bg-slate-600',
    },
    {
      status: 'na' as ItemStatus,
      dot: '—',
      label: t.na,
      active: 'bg-gray-400 text-white border-transparent shadow-sm',
      inactive: 'bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-600',
    },
  ]

  return (
    <div className="flex gap-1.5 flex-wrap">
      {BUTTONS.map(({ status, dot, label, active, inactive }) => {
        const isActive = value === status
        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(isActive ? '' : status)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${isActive ? active : inactive}`}
          >
            {dot} {label}
          </button>
        )
      })}
    </div>
  )
}
