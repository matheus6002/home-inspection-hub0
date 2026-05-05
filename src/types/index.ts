export type ItemStatus = 'ok' | 'repair' | 'replace' | 'na' | ''

export interface ItemData {
  status: ItemStatus
  notes: string
}

export interface SectionData {
  [itemId: string]: ItemData
}

export interface InspectionSections {
  [sectionKey: string]: SectionData
}

export interface Inspection {
  id: string
  created_at: string
  updated_at: string
  address: string
  client_name: string
  city_state_zip: string
  inspection_date: string
  start_time: string
  end_time: string
  inspector_name: string
  license_number: string
  weather: string
  temperature: string
  attendees: string
  status: 'draft' | 'complete'
  sections: InspectionSections
  client_id: string | null
}

export interface InspectionItem {
  id: string
  label: string
}

export interface InspectionSection {
  key: string
  title: string
  items: InspectionItem[]
}

export interface Client {
  id: string
  created_at: string
  updated_at: string
  name: string
  email: string
  phone: string
  portal_password: string
  properties: string
  notes: string
}

export interface Review {
  id: string
  created_at: string
  inspection_id: string
  client_id: string
  rating: number
  comment: string
  is_read: boolean
}
