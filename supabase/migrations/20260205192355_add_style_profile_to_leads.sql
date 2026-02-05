/*
  # Add style_profile JSONB column to leads table

  1. Modified Tables
    - `leads`
      - Added `style_profile` (jsonb) - stores the full StyleProfile object
        including tags with weights, summary text, source type, and reference image URLs
      - Added `reference_images` (text array) - stores user's uploaded inspiration image URLs

  2. Important Notes
    - The existing `selected_style` column is kept for backward compatibility
    - New leads will populate `style_profile` with the richer tag-based profile
    - This enables analytics on style preferences at tag granularity
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'style_profile'
  ) THEN
    ALTER TABLE leads ADD COLUMN style_profile jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'reference_images'
  ) THEN
    ALTER TABLE leads ADD COLUMN reference_images text[] DEFAULT '{}';
  END IF;
END $$;
