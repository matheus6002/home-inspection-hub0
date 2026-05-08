'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { SECTIONS } from '@/lib/sections'
import { updateInspection } from '@/lib/supabase'
import { useApp } from '@/contexts/AppContext'
import StatusSelector from './StatusSelector'
import type { Inspection, InspectionSections, ItemStatus } from '@/types'

interface Props {
  inspection: Inspection
}

type SaveState = 'saved' | 'saving' | 'unsaved'

export default function InspectionForm({ inspection }: Props) {
  const { t } = useApp()
  const [activeSection, setActiveSection] = useState(0)
  const [sections, setSections] = useState<InspectionSections>(inspection.sections ?? {})
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [markComplete, setMarkComplete] = useState(inspection.status === 'complete')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    async (data: InspectionSections, complete: boolean) => {
      setSaveState('saving')
      try {
        await updateInspection(inspection.id, {
          sections: data,
          status: complete ? 'complete' : 'draft',
        })
        setSaveState('saved')
      } catch {
        setSaveState('unsaved')
      }
    },
    [inspection.id]
  )

  function scheduleSave(data: InspectionSections, complete: boolean) {
    setSaveState('unsaved')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(data, complete), 800)
  }

  function setItemStatus(sectionKey: string, itemId: string, status: ItemStatus) {
    setSections((prev) => {
      const next = {
        ...prev,
        [sectionKey]: {
          ...(prev[sectionKey] ?? {}),
          [itemId]: { status, notes: prev[sectionKey]?.[itemId]?.notes ?? '' },
        },
      }
      scheduleSave(next, markComplete)
      return next
    })
  }

  function setItemNotes(sectionKey: string, itemId: string, notes: string) {
    setSections((prev) => {
      const next = {
        ...prev,
        [sectionKey]: {
          ...(prev[sectionKey] ?? {}),
          [itemId]: { status: prev[sectionKey]?.[itemId]?.status ?? '', notes },
        },
      }
      scheduleSave(next, markComplete)
      return next
    })
  }

  function toggleComplete() {
    const next = !markComplete
    setMarkComplete(next)
    scheduleSave(sections, next)
  }

  const currentSection = SECTIONS[activeSection]
  const sectionData = sections[currentSection.key] ?? {}
  const sectionTitle = (t.sectionTitles as Record<string, string>)[currentSection.key] ?? currentSection.title

  function sectionSummary(key: string): 'ok' | 'repair' | 'replace' | '' {
    const data = sections[key] ?? {}
    const items = Object.values(data)
    if (items.some(i => i.status === 'replace')) return 'replace'
    if (items.some(i => i.status === 'repair')) return 'repair'
    if (items.length > 0 && items.every(i => i.status === 'ok' || i.status === 'na')) return 'ok'
    return ''
  }

  // Overall progress
  const assessedSections = SECTIONS.filter(s => sectionSummary(s.key) !== '').length
  const progressPct = Math.round((assessedSections / SECTIONS.length) * 100)

  const allItems = SECTIONS.flatMap(s => s.items.map(item => sections[s.key]?.[item.id]))
  const assessedItems = allItems.filter(i => i?.status).length
  const totalItems = allItems.length

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg truncate">{inspection.address}</h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                markComplete
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {markComplete ? t.complete : t.draft}
              </span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-300">{inspection.client_name}</span>
              {' · '}
              {inspection.inspection_date ?? '—'}
            </p>
            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Progress</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{assessedItems} / {totalItems} items</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${(assessedItems / totalItems) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <SaveIndicator state={saveState} t={t} />
            <button
              onClick={toggleComplete}
              className={`text-sm font-semibold px-3.5 py-1.5 rounded-lg transition-colors ${
                markComplete
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              {markComplete ? t.markAsDraft : t.markComplete}
            </button>
            <a
              href={`/inspections/${inspection.id}/report`}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-slate-400 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              {t.viewReport}
            </a>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Sidebar — desktop */}
        <div className="hidden lg:flex flex-col w-60 flex-shrink-0 gap-0.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 shadow-sm h-fit sticky top-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5 mb-1">Sections</p>
          {SECTIONS.map((sec, idx) => {
            const summary = sectionSummary(sec.key)
            const title = (t.sectionTitles as Record<string, string>)[sec.key] ?? sec.title
            const isActive = idx === activeSection
            return (
              <button
                key={sec.key}
                onClick={() => setActiveSection(idx)}
                className={`text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-colors group ${
                  isActive
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}>
                  {idx + 1}
                </span>
                <span className="truncate flex-1">{title}</span>
                {summary === 'replace' && <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />}
                {summary === 'repair'  && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />}
                {summary === 'ok'      && <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden w-full overflow-x-auto">
          <div className="flex gap-1.5 pb-2 min-w-max">
            {SECTIONS.map((sec, idx) => {
              const summary = sectionSummary(sec.key)
              const title = (t.sectionTitles as Record<string, string>)[sec.key] ?? sec.title
              return (
                <button
                  key={sec.key}
                  onClick={() => setActiveSection(idx)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                    idx === activeSection
                      ? 'bg-green-700 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {title}
                  {summary === 'replace' && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                  {summary === 'repair'  && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  {summary === 'ok'      && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Section panel */}
        <div className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{sectionTitle}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Section {activeSection + 1} of {SECTIONS.length}</p>
            </div>
            {sectionSummary(currentSection.key) === 'ok' && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">✓ All OK</span>
            )}
            {sectionSummary(currentSection.key) === 'repair' && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">⚠ Needs Repair</span>
            )}
            {sectionSummary(currentSection.key) === 'replace' && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">✗ Needs Replacement</span>
            )}
          </div>

          <div className="p-6">
            <div className="space-y-5">
              {currentSection.items.map((item, itemIdx) => {
                const itemData = sectionData[item.id]
                const hasData = itemData?.status || itemData?.notes
                return (
                  <div key={item.id} className={`rounded-xl border p-4 transition-colors ${
                    hasData
                      ? 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'
                      : 'border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-700/10'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {itemIdx + 1}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{item.label}</span>
                      </div>
                      <div className="flex-shrink-0">
                        <StatusSelector
                          value={itemData?.status ?? ''}
                          onChange={(status) => setItemStatus(currentSection.key, item.id, status)}
                        />
                      </div>
                    </div>
                    <textarea
                      value={itemData?.notes ?? ''}
                      onChange={e => setItemNotes(currentSection.key, item.id, e.target.value)}
                      placeholder={t.notesPlaceholder}
                      rows={2}
                      className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-600 bg-white dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>
                )
              })}
            </div>

            {/* Prev / Next */}
            <div className="flex justify-between mt-6 pt-5 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setActiveSection((i) => Math.max(0, i - 1))}
                disabled={activeSection === 0}
                className="text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                {t.previous}
              </button>
              <div className="flex items-center gap-1">
                {SECTIONS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSection(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === activeSection ? 'bg-green-600 w-4' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveSection((i) => Math.min(SECTIONS.length - 1, i + 1))}
                disabled={activeSection === SECTIONS.length - 1}
                className="text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors flex items-center gap-1.5"
              >
                {t.next}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SaveIndicator({ state, t }: { state: SaveState; t: { saving: string; saved: string; unsaved: string } }) {
  if (state === 'saving') {
    return (
      <span className="text-xs text-slate-400 flex items-center gap-1.5">
        <span className="w-3 h-3 border-2 border-slate-300 border-t-green-500 rounded-full animate-spin" />
        {t.saving}
      </span>
    )
  }
  if (state === 'unsaved') return <span className="text-xs text-amber-500 font-medium">● {t.unsaved}</span>
  return <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ {t.saved}</span>
}
