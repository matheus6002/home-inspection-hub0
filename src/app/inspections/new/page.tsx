'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createInspection, getClients } from '@/lib/supabase'
import { useApp } from '@/contexts/AppContext'
import type { Client } from '@/types'

export default function NewInspection() {
  const router = useRouter()
  const { t } = useApp()
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [form, setForm] = useState({
    client_name: '',
    address: '',
    city_state_zip: '',
    inspection_date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    inspector_name: '',
    license_number: '',
    weather: '',
    temperature: '72',
    attendees: '',
  })

  useEffect(() => {
    getClients().then(setClients)
  }, [])

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleClientSelect(clientId: string) {
    setSelectedClientId(clientId)
    if (clientId) {
      const client = clients.find(c => c.id === clientId)
      if (client) set('client_name', client.name)
    }
  }

  function adjustTemp(delta: number) {
    const current = parseInt(form.temperature) || 72
    set('temperature', String(current + delta))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        temperature: form.temperature + '°F',
        client_id: selectedClientId || null,
      }
      const insp = await createInspection(payload)
      router.push(`/inspections/${insp.id}`)
    } catch (err) {
      console.error(err)
      alert('Failed to create inspection. Check your Supabase connection.')
      setSaving(false)
    }
  }

  const inp = 'w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <a href="/" className="text-sm text-green-700 dark:text-green-400 hover:underline">{t.backToInspections}</a>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{t.newInspectionTitle}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t.newInspectionSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">

        {clients.length > 0 && (
          <Field label="Link to Client">
            <select
              className={inp}
              value={selectedClientId}
              onChange={e => handleClientSelect(e.target.value)}
            >
              <option value="">— No client linked —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ''}</option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={t.clientName} required>
            <input className={inp} value={form.client_name} onChange={e => set('client_name', e.target.value)} required placeholder={t.phClientName} />
          </Field>
          <Field label={t.inspectionDate} required>
            <input type="date" className={inp} value={form.inspection_date} onChange={e => set('inspection_date', e.target.value)} required />
          </Field>
        </div>

        <Field label={t.propertyAddress} required>
          <input className={inp} value={form.address} onChange={e => set('address', e.target.value)} required placeholder={t.phAddress} />
        </Field>

        <Field label={t.cityStateZip}>
          <input className={inp} value={form.city_state_zip} onChange={e => set('city_state_zip', e.target.value)} placeholder={t.phCityStateZip} />
        </Field>

        <Field label={t.inspectionTime}>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">{t.startTime}</label>
              <input type="time" className={inp} value={form.start_time} onChange={e => set('start_time', e.target.value)} />
            </div>
            <span className="text-slate-400 mt-5 font-medium">{t.to}</span>
            <div className="flex-1">
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">{t.endTime}</label>
              <input type="time" className={inp} value={form.end_time} onChange={e => set('end_time', e.target.value)} />
            </div>
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={t.inspectorName} required>
            <input className={inp} value={form.inspector_name} onChange={e => set('inspector_name', e.target.value)} required placeholder={t.phInspectorName} />
          </Field>
          <Field label={t.licenseNumber}>
            <input className={inp} value={form.license_number} onChange={e => set('license_number', e.target.value)} placeholder={t.phLicense} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
          <Field label={t.weather}>
            <input className={inp} value={form.weather} onChange={e => set('weather', e.target.value)} placeholder={t.phWeather} />
          </Field>
          <Field label={t.temperature}>
            <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden w-fit">
              <button type="button" onClick={() => adjustTemp(-1)}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold text-base border-r border-slate-300 dark:border-slate-600 transition-colors select-none">
                −
              </button>
              <span className="px-5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 min-w-[80px] text-center bg-white dark:bg-slate-800">
                {form.temperature || '72'}°F
              </span>
              <button type="button" onClick={() => adjustTemp(1)}
                className="px-3 py-2.5 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold text-base border-l border-slate-300 dark:border-slate-600 transition-colors select-none">
                +
              </button>
            </div>
          </Field>
        </div>

        <Field label={t.presentAtInspection}>
          <input className={inp} value={form.attendees} onChange={e => set('attendees', e.target.value)} placeholder={t.phAttendees} />
        </Field>

        <div className="pt-2 flex gap-3">
          <button type="submit" disabled={saving}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60">
            {saving ? t.creating : t.createInspection}
          </button>
          <a href="/" className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors text-center">
            {t.cancel}
          </a>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
