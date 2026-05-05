-- Run this in your Supabase SQL editor to add client management

CREATE TABLE IF NOT EXISTS clients (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  name             TEXT NOT NULL DEFAULT '',
  email            TEXT DEFAULT '',
  phone            TEXT DEFAULT '',
  portal_password  TEXT DEFAULT '',
  properties       TEXT DEFAULT '',
  notes            TEXT DEFAULT ''
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON clients FOR ALL USING (true) WITH CHECK (true);
