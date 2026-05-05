'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getInspectionsByClientId } from '@/lib/supabase'
import { usePortal } from '@/contexts/PortalContext'
import type { Inspection, InspectionSections } from '@/types'

function summarize(sections: InspectionSections) {
  let ok = 0, repair = 0, replace = 0
  for (const section of Object.values(sections)) {
    for (const item of Object.values(section)) {
      if (item.status === 'ok') ok++
      else if (item.status === 'repair') repair++
      else if (item.status === 'replace') replace++
    }
  }
  return { ok, repair, replace }
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function PortalDashboard() {
  const { client } = usePortal()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!client) return
    getInspectionsByClientId(client.id)
      .then(setInspections)
      .finally(() => setLoading(false))
  }, [client])

  if (!client) return null

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Your Inspections</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Hello, {client.name}. Here are your inspection reports.
        </p>
      </div>

      {inspections.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">No inspections yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Your inspection reports will appear here once your inspector links them to your account.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inspections.map((insp) => {
            const { ok, repair, replace } = summarize(insp.sections ?? {})
            return (
              <div
                key={insp.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                    {insp.address || 'Property'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                    {formatDate(insp.inspection_date)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {ok > 0 && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium px-2 py-0.5 rounded-full">
                        ✓ {ok} OK
                      </span>
                    )}
                    {repair > 0 && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 font-medium px-2 py-0.5 rounded-full">
                        ⚠ {repair} Needs Repair
                      </span>
                    )}
                    {replace > 0 && (
                      <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-medium px-2 py-0.5 rounded-full">
                        ✗ {replace} Needs Replacement
                      </span>
                    )}
                    {ok === 0 && repair === 0 && replace === 0 && (
                      <span className="text-xs text-slate-400">No items assessed yet</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/portal/inspection/${insp.id}`}
                  className="flex-shrink-0 bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm text-center"
                >
                  View Report
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
