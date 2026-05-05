'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getClient, updateClient } from '@/lib/supabase'
import { useApp } from '@/contexts/AppContext'
import type { Client } from '@/types'

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useApp()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    portal_password: '',
    properties: '',
    notes: '',
  })

  useEffect(() => {
    getClient(params.id as string).then((client) => {
      if (client) {
        setForm({
          name: client.name ?? '',
          email: client.email ?? '',
          phone: client.phone ?? '',
          portal_password: client.portal_password ?? '',
          properties: client.properties ?? '',
          notes: client.notes ?? '',
        })
      }
    }).finally(() => setLoading(false))
  }, [params.id])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateClient(params.id as string, form)
      router.push('/clients')
    } catch (err) {
      console.error(err)
      alert('Failed to save client.')
      setSaving(false)
    }
  }

  const inp = 'w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <a href="/clients" className="text-sm text-green-700 dark:text-green-400 hover:underline">← {t.clients}</a>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{t.editClient}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">

        <Field label={t.clientName} required>
          <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} required placeholder={t.phClientName} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={t.clientEmail}>
            <input type="email" className={inp} value={form.email} onChange={e => set('email', e.target.value)} placeholder={t.phEmail} />
          </Field>
          <Field label={t.clientPhone}>
            <input type="tel" className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder={t.phPhone} />
          </Field>
        </div>

        <Field label={t.clientPortalPassword}>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={inp + ' pr-10'}
              value={form.portal_password}
              onChange={e => set('portal_password', e.target.value)}
              placeholder={t.phPortalPassword}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </Field>

        <Field label={t.clientProperties}>
          <textarea className={inp} rows={4} value={form.properties} onChange={e => set('properties', e.target.value)} placeholder={t.phProperties} />
          <p className="text-xs text-slate-400 mt-1">One property address per line.</p>
        </Field>

        <Field label={t.clientNotes}>
          <textarea className={inp} rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder={t.phClientNotes} />
        </Field>

        <div className="pt-2 flex gap-3">
          <button type="submit" disabled={saving}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60">
            {saving ? t.saving : t.saveClient}
          </button>
          <a href="/clients" className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors text-center">
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
