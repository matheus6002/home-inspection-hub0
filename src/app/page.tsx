'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getInspections, deleteInspection, getUnreadReviews } from '@/lib/supabase'
import { useApp } from '@/contexts/AppContext'
import type { Inspection, InspectionSections, Review } from '@/types'

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
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function Dashboard() {
  const { t } = useApp()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [unreadReviews, setUnreadReviews] = useState<Review[]>([])

  useEffect(() => {
    Promise.all([getInspections(), getUnreadReviews()])
      .then(([insps, reviews]) => {
        setInspections(insps)
        setUnreadReviews(reviews)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm(t.deleteConfirm)) return
    setDeletingId(id)
    await deleteInspection(id)
    setInspections((prev) => prev.filter((i) => i.id !== id))
    setDeletingId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.inspections}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{inspections.length} {t.total}</p>
        </div>
        <Link
          href="/inspections/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t.newInspection}
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : inspections.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.noInspectionsYet}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{t.createFirstInspection}</p>
          <Link
            href="/inspections/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg inline-block transition-colors"
          >
            {t.createInspection}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {inspections.map((insp) => {
            const { ok, repair, replace } = summarize(insp.sections ?? {})
            const isDraft = insp.status === 'draft'
            const unreadReview = unreadReviews.find(r => r.inspection_id === insp.id)
            return (
              <div
                key={insp.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {insp.address || 'No address'}
                    </h2>
                    {unreadReview && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                        ★ New Review
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isDraft
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    }`}>
                      {isDraft ? t.draft : t.complete}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                    {insp.client_name || 'Unknown client'} &mdash; {formatDate(insp.inspection_date)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {ok > 0 && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium px-2 py-0.5 rounded-full">
                        ✓ {ok} {t.ok}
                      </span>
                    )}
                    {repair > 0 && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 font-medium px-2 py-0.5 rounded-full">
                        ⚠ {repair} {t.needsRepair}
                      </span>
                    )}
                    {replace > 0 && (
                      <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-medium px-2 py-0.5 rounded-full">
                        ✗ {replace} {t.needsReplacement}
                      </span>
                    )}
                    {ok === 0 && repair === 0 && replace === 0 && (
                      <span className="text-xs text-slate-400">{t.noItemsAssessed}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/inspections/${insp.id}/report`}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 border border-blue-200 dark:border-blue-700 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {t.viewReport}
                  </Link>
                  <Link
                    href={`/inspections/${insp.id}`}
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {t.edit}
                  </Link>
                  <button
                    onClick={() => handleDelete(insp.id)}
                    disabled={deletingId === insp.id}
                    className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 border border-red-200 dark:border-red-800 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
