/*
  # Create articles table for blog/advice content

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `title` (text, not null)
      - `meta_description` (text) - SEO meta description
      - `content` (text) - HTML content
      - `excerpt` (text) - short preview text
      - `category` (text) - kosten, inspiratie, tips
      - `image_url` (text) - hero image
      - `is_published` (boolean, default false)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `articles` table
    - Public read access for published articles only
    - Authenticated users can manage articles
*/

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  meta_description text DEFAULT '',
  content text DEFAULT '',
  excerpt text DEFAULT '',
  category text DEFAULT 'tips',
  image_url text DEFAULT '',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published articles"
  ON articles
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can insert articles"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles"
  ON articles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete articles"
  ON articles
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
