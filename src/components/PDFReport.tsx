'use client'

import dynamic from 'next/dynamic'
import { Document, Page, Text, View, StyleSheet, Line, Svg } from '@react-pdf/renderer'
import type { Inspection } from '@/types'
import { SECTIONS } from '@/lib/sections'
import type { ItemStatus } from '@/types'

const GREEN = '#166534'
const GREEN_LIGHT = '#dcfce7'
const GREEN_MID = '#22c55e'
const YELLOW = '#b45309'
const YELLOW_LIGHT = '#fef9c3'
const RED = '#dc2626'
const RED_LIGHT = '#fee2e2'
const GRAY = '#94a3b8'
const GRAY_LIGHT = '#f8fafc'
const WHITE = '#ffffff'
const DARK = '#1e293b'
const SLATE = '#64748b'

const STATUS_MAP: Record<string, { color: string; bg: string; label: string; dot: string }> = {
  ok:      { color: GREEN,  bg: GREEN_LIGHT,  label: 'OK',               dot: '✓' },
  repair:  { color: YELLOW, bg: YELLOW_LIGHT, label: 'Needs Repair',     dot: '⚠' },
  replace: { color: RED,    bg: RED_LIGHT,    label: 'Needs Replacement', dot: '✗' },
  na:      { color: GRAY,   bg: '#f1f5f9',    label: 'N/A',              dot: '—' },
}

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: DARK, backgroundColor: WHITE },
  // Cover header
  coverHeader: { backgroundColor: GREEN, padding: '32 40 24 40' },
  logoCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: WHITE, marginBottom: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: GREEN, fontFamily: 'Helvetica-Bold', fontSize: 14 },
  company: { color: WHITE, fontFamily: 'Helvetica-Bold', fontSize: 18, letterSpacing: 0.5 },
  tagline: { color: '#bbf7d0', fontSize: 10, marginTop: 3, letterSpacing: 1 },
  // Cover body
  coverBody: { padding: '24 40 32 40' },
  reportTitle: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: GREEN, marginBottom: 20, borderBottom: `2pt solid ${GREEN}`, paddingBottom: 8 },
  metaRow: { flexDirection: 'row', marginBottom: 7 },
  metaLabel: { fontFamily: 'Helvetica-Bold', width: 130, color: SLATE, fontSize: 9 },
  metaValue: { flex: 1, color: DARK, fontSize: 9 },
  divider: { borderBottom: `1pt solid #e2e8f0`, marginVertical: 14 },
  // Summary boxes
  summaryRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  summaryBox: { flex: 1, padding: '8 10', borderRadius: 6, alignItems: 'center' },
  summaryNum: { fontFamily: 'Helvetica-Bold', fontSize: 18 },
  summaryLabel: { fontSize: 8, marginTop: 2 },
  // TOC
  tocTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: GREEN, marginBottom: 8 },
  tocRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, paddingBottom: 4, borderBottom: `0.5pt solid #e2e8f0` },
  tocSectionName: { color: DARK, fontSize: 9 },
  tocStatus: { fontSize: 8 },
  // Section pages
  sectionHeader: { backgroundColor: GREEN, padding: '10 16', flexDirection: 'row', alignItems: 'center', marginBottom: 0 },
  sectionTitle: { color: WHITE, fontFamily: 'Helvetica-Bold', fontSize: 12 },
  // Table
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#f0fdf4', borderBottom: `1pt solid #bbf7d0`, padding: '5 16' },
  tableHeaderCell: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: GREEN },
  tableRow: { flexDirection: 'row', padding: '6 16', borderBottom: `0.5pt solid #f1f5f9` },
  tableRowAlt: { flexDirection: 'row', padding: '6 16', borderBottom: `0.5pt solid #f1f5f9`, backgroundColor: GRAY_LIGHT },
  colItem: { flex: 1.8, paddingRight: 8, fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: DARK },
  colStatus: { width: 90, paddingRight: 8 },
  colNotes: { flex: 2, fontSize: 8, color: SLATE },
  badge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, fontSize: 7.5, fontFamily: 'Helvetica-Bold' },
  // Footer
  footer: { position: 'absolute', bottom: 18, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, color: GRAY },
})

