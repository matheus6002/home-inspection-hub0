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

function getWorstStatus(sections: InspectionSections) {
  for (const section of Object.values(sections)) {
    for (const item of Object.values(section)) {
      if (item.status === 'replace') return 'replace'
    }
  }
  for (const section of Object.values(sections)) {
    for (const item of Object.values(section)) {
      if (item.status === 'repair') return 'repair'
    }
  }
  for (const section of Object.values(sections)) {
    for (const item of Object.values(section)) {
      if (item.status === 'ok') return 'ok'
    }
  }
  return 'none'
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string | number; sub?: string
  color: string; icon: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{value}</p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
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

  const completedCount = inspections.filter(i => i.status === 'complete').length
  const attentionCount = inspections.filter(i => {
    const w = getWorstStatus(i.sections ?? {})
    return w === 'replace' || w === 'repair'
  }).length

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-green-800 via-green-700 to-green-600 dark:from-green-950 dark:via-green-900 dark:to-green-800 rounded-2xl p-6 h-28 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-24 animate-pulse" />)}
        </div>
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-28 animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-green-800 via-green-700 to-green-600 dark:from-green-950 dark:via-green-900 dark:to-green-800 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-green-200 text-sm font-medium mb-1">{today}</p>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {client.name.split(' ')[0]}
        </h1>
        <p className="text-green-200 text-sm mt-1 opacity-90">
          {inspections.length === 0
            ? 'Your inspection reports will appear here.'
            : `You have ${inspections.length} inspection report${inspections.length > 1 ? 's' : ''} on file.`}
        </p>
      </div>

      {/* Stat cards — only when there are inspections */}
      {inspections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Reports"
            value={inspections.length}
            sub="on file"
            color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <StatCard
            label="Completed"
            value={completedCount}
            sub={`${inspections.length - completedCount} in progress`}
            color="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="Need Attention"
            value={attentionCount}
            sub="repair or replace items"
            color={attentionCount > 0 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          />
        </div>
      )}

      {/* Inspection list */}
      {inspections.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">No reports yet</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mx-auto">
            Your inspection reports will appear here once your inspector links them to your account.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map((insp) => {
            const { ok, repair, replace } = summarize(insp.sections ?? {})
            const worst = getWorstStatus(insp.sections ?? {})
            const total = ok + repair + replace
            const isDraft = insp.status === 'draft'

            const borderColor =
              worst === 'replace' ? 'border-l-red-500' :
              worst === 'repair'  ? 'border-l-amber-500' :
              worst === 'ok'      ? 'border-l-green-500' :
              'border-l-slate-200 dark:border-l-slate-600'

            return (
              <div key={insp.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-l-4 ${borderColor} p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow`}>

                {/* House icon */}
                <div className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                      {insp.address || 'Property'}
                    </h2>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isDraft
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    }`}>
                      {isDraft ? 'In Progress' : 'Complete'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatDate(insp.inspection_date)}
                  </p>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {ok > 0 && (
                      <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800/50">
                        ✓ {ok} OK
                      </span>
                    )}
                    {repair > 0 && (
                      <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-medium px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800/50">
                        ⚠ {repair} Needs Repair
                      </span>
                    )}
                    {replace > 0 && (
                      <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-medium px-2 py-0.5 rounded-full border border-red-100 dark:border-red-800/50">
                        ✗ {replace} Needs Replacement
                      </span>
                    )}
                    {total === 0 && <span className="text-xs text-slate-400 italic">No items assessed yet</span>}
                    {total > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                          {ok > 0 && <div className="bg-green-500 h-full" style={{ width: `${ok/total*100}%` }} />}
                          {repair > 0 && <div className="bg-amber-500 h-full" style={{ width: `${repair/total*100}%` }} />}
                          {replace > 0 && <div className="bg-red-500 h-full" style={{ width: `${replace/total*100}%` }} />}
                        </div>
                        <span className="text-xs text-slate-400">{total} items</span>
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={`/portal/inspection/${insp.id}`}
                  className="flex-shrink-0 bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm text-center shadow-sm"
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
