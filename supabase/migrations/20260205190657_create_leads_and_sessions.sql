/*
  # Create leads and session tracking tables

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `name` (text) - contact name
      - `email` (text) - contact email
      - `phone` (text) - contact phone number
      - `postcode` (text) - postal code
      - `selected_style` (text) - chosen renovation mood/style
      - `material_config` (jsonb) - selected material preferences
      - `selected_products` (jsonb) - chosen product IDs
      - `estimated_total_low` (numeric) - low end of price bandwidth
      - `estimated_total_high` (numeric) - high end of price bandwidth
      - `room_width` (numeric) - room width in meters
      - `room_length` (numeric) - room length in meters
      - `room_area` (numeric) - calculated area in m2
      - `render_url` (text) - generated visualization (base64 or URL)
      - `original_photo_url` (text) - uploaded photo reference
      - `created_at` (timestamptz) - submission timestamp
    - `session_events`
      - `id` (uuid, primary key)
      - `session_id` (uuid) - groups events for one user session
      - `event_type` (text) - type of event (e.g., 'style_selected', 'lead_submitted')
      - `event_data` (jsonb) - additional data for the event
      - `created_at` (timestamptz) - event timestamp

  2. Security
    - Enable RLS on both tables
    - Add insert policy for anonymous users (public-facing tool, no auth required)
    - Add select policy restricted to authenticated users (for admin/sales access)
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  postcode text NOT NULL DEFAULT '',
  selected_style text NOT NULL DEFAULT '',
  material_config jsonb DEFAULT '{}'::jsonb,
  selected_products jsonb DEFAULT '{}'::jsonb,
  estimated_total_low numeric DEFAULT 0,
  estimated_total_high numeric DEFAULT 0,
  room_width numeric DEFAULT 0,
  room_length numeric DEFAULT 0,
  room_area numeric DEFAULT 0,
  render_url text DEFAULT '',
  original_photo_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS session_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  event_type text NOT NULL DEFAULT '',
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log session events"
  ON session_events FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view session events"
  ON session_events FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);
