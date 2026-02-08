/*
  # Extend leads table for lead generation

  1. Modified Tables
    - `leads`
      - `source` (text, default 'website') - identifies lead origin: planner, quote_form, inline_form
      - `country` (text, default 'NL') - NL or BE
      - `renovation_type` (text, nullable) - full, partial, new_build
      - `bathroom_size` (text, nullable) - small, medium, large
      - `preferred_timeline` (text, nullable) - 1_month, 1_3_months, 3_6_months, exploring
      - `lead_status` (text, default 'new') - new, contacted, qualified, sold, rejected
      - `sold_to` (text, nullable) - contractor identifier
      - `sold_at` (timestamptz, nullable) - when sold
      - `lead_price` (numeric, nullable) - price per lead
      - `utm_source` (text, nullable) - traffic source
      - `utm_medium` (text, nullable)
      - `utm_campaign` (text, nullable)

  2. Important Notes
    - All new columns are nullable or have defaults to avoid breaking existing inserts
    - Supports per-lead selling model with status tracking
    - UTM columns enable ROI tracking per traffic source
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'source') THEN
    ALTER TABLE leads ADD COLUMN source text DEFAULT 'website';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'country') THEN
    ALTER TABLE leads ADD COLUMN country text DEFAULT 'NL';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'renovation_type') THEN
    ALTER TABLE leads ADD COLUMN renovation_type text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'bathroom_size') THEN
    ALTER TABLE leads ADD COLUMN bathroom_size text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'preferred_timeline') THEN
    ALTER TABLE leads ADD COLUMN preferred_timeline text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lead_status') THEN
    ALTER TABLE leads ADD COLUMN lead_status text DEFAULT 'new';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'sold_to') THEN
    ALTER TABLE leads ADD COLUMN sold_to text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'sold_at') THEN
    ALTER TABLE leads ADD COLUMN sold_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lead_price') THEN
    ALTER TABLE leads ADD COLUMN lead_price numeric;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'utm_source') THEN
    ALTER TABLE leads ADD COLUMN utm_source text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'utm_medium') THEN
    ALTER TABLE leads ADD COLUMN utm_medium text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'utm_campaign') THEN
    ALTER TABLE leads ADD COLUMN utm_campaign text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads(country);
CREATE INDEX IF NOT EXISTS idx_leads_lead_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
