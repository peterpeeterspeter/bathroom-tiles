/*
  # Seed US Tile products for bathroom-tiles.com

  Adds Tile products with source='bathroom-tiles', USD pricing.
  Tagged for style matching. Replace with real US catalog data as needed.
*/

INSERT INTO products (id, brand, name, category, price, price_low, price_high, currency, image_url, origin, is_active, display_order, price_tier, source) VALUES
  ('US-TILE-001', 'Daltile', 'Restore Grey Ceramic', 'Tile', 89, 80, 98, 'USD', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'USA', true, 1, 'budget', 'bathroom-tiles'),
  ('US-TILE-002', 'Emser', 'Pietra Grey Porcelain', 'Tile', 145, 130, 160, 'USD', 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=400', 'USA', true, 2, 'mid', 'bathroom-tiles'),
  ('US-TILE-003', 'Florida Tile', 'Calacatta Marble Look', 'Tile', 275, 248, 303, 'USD', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 'USA', true, 3, 'premium', 'bathroom-tiles'),
  ('US-TILE-004', 'Crossville', 'Concrete Look Porcelain', 'Tile', 115, 104, 127, 'USD', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400', 'USA', true, 4, 'budget', 'bathroom-tiles'),
  ('US-TILE-005', 'American Olean', 'Subway White Ceramic', 'Tile', 72, 65, 79, 'USD', 'https://images.unsplash.com/photo-1621905251918-48416c2e4b2e?w=400', 'USA', true, 5, 'budget', 'bathroom-tiles'),
  ('US-TILE-006', 'Marazzi', 'Timber Look Plank', 'Tile', 165, 149, 182, 'USD', 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=400', 'USA', true, 6, 'mid', 'bathroom-tiles'),
  ('US-TILE-007', 'Oceanside Glasstile', 'Zellige Handcrafted', 'Tile', 320, 288, 352, 'USD', 'https://images.unsplash.com/photo-1600566752355-397921139bd1?w=400', 'USA', true, 7, 'premium', 'bathroom-tiles'),
  ('US-TILE-008', 'Bedrosians', 'Cement Hexagon', 'Tile', 135, 122, 149, 'USD', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', 'USA', true, 8, 'mid', 'bathroom-tiles')
ON CONFLICT (id) DO NOTHING;

-- Link US tiles to style tags for product matching
-- Modern / clean: Daltile, American Olean
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'US-TILE-001', st.id FROM style_tags st WHERE st.tag IN ('clean lines', 'white surfaces', 'minimal ornament')
ON CONFLICT DO NOTHING;

INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'US-TILE-005', st.id FROM style_tags st WHERE st.tag IN ('clean lines', 'white surfaces', 'geometric shapes')
ON CONFLICT DO NOTHING;

-- Industrial: Crossville, Emser
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'US-TILE-004', st.id FROM style_tags st WHERE st.tag IN ('raw concrete', 'exposed metal', 'subtle patterns')
ON CONFLICT DO NOTHING;

INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'US-TILE-002', st.id FROM style_tags st WHERE st.tag IN ('muted colors', 'geometric shapes', 'neutral palette')
ON CONFLICT DO NOTHING;

-- Scandinavian: Marazzi Timber
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'US-TILE-006', st.id FROM style_tags st WHERE st.tag IN ('warm wood tones', 'natural light', 'soft textures')
ON CONFLICT DO NOTHING;

-- Luxury: Florida Tile Marble, Oceanside Zellige
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'US-TILE-003', st.id FROM style_tags st WHERE st.tag IN ('marble', 'high-gloss finishes', 'gold accents')
ON CONFLICT DO NOTHING;

INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'US-TILE-007', st.id FROM style_tags st WHERE st.tag IN ('statement fixtures', 'refined details', 'organic shapes')
ON CONFLICT DO NOTHING;

-- Classic: Bedrosians Hex
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'US-TILE-008', st.id FROM style_tags st WHERE st.tag IN ('geometric shapes', 'timeless silhouettes', 'subtle patterns')
ON CONFLICT DO NOTHING;
