-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS inspections (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  address         TEXT NOT NULL DEFAULT '',
  client_name     TEXT NOT NULL DEFAULT '',
  city_state_zip  TEXT NOT NULL DEFAULT '',
  inspection_date DATE,
  start_time      TEXT DEFAULT '',
  end_time        TEXT DEFAULT '',
  inspector_name  TEXT NOT NULL DEFAULT '',
  license_number  TEXT DEFAULT '',
  weather         TEXT DEFAULT '',
  temperature     TEXT DEFAULT '',
  attendees       TEXT DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'draft',
  sections        JSONB NOT NULL DEFAULT '{}'
);

-- Enable Row Level Security (optional — remove if you want no auth)
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (solo inspector, no auth required)
CREATE POLICY "Allow all" ON inspections FOR ALL USING (true) WITH CHECK (true);
