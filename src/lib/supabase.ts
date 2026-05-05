import { createClient } from '@supabase/supabase-js'
import type { Inspection, Client, Review } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getInspections(): Promise<Inspection[]> {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .order('inspection_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getInspection(id: string): Promise<Inspection | null> {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createInspection(
  fields: Partial<Omit<Inspection, 'id' | 'created_at' | 'updated_at'>>
): Promise<Inspection> {
  const { data, error } = await supabase
    .from('inspections')
    .insert([{ sections: {}, status: 'draft', ...fields }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateInspection(
  id: string,
  fields: Partial<Omit<Inspection, 'id' | 'created_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('inspections')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteInspection(id: string): Promise<void> {
  const { error } = await supabase.from('inspections').delete().eq('id', id)
  if (error) throw error
}

// ── CLIENTS ──────────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createClient_(fields: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert([{ ...fields }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateClient(id: string, fields: Partial<Omit<Client, 'id' | 'created_at'>>): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

// ── PORTAL AUTH ───────────────────────────────────────────

export async function portalLogin(email: string, password: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .ilike('email', email.trim())
    .eq('portal_password', password)
    .single()
  if (error) return null
  return data
}

export async function getInspectionsByClientId(clientId: string): Promise<Inspection[]> {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('client_id', clientId)
    .order('inspection_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ── REVIEWS ───────────────────────────────────────────────

export async function getReview(inspectionId: string): Promise<Review | null> {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('inspection_id', inspectionId)
    .single()
  return data
}

export async function getUnreadReviews(): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_read', false)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function submitReview(
  inspectionId: string,
  clientId: string,
  rating: number,
  comment: string
): Promise<void> {
  const { error } = await supabase.from('reviews').upsert({
    inspection_id: inspectionId,
    client_id: clientId,
    rating,
    comment,
    is_read: false,
  }, { onConflict: 'inspection_id' })
  if (error) throw error
}

export async function markReviewRead(reviewId: string): Promise<void> {
  await supabase.from('reviews').update({ is_read: true }).eq('id', reviewId)
}