function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function fmtTime(t: string) {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

function sectionSummaryStatus(sec: Inspection['sections'], key: string) {
  const data = sec[key] ?? {}
  const items = Object.values(data)
  if (items.some(i => i.status === 'replace')) return 'replace'
  if (items.some(i => i.status === 'repair')) return 'repair'
  if (items.length > 0 && items.every(i => i.status === 'ok' || i.status === 'na')) return 'ok'
  return ''
}

export function InspectionPDF({ inspection }: { inspection: Inspection }) {
  const sec = inspection.sections ?? {}

  const allItems = SECTIONS.flatMap(s => s.items.map(item => sec[s.key]?.[item.id]))
  const okCount = allItems.filter(i => i?.status === 'ok').length
  const repairCount = allItems.filter(i => i?.status === 'repair').length
  const replaceCount = allItems.filter(i => i?.status === 'replace').length

  return (
    <Document title={`Inspection – ${inspection.address}`} author="Navigator Home Inspections LLC">

      {/* ── COVER PAGE ── */}
      <Page size="LETTER" style={s.page}>
        {/* Green header */}
        <View style={s.coverHeader}>
          <View style={s.logoCircle}>
            <Text style={s.logoText}>NHI</Text>
          </View>
          <Text style={s.company}>NAVIGATOR HOME INSPECTIONS LLC</Text>
          <Text style={s.tagline}>GUIDING YOU HOME</Text>
        </View>

        <View style={s.coverBody}>
          <Text style={s.reportTitle}>HOME INSPECTION REPORT</Text>

          {/* Property + Inspector info */}
          {([
            ['Property Address', inspection.address],
            ['City, State, Zip', inspection.city_state_zip],
            ['Client Name', inspection.client_name],
            ['Date of Inspection', fmtDate(inspection.inspection_date)],
            ['Inspection Time', `${fmtTime(inspection.start_time)} – ${fmtTime(inspection.end_time)}`],
            ['Weather / Temperature', [inspection.weather, inspection.temperature].filter(Boolean).join('  ')],
            ['Inspector Name', inspection.inspector_name],
            ['License Number', inspection.license_number],
            ['Present at Inspection', inspection.attendees],
          ] as [string, string][]).map(([label, value]) => value ? (
            <View key={label} style={s.metaRow}>
              <Text style={s.metaLabel}>{label}:</Text>
              <Text style={s.metaValue}>{value}</Text>
            </View>
          ) : null)}

          {/* Summary */}
          <View style={s.summaryRow}>
            <View style={[s.summaryBox, { backgroundColor: GREEN_LIGHT }]}>
              <Text style={[s.summaryNum, { color: GREEN }]}>{okCount}</Text>
              <Text style={[s.summaryLabel, { color: GREEN }]}>OK</Text>
            </View>
            <View style={[s.summaryBox, { backgroundColor: YELLOW_LIGHT }]}>
              <Text style={[s.summaryNum, { color: YELLOW }]}>{repairCount}</Text>
              <Text style={[s.summaryLabel, { color: YELLOW }]}>Needs Repair</Text>
            </View>
            <View style={[s.summaryBox, { backgroundColor: RED_LIGHT }]}>
              <Text style={[s.summaryNum, { color: RED }]}>{replaceCount}</Text>
              <Text style={[s.summaryLabel, { color: RED }]}>Needs Replacement</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Table of Contents */}
          <Text style={s.tocTitle}>TABLE OF CONTENTS</Text>
          {SECTIONS.map((sec2, i) => {
            const sum = sectionSummaryStatus(sec, sec2.key)
            const st = sum ? STATUS_MAP[sum] : null
            return (
              <View key={sec2.key} style={s.tocRow}>
                <Text style={s.tocSectionName}>{i + 1}. {sec2.title}</Text>
                {st
                  ? <Text style={[s.tocStatus, { color: st.color }]}>{st.dot} {st.label}</Text>
                  : <Text style={[s.tocStatus, { color: GRAY }]}>Not assessed</Text>
                }
              </View>
            )
          })}
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Navigator Home Inspections LLC — Guiding You Home</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* ── ONE PAGE PER SECTION ── */}
      {SECTIONS.map((section) => {
        const sData = sec[section.key] ?? {}
        return (
          <Page key={section.key} size="LETTER" style={s.page}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>{section.title}</Text>
            </View>

            {/* Column headers */}
            <View style={s.tableHeaderRow}>
              <Text style={[s.tableHeaderCell, { flex: 1.8 }]}>ITEM</Text>
              <Text style={[s.tableHeaderCell, { width: 90 }]}>STATUS</Text>
              <Text style={[s.tableHeaderCell, { flex: 2 }]}>NOTES / OBSERVATIONS</Text>
            </View>

            {section.items.map((item, idx) => {
              const d = sData[item.id]
              const status = d?.status as ItemStatus | undefined
              const st = status && STATUS_MAP[status] ? STATUS_MAP[status] : null
              return (
                <View key={item.id} style={idx % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={s.colItem}>{item.label}</Text>
                  <View style={s.colStatus}>
                    {st ? (
                      <View style={[s.badge, { backgroundColor: st.bg }]}>
                        <Text style={{ color: st.color }}>{st.dot} {st.label}</Text>
                      </View>
                    ) : (
                      <Text style={{ color: '#cbd5e1', fontSize: 8 }}>—</Text>
                    )}
                  </View>
                  <Text style={s.colNotes}>{d?.notes ?? ''}</Text>
                </View>
              )
            })}

            <View style={s.footer} fixed>
              <Text style={s.footerText}>{inspection.address} — {fmtDate(inspection.inspection_date)}</Text>
              <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </Page>
        )
      })}
    </Document>
  )
}

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <button className="bg-green-700 text-white font-semibold px-5 py-2.5 rounded-lg opacity-70 flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Preparing PDF…
      </button>
    ),
  }
)

export function DownloadPDFButton({ inspection }: { inspection: Inspection }) {
  const filename = `navigator-inspection-${inspection.address.replace(/\s+/g, '-').toLowerCase()}-${inspection.inspection_date || 'report'}.pdf`
  return (
    <PDFDownloadLink document={<InspectionPDF inspection={inspection} />} fileName={filename}>
      {({ loading }) => (
        <button className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {loading ? 'Generating PDF…' : 'Download PDF Report'}
        </button>
      )}
    </PDFDownloadLink>
  )
}
