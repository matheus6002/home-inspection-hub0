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
          [itemId]: {
            status,
            notes: prev[sectionKey]?.[itemId]?.notes ?? '',
          },
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
          [itemId]: {
            status: prev[sectionKey]?.[itemId]?.status ?? '',
            notes,
          },
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

  function sectionSummary(key: string) {
    const data = sections[key] ?? {}
    const items = Object.values(data)
    const replace = items.filter(i => i.status === 'replace').length
    const repair = items.filter(i => i.status === 'repair').length
    if (replace > 0) return 'replace'
    if (repair > 0) return 'repair'
    if (items.length > 0 && items.every(i => i.status === 'ok' || i.status === 'na')) return 'ok'
    return ''
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg truncate">{inspection.address}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              markComplete
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {markComplete ? t.complete : t.draft}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{inspection.client_name} &mdash; {inspection.inspection_date ?? '—'}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <SaveIndicator state={saveState} t={t} />
          <button
            onClick={toggleComplete}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              markComplete
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200'
                : 'bg-blue-600 text-white border-transparent hover:bg-blue-700'
            }`}
          >
            {markComplete ? t.markAsDraft : t.markComplete}
          </button>
          <a
            href={`/inspections/${inspection.id}/report`}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            {t.viewReport}
          </a>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Sidebar tabs — desktop */}
        <div className="hidden lg:flex flex-col w-56 flex-shrink-0 gap-1">
          {SECTIONS.map((sec, idx) => {
            const summary = sectionSummary(sec.key)
            const title = (t.sectionTitles as Record<string, string>)[sec.key] ?? sec.title
            return (
              <button
                key={sec.key}
                onClick={() => setActiveSection(idx)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between gap-2 transition-colors ${
                  idx === activeSection
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="truncate">{title}</span>
                {summary === 'replace' && <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />}
                {summary === 'repair' && <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />}
                {summary === 'ok' && <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />}
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
                  className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                    idx === activeSection
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {title}
                  {summary === 'replace' && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                  {summary === 'repair' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                  {summary === 'ok' && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Section panel */}
        <div className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 lg:p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5 pb-3 border-b border-slate-100 dark:border-slate-700">
            {sectionTitle}
          </h3>
          <div className="space-y-6">
            {currentSection.items.map((item) => {
              const itemData = sectionData[item.id]
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="font-medium text-slate-700 dark:text-slate-300 min-w-0 flex-1">{item.label}</span>
                    <StatusSelector
                      value={itemData?.status ?? ''}
                      onChange={(status) => setItemStatus(currentSection.key, item.id, status)}
                    />
                  </div>
                  <textarea
                    value={itemData?.notes ?? ''}
                    onChange={e => setItemNotes(currentSection.key, item.id, e.target.value)}
                    placeholder={t.notesPlaceholder}
                    rows={2}
                    className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )
            })}
          </div>

          {/* Prev / Next */}
          <div className="flex justify-between mt-8 pt-5 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setActiveSection((i) => Math.max(0, i - 1))}
              disabled={activeSection === 0}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              &larr; {t.previous}
            </button>
            <span className="text-sm text-slate-400 self-center">
              {activeSection + 1} / {SECTIONS.length}
            </span>
            <button
              onClick={() => setActiveSection((i) => Math.min(SECTIONS.length - 1, i + 1))}
              disabled={activeSection === SECTIONS.length - 1}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              {t.next} &rarr;
            </button>
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
        <span className="w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
        {t.saving}
      </span>
    )
  }
  if (state === 'unsaved') return <span className="text-xs text-orange-500">{t.unsaved}</span>
  return <span className="text-xs text-green-600 dark:text-green-400">✓ {t.saved}</span>
}
