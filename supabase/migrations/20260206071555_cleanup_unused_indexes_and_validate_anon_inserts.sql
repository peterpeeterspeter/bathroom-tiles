/*
  # Cleanup Unused Indexes and Add Anonymous Insert Validation

  ## Overview
  This migration removes unused database indexes and adds validation to anonymous insert policies
  to prevent spam while maintaining legitimate public access.

  ## Changes Made

  ### 1. Drop Unused Indexes
  Removed 10 indexes that are not being used by any queries, reducing storage overhead
  and maintenance costs:

  **Products table:**
  - idx_products_category_active - Not used by queries

  **Product/Style relationship tables:**
  - idx_product_style_tags_tag - Not used by queries
  - idx_style_preset_tags_tag - Not used by queries

  **Leads table:**
  - idx_leads_source - Not used by queries
  - idx_leads_country - Not used by queries
  - idx_leads_lead_status - Not used by queries
  - idx_leads_created_at - Not used by queries

  **Articles table:**
  - idx_articles_slug - Not used (slug is already unique, uses primary index)
  - idx_articles_published - Not used by queries
  - idx_articles_category - Not used by queries

  ### 2. Improve Anonymous Insert Policies
  Updated RLS policies for anonymous inserts to include basic validation while maintaining
  public access for legitimate use cases:

  **Leads table:**
  - Previous: WITH CHECK (true) - allowed any data
  - Updated: Validates that email and postcode are provided (not empty strings)
  - Impact: Prevents spam submissions while allowing legitimate quote/contact requests

  **Session Events table:**
  - Previous: WITH CHECK (true) - allowed any data
  - Updated: Validates that session_id and event_type are provided
  - Impact: Prevents junk analytics data while allowing legitimate event tracking

  ## Important Notes
  - Anonymous users can still submit leads and log events (core functionality preserved)
  - Added validation prevents empty/spam submissions
  - Indexes can be recreated later if query patterns change
  - Auth DB connection strategy must be changed via Supabase dashboard (not SQL)

  ## Auth DB Connection Strategy
  The Auth server connection strategy issue must be resolved in the Supabase dashboard:
  1. Navigate to Database Settings > Connection Pooling
  2. Change Auth connection pool from fixed count (10) to percentage-based allocation
  3. This allows the Auth server to scale with instance size upgrades
*/

-- Drop unused indexes on products table
DROP INDEX IF EXISTS idx_products_category_active;

-- Drop unused indexes on style relationship tables
DROP INDEX IF EXISTS idx_product_style_tags_tag;
DROP INDEX IF EXISTS idx_style_preset_tags_tag;

-- Drop unused indexes on leads table
DROP INDEX IF EXISTS idx_leads_source;
DROP INDEX IF EXISTS idx_leads_country;
DROP INDEX IF EXISTS idx_leads_lead_status;
DROP INDEX IF EXISTS idx_leads_created_at;

-- Drop unused indexes on articles table
DROP INDEX IF EXISTS idx_articles_slug;
DROP INDEX IF EXISTS idx_articles_published;
DROP INDEX IF EXISTS idx_articles_category;

-- Update leads anonymous insert policy with validation
DROP POLICY IF EXISTS "Anyone can submit a lead" ON leads;
CREATE POLICY "Anyone can submit a lead"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (
    email IS NOT NULL AND 
    email != '' AND
    postcode IS NOT NULL AND
    postcode != ''
  );

-- Update session_events anonymous insert policy with validation
DROP POLICY IF EXISTS "Anyone can log session events" ON session_events;
CREATE POLICY "Anyone can log session events"
  ON session_events FOR INSERT
  TO anon
  WITH CHECK (
    session_id IS NOT NULL AND
    event_type IS NOT NULL AND
    event_type != ''
  );
