/*
  # Add tile facet columns for categorization

  - applications (jsonb) - ["Wall"], ["Floor"], ["Wall","Floor"]
  - material (text) - Porcelain, Ceramic, etc.
  - finish (text) - Gloss, Matte, etc.
  - shape (text) - Subway, Hexagon, etc.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS applications jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS finish text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shape text;
