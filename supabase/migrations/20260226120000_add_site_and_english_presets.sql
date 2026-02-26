/*
  # Multi-site support: bathroom-tiles.com (US) and DeBadkamer.com (EU)

  1. Products
    - Add `source` column: 'bathroom-tiles' (US) | 'debadkamer' (EU)
    - Set existing products to source = 'debadkamer'

  2. Projects
    - Add `site` column: 'bathroom-tiles' | 'debadkamer'

  3. Leads
    - Add `site` column (leads.source already exists for form type: planner, quote_form, etc.)

  4. Style Presets
    - Add `label_en`, `description_en` for English (bathroom-tiles)
*/

-- ============================================================================
-- Products: add source for catalog separation
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS source text DEFAULT 'debadkamer';

UPDATE products SET source = 'debadkamer' WHERE source IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_source ON products(source);

-- ============================================================================
-- Projects: add site for multi-tenant filtering
-- ============================================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS site text DEFAULT 'debadkamer';

CREATE INDEX IF NOT EXISTS idx_projects_site ON projects(site);

-- ============================================================================
-- Leads: add site for multi-tenant filtering
-- ============================================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS site text DEFAULT 'debadkamer';

CREATE INDEX IF NOT EXISTS idx_leads_site ON leads(site);

-- ============================================================================
-- Style Presets: add English labels for bathroom-tiles.com
-- ============================================================================

ALTER TABLE style_presets ADD COLUMN IF NOT EXISTS label_en text;
ALTER TABLE style_presets ADD COLUMN IF NOT EXISTS description_en text;

UPDATE style_presets SET
  label_en = CASE name
    WHEN 'MODERN' THEN 'Modern Minimalist'
    WHEN 'INDUSTRIAL' THEN 'Industrial Chic'
    WHEN 'SCANDINAVIAN' THEN 'Scandinavian Hygge'
    WHEN 'LUXURY' THEN 'Hotel Luxury'
    WHEN 'CLASSIC' THEN 'Modern Classic'
    ELSE label_nl
  END,
  description_en = CASE name
    WHEN 'MODERN' THEN 'Sleek, white, and calm.'
    WHEN 'INDUSTRIAL' THEN 'Concrete, metal, and raw.'
    WHEN 'SCANDINAVIAN' THEN 'Light wood and softness.'
    WHEN 'LUXURY' THEN 'Marble and gold.'
    WHEN 'CLASSIC' THEN 'Timeless elegance.'
    ELSE description_nl
  END
WHERE label_en IS NULL OR description_en IS NULL;
