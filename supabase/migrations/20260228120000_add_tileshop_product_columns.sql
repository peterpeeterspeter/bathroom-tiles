/*
  # Add TileShop catalog columns to products

  - dimensions (text) - e.g. "2 x 6 in"
  - product_url (text) - buy/purchase link
  - images (jsonb) - array of image URLs
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images jsonb;
