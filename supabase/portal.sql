-- Run this in Supabase SQL Editor

-- Link inspections to clients
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

-- Reviews left by clients
CREATE TABLE IF NOT EXISTS reviews (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
  client_id     UUID REFERENCES clients(id),
  rating        INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT DEFAULT '',
  is_read       BOOLEAN DEFAULT false
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reviews FOR ALL USING (true) WITH CHECK (true);
