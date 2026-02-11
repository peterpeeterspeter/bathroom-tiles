/*
  # Upgrade products table for price ranges, tiers, and Storage-backed images

  1. New Columns
    - `price_low` (numeric) - low end of price range
    - `price_high` (numeric) - high end of price range
    - `price_tier` (text) - budget | mid | premium
    - `catalog_image_path` (text) - Supabase Storage path for catalog image
    - `render_image_path` (text) - Supabase Storage path for render reference image
    - `description` (text) - short product description for AI context

  2. Backfill Logic
    - price_low = price * 0.9, price_high = price * 1.1
    - price_tier inferred from price (>=1500 premium, <=200 budget, else mid)

  3. New Index
    - (category, price_tier, is_active) for filtered queries
*/

-- Add new columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_low numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_high numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_tier text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS catalog_image_path text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS render_image_path text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description text;

-- Backfill price_low and price_high from existing price
UPDATE products
SET
  price_low = ROUND(price * 0.9, 2),
  price_high = ROUND(price * 1.1, 2)
WHERE price_low IS NULL AND price > 0;

-- Infer price_tier from price
UPDATE products
SET price_tier = CASE
  WHEN price >= 1500 THEN 'premium'
  WHEN price <= 200 THEN 'budget'
  ELSE 'mid'
END
WHERE price_tier IS NULL;

-- Add CHECK constraint for price_tier
ALTER TABLE products ADD CONSTRAINT products_price_tier_check
  CHECK (price_tier IN ('budget', 'mid', 'premium'));

-- Add composite index for filtered queries
CREATE INDEX IF NOT EXISTS idx_products_category_tier_active
  ON products(category, price_tier, is_active);
