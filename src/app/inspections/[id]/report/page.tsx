'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getInspection, getReview, markReviewRead } from '@/lib/supabase'
import { SECTIONS, STATUS_CONFIG } from '@/lib/sections'
import { useApp } from '@/contexts/AppContext'
import StatusBadge from '@/components/StatusBadge'
import { DownloadPDFButton } from '@/components/PDFReport'
import type { Inspection, Review, ItemStatus } from '@/types'

function fmtTime(t: string) {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function ReportPage() {
  const params = useParams()
  const { t } = useApp()
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params.id as string
    Promise.all([getInspection(id), getReview(id)])
      .then(([insp, rev]) => {
        setInspection(insp)
        setReview(rev)
      })
      .finally(() => setLoading(false))
  }, [params.id])

  async function handleMarkRead() {
    if (!review) return
    await markReviewRead(review.id)
    setReview(prev => prev ? { ...prev, is_read: true } : null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!inspection) {
    return <div className="text-center py-20 text-slate-500">Inspection not found.</div>
  }

  const sec = inspection.sections ?? {}

  function sectionSummary(key: string) {
    const data = sec[key] ?? {}
    const items = Object.values(data)
    if (items.some(i => i.status === 'replace')) return 'replace'
    if (items.some(i => i.status === 'repair')) return 'repair'
    if (items.length > 0 && items.every(i => i.status === 'ok' || i.status === 'na')) return 'ok'
    return ''
  }

  const allItems = SECTIONS.flatMap(s =>
    s.items.map(item => sec[s.key]?.[item.id])
  )
  const ok = allItems.filter(i => i?.status === 'ok').length
  const repair = allItems.filter(i => i?.status === 'repair').length
  const replace = allItems.filter(i => i?.status === 'replace').length

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <a href={`/inspections/${inspection.id}`} className="text-sm text-green-700 dark:text-green-400 hover:underline">
            {t.backToForm}
          </a>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{t.inspectionReport}</h1>
        </div>
        <DownloadPDFButton inspection={inspection} />
      </div>

      {/* Cover card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className="bg-green-800 px-6 py-4">
          <h2 className="text-xl font-bold text-white">{inspection.address}</h2>
          {inspection.city_state_zip && <p className="text-green-200 text-sm">{inspection.city_state_zip}</p>}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <InfoRow label={t.client} value={inspection.client_name} />
            <InfoRow label={t.date} value={fmtDate(inspection.inspection_date)} />
            <InfoRow label={t.time} value={`${fmtTime(inspection.start_time)} – ${fmtTime(inspection.end_time)}`} />
            <InfoRow label={t.weather} value={`${inspection.weather ?? ''} ${inspection.temperature ?? ''}`.trim()} />
            <InfoRow label={t.inspector} value={inspection.inspector_name} />
            <InfoRow label={t.license} value={inspection.license_number} />
            {inspection.attendees && <InfoRow label={t.present} value={inspection.attendees} />}
          </div>

          <div className="flex gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-700 flex-wrap">
            <SummaryBox count={ok} label={t.ok} colorNum="text-green-600" colorBg="bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800" />
            <SummaryBox count={repair} label={t.needsRepair} colorNum="text-yellow-600" colorBg="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-800" />
            <SummaryBox count={replace} label={t.needsReplacement} colorNum="text-red-600" colorBg="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800" />
          </div>
        </div>
      </div>

      {/* Client Review */}
      {review && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Client Review
              {!review.is_read && (
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 font-medium px-2 py-0.5 rounded-full">
                  New
                </span>
              )}
            </h2>
            {!review.is_read && (
              <button
                onClick={handleMarkRead}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline"
              >
                Mark as read
              </button>
            )}
          </div>
          <div className="flex gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} className={`w-5 h-5 ${i <= review.rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          {review.comment && (
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{review.comment}</p>
          )}
        </div>
      )}

      {/* Section panels */}
      <div className="space-y-4">
        {SECTIONS.map((section) => {
          const sectionData = sec[section.key] ?? {}
          const summary = sectionSummary(section.key)
          const cfg = summary ? STATUS_CONFIG[summary as keyof typeof STATUS_CONFIG] : null
          const sectionTitle = (t.sectionTitles as Record<string, string>)[section.key] ?? section.title

          return (
            <div key={section.key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className={`flex items-center justify-between px-5 py-3 ${cfg ? cfg.bg : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{sectionTitle}</h3>
                {cfg ? (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                    {cfg.dot} {cfg.label}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">{t.notAssessed}</span>
                )}
              </div>

              <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {section.items.map((item) => {
                  const d = sectionData[item.id]
                  const status = (d?.status ?? '') as ItemStatus
                  const hasData = status || d?.notes
                  return (
                    <div key={item.id} className={`px-5 py-3 flex flex-col sm:flex-row sm:items-start gap-2 ${!hasData ? 'opacity-40' : ''}`}>
                      <span className="font-medium text-slate-700 dark:text-slate-300 flex-1 text-sm">{item.label}</span>
                      <div className="flex flex-col sm:items-end gap-1 sm:w-52">
                        <StatusBadge status={status} />
                        {d?.notes && <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">{d.notes}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value?.trim() || value.trim() === '—') return null
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-slate-700 dark:text-slate-300 font-medium">{value}</p>
    </div>
  )
}

function SummaryBox({ count, label, colorNum, colorBg }: { count: number; label: string; colorNum: string; colorBg: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg px-4 py-2 ${colorBg}`}>
      <span className={`text-2xl font-bold ${colorNum}`}>{count}</span>
      <span className={`text-sm font-medium ${colorNum}`}>{label}</span>
    </div>
  )
}
