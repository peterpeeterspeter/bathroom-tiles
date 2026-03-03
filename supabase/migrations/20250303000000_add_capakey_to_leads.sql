-- Add optional capakey (kadastraal perceelnummer) column for Flanders leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS capakey text DEFAULT '';
