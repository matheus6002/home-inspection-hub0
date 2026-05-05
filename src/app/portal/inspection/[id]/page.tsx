'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getInspection, getReview } from '@/lib/supabase'
import { SECTIONS, STATUS_CONFIG } from '@/lib/sections'
import { usePortal } from '@/contexts/PortalContext'
import StatusBadge from '@/components/StatusBadge'
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

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
          fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
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

export default function PortalInspectionPage() {
  const params = useParams()
  const router = useRouter()
  const { client } = usePortal()
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)

  const inspectionId = params.id as string

  useEffect(() => {
    if (!client) return
    Promise.all([getInspection(inspectionId), getReview(inspectionId)])
      .then(([insp, rev]) => {
        setInspection(insp)
        setReview(rev)
      })
      .finally(() => setLoading(false))
  }, [inspectionId, client])

  if (!client) return null

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

  if (inspection.client_id && inspection.client_id !== client.id) {
    router.replace('/portal/dashboard')
    return null
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

  const allItems = SECTIONS.flatMap(s => s.items.map(item => sec[s.key]?.[item.id]))
  const ok = allItems.filter(i => i?.status === 'ok').length
  const repair = allItems.filter(i => i?.status === 'repair').length
  const replace = allItems.filter(i => i?.status === 'replace').length

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/portal/dashboard" className="text-sm text-green-700 dark:text-green-400 hover:underline">
          ← My Inspections
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">Inspection Report</h1>
      </div>

      {/* Cover card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className="bg-green-800 px-6 py-4">
          <h2 className="text-xl font-bold text-white">{inspection.address}</h2>
          {inspection.city_state_zip && (
            <p className="text-green-200 text-sm">{inspection.city_state_zip}</p>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {inspection.client_name && <InfoRow label="Client" value={inspection.client_name} />}
            <InfoRow label="Date" value={fmtDate(inspection.inspection_date)} />
            <InfoRow label="Time" value={`${fmtTime(inspection.start_time)} – ${fmtTime(inspection.end_time)}`} />
            {inspection.weather && (
              <InfoRow label="Weather" value={`${inspection.weather} ${inspection.temperature ?? ''}`.trim()} />
            )}
            <InfoRow label="Inspector" value={inspection.inspector_name} />
            {inspection.license_number && <InfoRow label="License" value={inspection.license_number} />}
            {inspection.attendees && <InfoRow label="Present" value={inspection.attendees} />}
          </div>

          {(ok > 0 || repair > 0 || replace > 0) && (
            <div className="flex gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-700 flex-wrap">
              {ok > 0 && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-lg px-4 py-2">
                  <span className="text-2xl font-bold text-green-600">{ok}</span>
                  <span className="text-sm font-medium text-green-600">OK</span>
                </div>
              )}
              {repair > 0 && (
                <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-800 rounded-lg px-4 py-2">
                  <span className="text-2xl font-bold text-yellow-600">{repair}</span>
                  <span className="text-sm font-medium text-yellow-600">Needs Repair</span>
                </div>
              )}
              {replace > 0 && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg px-4 py-2">
                  <span className="text-2xl font-bold text-red-600">{replace}</span>
                  <span className="text-sm font-medium text-red-600">Needs Replacement</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inspection sections */}
      <div className="space-y-4 mb-8">
        {SECTIONS.map((section) => {
          const sectionData = sec[section.key] ?? {}
          const hasAnyData = section.items.some(
            item => sectionData[item.id]?.status || sectionData[item.id]?.notes
          )
          if (!hasAnyData) return null

          const summary = sectionSummary(section.key)
          const cfg = summary ? STATUS_CONFIG[summary as keyof typeof STATUS_CONFIG] : null

          return (
            <div key={section.key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className={`flex items-center justify-between px-5 py-3 ${cfg ? cfg.bg : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{section.title}</h3>
                {cfg && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                    {cfg.dot} {cfg.label}
                  </span>
                )}
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {section.items.map((item) => {
                  const d = sectionData[item.id]
                  const status = (d?.status ?? '') as ItemStatus
                  if (!status && !d?.notes) return null
                  return (
                    <div key={item.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-start gap-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300 flex-1 text-sm">
                        {item.label}
                      </span>
                      <div className="flex flex-col sm:items-end gap-1 sm:w-52">
                        <StatusBadge status={status} />
                        {d?.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">{d.notes}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Review section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Your Review</h2>
        {review ? (
          <div>
            <Stars rating={review.rating} />
            {review.comment && (
              <p className="text-slate-600 dark:text-slate-300 mt-3 text-sm leading-relaxed">{review.comment}</p>
            )}
            <Link
              href={`/portal/inspection/${inspectionId}/review`}
              className="inline-block mt-4 text-sm font-medium text-green-700 dark:text-green-400 hover:underline"
            >
              Edit your review →
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              How was your experience with Navigator Home Inspections? Your feedback is appreciated.
            </p>
            <Link
              href={`/portal/inspection/${inspectionId}/review`}
              className="inline-block bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Leave a Review
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
