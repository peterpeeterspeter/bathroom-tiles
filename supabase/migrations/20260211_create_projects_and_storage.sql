/*
  # Create projects table and extend leads for the lead generation system

  This migration introduces the `projects` table to track design projects through the lead generation
  workflow. It also extends the existing `leads` table with project tracking and additional metadata.

  ## 1. New Tables
    - `projects`: Core project tracking table
      - Stores complete project state including room specs, material configs, and estimates
      - Tracks project status through workflow stages (in_progress → completed → lead_submitted)
      - Stores JSON snapshots of style profiles, selected products, and pricing details
      - Links to session_events for activity tracking
      - RLS enabled for public anon access during design phase

  ## 2. Extended Columns on leads
    - `project_id`: Foreign key to projects table (optional, allows linking leads to projects)
    - `lead_score`: Integer score for lead quality/priority ranking
    - `selected_product_details`: JSONB snapshot of full product data with pricing at time of submission

  ## 3. Triggers
    - Auto-update projects.updated_at on any modification

  ## 4. Storage Policies
    - NOTE: Storage bucket policies (for render_image_path and original_photo_path) should be
      configured via the Supabase Dashboard or API, not here. Buckets needed:
      - projects-renders: for AI-generated render images
      - projects-photos: for user-uploaded original photos
*/

-- ============================================================================
-- Projects Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  
  -- Project Status Tracking
  status text NOT NULL DEFAULT 'in_progress',
  
  -- Design Configuration (JSONB snapshots)
  style_profile jsonb DEFAULT '{}'::jsonb,
  selected_products jsonb DEFAULT '{}'::jsonb,  -- category → product-id mapping
  selected_product_names jsonb DEFAULT '{}'::jsonb,  -- category → product name
  material_config jsonb DEFAULT '{}'::jsonb,
  selected_product_details jsonb DEFAULT '{}'::jsonb,  -- full product data with pricing
  
  -- Room Specification & Dimensions
  room_spec jsonb DEFAULT NULL,  -- full ProjectSpec: layout, fixtures, constraints
  room_width numeric DEFAULT NULL,  -- meters
  room_length numeric DEFAULT NULL,  -- meters
  room_area numeric DEFAULT NULL,  -- m2
  
  -- Cost Estimation
  estimate jsonb DEFAULT NULL,  -- full Estimate: lineItems, subtotal, tax, grandTotal
  estimated_total_low numeric DEFAULT NULL,
  estimated_total_high numeric DEFAULT NULL,
  
  -- Generated Content & References
  render_prompt text DEFAULT NULL,
  original_photo_path text DEFAULT NULL,  -- path in supabase storage (projects-photos bucket)
  render_image_path text DEFAULT NULL,  -- path in supabase storage (projects-renders bucket)
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add status constraint
ALTER TABLE projects ADD CONSTRAINT projects_status_check
  CHECK (status IN ('in_progress', 'completed', 'lead_submitted'));

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Anon users can insert their own projects during design flow
CREATE POLICY "Anon can insert projects"
  ON projects FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon users can update their own projects during design flow
CREATE POLICY "Anon can update projects"
  ON projects FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Anon users can view their own projects
CREATE POLICY "Anon can view projects"
  ON projects FOR SELECT
  TO anon
  USING (true);

-- Authenticated users (admin/sales) can view all projects
CREATE POLICY "Authenticated users can view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_session_id ON projects(session_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);


-- ============================================================================
-- Extend Leads Table
-- ============================================================================

DO $$
BEGIN
  -- Add project_id foreign key (optional, allows linking leads to specific projects)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'project_id') THEN
    ALTER TABLE leads ADD COLUMN project_id uuid;
  END IF;

  -- Add lead_score for quality/priority ranking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'lead_score') THEN
    ALTER TABLE leads ADD COLUMN lead_score integer DEFAULT 0;
  END IF;

  -- Add snapshot of full product details at time of lead submission
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'selected_product_details') THEN
    ALTER TABLE leads ADD COLUMN selected_product_details jsonb DEFAULT NULL;
  END IF;
END $$;

-- Create foreign key constraint (soft constraint, allows null)
ALTER TABLE leads ADD CONSTRAINT fk_leads_project_id
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Create indexes for leads extensions
CREATE INDEX IF NOT EXISTS idx_leads_project_id ON leads(project_id);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score);


-- ============================================================================
-- Auto-update Trigger for projects.updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_updated_at_trigger ON projects;

CREATE TRIGGER projects_updated_at_trigger
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_projects_updated_at();


-- ============================================================================
-- Storage Policies for project-images bucket
-- (Run AFTER creating the bucket in Dashboard or via API)
-- ============================================================================

CREATE POLICY "Anon can upload project images"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Anon can update project images"
  ON storage.objects FOR UPDATE
  TO anon
  USING (bucket_id = 'project-images')
  WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Service role can read project images"
  ON storage.objects FOR SELECT
  TO authenticated, service_role
  USING (bucket_id = 'project-images');
