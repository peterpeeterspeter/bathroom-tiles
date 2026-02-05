/*
  # Create product catalog and style system tables

  1. New Tables
    - `style_tags`
      - `id` (serial, primary key) - auto-incrementing identifier
      - `tag` (text, unique) - style descriptor keyword (e.g., "clean lines", "warm wood tones")
      - `created_at` (timestamptz) - creation timestamp
    - `style_presets`
      - `id` (serial, primary key) - auto-incrementing identifier
      - `name` (text, unique) - internal identifier (e.g., "MODERN")
      - `label_nl` (text) - Dutch display label
      - `description_nl` (text) - Dutch description
      - `image_url` (text) - preview image URL
      - `display_order` (integer) - ordering on the UI
      - `is_active` (boolean) - whether preset is shown
      - `created_at` (timestamptz) - creation timestamp
    - `style_preset_tags`
      - `preset_id` (integer, FK to style_presets)
      - `tag_id` (integer, FK to style_tags)
      - Composite primary key on (preset_id, tag_id)
    - `products`
      - `id` (text, primary key) - SKU identifier (e.g., "GROHE-ALLURE-M")
      - `brand` (text) - manufacturer brand
      - `name` (text) - product display name
      - `category` (text) - product category (Faucet, Toilet, Shower, etc.)
      - `price` (numeric) - unit price
      - `currency` (text, default EUR) - currency code
      - `image_url` (text) - product image URL
      - `origin` (text) - country of origin
      - `is_active` (boolean, default true) - availability flag
      - `display_order` (integer, default 0) - ordering within category
      - `created_at` (timestamptz) - creation timestamp
    - `product_style_tags`
      - `product_id` (text, FK to products)
      - `tag_id` (integer, FK to style_tags)
      - Composite primary key on (product_id, tag_id)

  2. Security
    - Enable RLS on all tables
    - Anonymous users can SELECT from all tables (public-facing product catalog)
    - Only authenticated users can INSERT/UPDATE/DELETE (admin operations)

  3. Indexes
    - Index on products.category and products.is_active for efficient filtering
    - Index on style_presets.is_active for preset loading

  4. Important Notes
    - The style_tags table serves as a controlled vocabulary shared between
      AI vision analysis and product tagging
    - Products are matched to user style preferences via overlapping tags
    - Style presets provide quick-start options that map to tag sets
*/

-- Style Tags vocabulary
CREATE TABLE IF NOT EXISTS style_tags (
  id serial PRIMARY KEY,
  tag text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE style_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view style tags"
  ON style_tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage style tags"
  ON style_tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update style tags"
  ON style_tags FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete style tags"
  ON style_tags FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Style Presets
CREATE TABLE IF NOT EXISTS style_presets (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  label_nl text NOT NULL DEFAULT '',
  description_nl text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE style_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active style presets"
  ON style_presets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage style presets"
  ON style_presets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update style presets"
  ON style_presets FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete style presets"
  ON style_presets FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Style Preset Tags join table
CREATE TABLE IF NOT EXISTS style_preset_tags (
  preset_id integer NOT NULL REFERENCES style_presets(id) ON DELETE CASCADE,
  tag_id integer NOT NULL REFERENCES style_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (preset_id, tag_id)
);

ALTER TABLE style_preset_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view style preset tags"
  ON style_preset_tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage style preset tags"
  ON style_preset_tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete style preset tags"
  ON style_preset_tags FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  brand text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  image_url text NOT NULL DEFAULT '',
  origin text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Product Style Tags join table
CREATE TABLE IF NOT EXISTS product_style_tags (
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id integer NOT NULL REFERENCES style_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

ALTER TABLE product_style_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product style tags"
  ON product_style_tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage product style tags"
  ON product_style_tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete product style tags"
  ON product_style_tags FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active);
CREATE INDEX IF NOT EXISTS idx_style_presets_active ON style_presets(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_product_style_tags_tag ON product_style_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_style_preset_tags_tag ON style_preset_tags(tag_id);
