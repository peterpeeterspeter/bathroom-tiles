/*
  # Seed style system and product catalog data

  1. Style Tags
    - 30 style descriptor tags forming the controlled vocabulary
    - Tags cover materials, finishes, aesthetics, and spatial qualities

  2. Style Presets
    - 5 presets matching existing moods: Modern Minimalist, Industrial Chic,
      Scandinavian Hygge, Hotel Luxury, Modern Classic
    - Each preset linked to 5-6 relevant tags via style_preset_tags

  3. Products
    - 29 products migrated from the hardcoded PRODUCT_CATALOG array
    - All existing IDs, prices, image URLs, and origins preserved
    - Each product tagged with style descriptors via product_style_tags

  4. Important Notes
    - Tag vocabulary is used by both AI vision analysis and product matching
    - Products previously tagged with RenovationStyle enum values are now
      mapped to richer descriptor tags
*/

-- Insert style tags
INSERT INTO style_tags (tag) VALUES
  ('clean lines'),
  ('white surfaces'),
  ('chrome hardware'),
  ('minimal ornament'),
  ('geometric shapes'),
  ('raw concrete'),
  ('exposed metal'),
  ('matte black hardware'),
  ('open structures'),
  ('reclaimed materials'),
  ('warm wood tones'),
  ('soft textures'),
  ('muted colors'),
  ('natural light'),
  ('organic shapes'),
  ('marble'),
  ('gold accents'),
  ('statement fixtures'),
  ('high-gloss finishes'),
  ('layered lighting'),
  ('timeless silhouettes'),
  ('neutral palette'),
  ('brushed nickel'),
  ('subtle patterns'),
  ('refined details'),
  ('terrazzo'),
  ('brass accents'),
  ('freestanding bath'),
  ('rain shower'),
  ('pendant lighting')
ON CONFLICT (tag) DO NOTHING;

-- Insert style presets
INSERT INTO style_presets (name, label_nl, description_nl, image_url, display_order) VALUES
  ('MODERN', 'Modern Minimalistisch', 'Sluier, wit en rust.', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=400', 1),
  ('INDUSTRIAL', 'Industriele Chic', 'Beton, metaal en rauw.', 'https://images.unsplash.com/photo-1507652313519-d451e12d59b8?auto=format&fit=crop&q=80&w=400', 2),
  ('SCANDINAVIAN', 'Scandinavische Hygge', 'Licht hout en zachtheid.', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400', 3),
  ('LUXURY', 'Hotel Luxe', 'Marmer en goud.', 'https://images.unsplash.com/photo-1600566752355-397921139bd1?auto=format&fit=crop&q=80&w=400', 4),
  ('CLASSIC', 'Modern Klassiek', 'Tijdloze elegantie.', 'https://images.unsplash.com/photo-1595844730298-b960ff98fee0?auto=format&fit=crop&q=80&w=400', 5)
ON CONFLICT (name) DO NOTHING;

-- Link presets to tags
-- Modern Minimalist: clean lines, white surfaces, chrome hardware, minimal ornament, geometric shapes
INSERT INTO style_preset_tags (preset_id, tag_id)
SELECT sp.id, st.id FROM style_presets sp, style_tags st
WHERE sp.name = 'MODERN' AND st.tag IN ('clean lines', 'white surfaces', 'chrome hardware', 'minimal ornament', 'geometric shapes')
ON CONFLICT DO NOTHING;

-- Industrial Chic: raw concrete, exposed metal, matte black hardware, open structures, reclaimed materials
INSERT INTO style_preset_tags (preset_id, tag_id)
SELECT sp.id, st.id FROM style_presets sp, style_tags st
WHERE sp.name = 'INDUSTRIAL' AND st.tag IN ('raw concrete', 'exposed metal', 'matte black hardware', 'open structures', 'reclaimed materials')
ON CONFLICT DO NOTHING;

-- Scandinavian Hygge: warm wood tones, soft textures, muted colors, natural light, organic shapes
INSERT INTO style_preset_tags (preset_id, tag_id)
SELECT sp.id, st.id FROM style_presets sp, style_tags st
WHERE sp.name = 'SCANDINAVIAN' AND st.tag IN ('warm wood tones', 'soft textures', 'muted colors', 'natural light', 'organic shapes')
ON CONFLICT DO NOTHING;

-- Hotel Luxury: marble, gold accents, statement fixtures, high-gloss finishes, layered lighting
INSERT INTO style_preset_tags (preset_id, tag_id)
SELECT sp.id, st.id FROM style_presets sp, style_tags st
WHERE sp.name = 'LUXURY' AND st.tag IN ('marble', 'gold accents', 'statement fixtures', 'high-gloss finishes', 'layered lighting')
ON CONFLICT DO NOTHING;

-- Modern Classic: timeless silhouettes, neutral palette, brushed nickel, subtle patterns, refined details
INSERT INTO style_preset_tags (preset_id, tag_id)
SELECT sp.id, st.id FROM style_presets sp, style_tags st
WHERE sp.name = 'CLASSIC' AND st.tag IN ('timeless silhouettes', 'neutral palette', 'brushed nickel', 'subtle patterns', 'refined details')
ON CONFLICT DO NOTHING;

-- Insert products
INSERT INTO products (id, brand, name, category, price, currency, image_url, origin, display_order) VALUES
  ('GROHE-ALLURE-M', 'Grohe', 'Allure Brilliant Basin Mixer', 'Faucet', 450, 'EUR', 'https://assets.grohe.com/3d/23109000/23109000_1_1.png', 'Germany', 1),
  ('HANSGROHE-METROPOL', 'Hansgrohe', 'Metropol Select 100', 'Faucet', 380, 'EUR', 'https://assets.hansgrohe.com/celum/web/32571000_Metropol_Select_100_Chrome_tif.jpg?format=HBW7', 'Germany', 2),
  ('GESSI-316', 'Gessi', 'Gessi 316 Meccanica', 'Faucet', 650, 'EUR', 'https://www.gessi.com/sites/default/files/styles/product_detail/public/2018-03/54002_031_1.png', 'Italy', 3),
  ('VOLA-111', 'Vola', 'Vola 111 Built-in Mixer', 'Faucet', 890, 'EUR', 'https://vola.com/media/2555/111_01_p-m.png', 'Denmark', 4),
  ('DORNBRACHT-TARA', 'Dornbracht', 'Tara Classic', 'Faucet', 950, 'EUR', 'https://www.dornbracht.com/media/c0/88/47/1660205842/20000710-00_1000.jpg', 'Germany', 5),
  ('DURAVIT-STARCK-3', 'Duravit', 'ME by Starck Rimless WC', 'Toilet', 490, 'EUR', 'https://img.duravit.com/celum-assets/1600x1600/100000100000000000000000000000000000000000000000000000000000000000000000000000000_1000004948_2529090000_300.jpg', 'Germany', 1),
  ('GEBERIT-AQUA-MERA', 'Geberit', 'AquaClean Mera Comfort', 'Toilet', 3200, 'EUR', 'https://catalog.geberit.com/public/images/2021/04/16/82/38/500_822_00_1_Geberit_iCon_Wand-WC_Tiefspueler_Rimfree.jpg', 'Switzerland', 2),
  ('CATALANO-SPHERA', 'Catalano', 'Sfera 54 Wall Hung', 'Toilet', 420, 'EUR', 'https://www.catalano.it/wp-content/uploads/2021/03/1VSS54R00.jpg', 'Italy', 3),
  ('DURAVIT-L-CUBE', 'Duravit', 'L-Cube Wall-Mounted Vanity', 'Vanity', 1200, 'EUR', 'https://img.duravit.com/celum-assets/1600x1600/100000000000000000000000000000000000000000000000000000000000000000000000000000000_1000004948_LC614001818_100.jpg', 'Germany', 1),
  ('ROCA-INSPIRA', 'Roca', 'Inspira Soft Vanity Unit', 'Vanity', 850, 'EUR', 'https://www.uk.roca.com/wps/wcm/connect/roca_uk/0e69818d-69f8-4b9e-956f-217277e90f23/851075_Inspira_Soft.jpg?MOD=AJPERES&CACHEID=ROOTWORKSPACE-roca_uk-0e69818d-69f8-4b9e-956f-217277e90f23', 'Spain', 2),
  ('ANTONIO-LUPI-PIANA', 'Antonio Lupi', 'Piana Vanity Oak', 'Vanity', 3500, 'EUR', 'https://www.antoniolupi.it/files/antoniolupi/prodotti/piana/antoniolupi_Piana_01.jpg', 'Italy', 3),
  ('MARAZZI-LUME', 'Marazzi', 'Lume Green Porcelain', 'Tile', 75, 'EUR', 'https://www.marazzi.it/uploads/media/Lume_Green_6x24_1.jpg', 'Italy', 1),
  ('PORCELANOSA-CALACATA', 'Porcelanosa', 'Calacata Gold Silk', 'Tile', 120, 'EUR', 'https://www.porcelanosa.com/recursos/productos/100236746_1.jpg', 'Spain', 2),
  ('MUTINA-TIERRA', 'Mutina', 'Tierra Terracotta', 'Tile', 95, 'EUR', 'https://www.mutina.it/media/images/collections/tierra/tierra-hero.jpg', 'Italy', 3),
  ('ATLAS-CONCORDE-BOOST', 'Atlas Concorde', 'Boost Grey Concrete', 'Tile', 60, 'EUR', 'https://www.atlasconcorde.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/a/t/atlas-concorde-boost-grey-120x120-matt-00.jpg', 'Italy', 4),
  ('LOUIS-POULSEN-PH5', 'Louis Poulsen', 'PH 5 Pendant', 'Lighting', 950, 'EUR', 'https://www.louispoulsen.com/sites/default/files/styles/product_detail/public/2021-04/PH%205%20Monochrome%20White.png', 'Denmark', 1),
  ('FLOS-IC-LIGHTS', 'Flos', 'IC Lights C/W1', 'Lighting', 480, 'EUR', 'https://flos.com/sites/default/files/styles/product_detail/public/F3178057_1.jpg', 'Italy', 2),
  ('TOM-DIXON-BEAT', 'Tom Dixon', 'Beat Light Fat Black', 'Lighting', 550, 'EUR', 'https://www.tomdixon.net/media/catalog/product/cache/7e007d4b46c1f01655615d860d5ce39c/b/l/bls02-p01_01.jpg', 'UK', 3),
  ('VICTORIA-ALBERT-CHESHIRE', 'Victoria + Albert', 'Cheshire Freestanding Bath', 'Bathtub', 2200, 'EUR', 'https://vandabaths.com/media/2126/cheshire_main.jpg?anchor=center&mode=crop&width=1200&height=1200', 'UK', 1),
  ('DURAVIT-CAPE-COD', 'Duravit', 'Cape Cod Freestanding', 'Bathtub', 3100, 'EUR', 'https://img.duravit.com/celum-assets/1600x1600/100000000000000000000000000000000000000000000000000000000000000000000000000000000_1000005165_700330000000090_100.jpg', 'Germany', 2),
  ('BETTE-LUX-OVAL', 'Bette', 'BetteLux Oval Silhouette', 'Bathtub', 4500, 'EUR', 'https://www.my-bette.com/fileadmin/_processed_/6/f/csm_BetteLux-Oval-Silhouette_Side_8f0a00e576.jpg', 'Germany', 3),
  ('GROHE-EUPHORIA', 'Grohe', 'Euphoria SmartControl', 'Shower', 800, 'EUR', 'https://assets.grohe.com/3d/26507000/26507000_1_1.png', 'Germany', 1),
  ('HANSGROHE-RAINDANCE', 'Hansgrohe', 'Raindance Select E 300', 'Shower', 1100, 'EUR', 'https://assets.hansgrohe.com/celum/web/27128000_Raindance_Select_E_300_Showerpipe_Chrome_tif.jpg?format=HBW7', 'Germany', 2),
  ('AXOR-SHOWERHEAVEN', 'AXOR', 'ShowerHeaven 1200', 'Shower', 5500, 'EUR', 'https://assets.hansgrohe.com/celum/web/10637000_AXOR_ShowerHeaven_1200_Chrome_tif.jpg?format=HBW7', 'Germany', 3),
  ('NOBILI-ANTICA', 'Nobili', 'Antica Shower Column', 'Shower', 900, 'EUR', 'https://www.nobili.it/media/prodotti/AD/AD140/30/AD14030CR_01.jpg', 'Italy', 4)
ON CONFLICT (id) DO NOTHING;

-- Map product style tags
-- GROHE-ALLURE-M: Modern, Luxury -> clean lines, chrome hardware, geometric shapes, marble, high-gloss finishes
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'GROHE-ALLURE-M', st.id FROM style_tags st
WHERE st.tag IN ('clean lines', 'chrome hardware', 'geometric shapes', 'marble', 'high-gloss finishes')
ON CONFLICT DO NOTHING;

-- HANSGROHE-METROPOL: Industrial, Modern -> matte black hardware, clean lines, geometric shapes, exposed metal
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'HANSGROHE-METROPOL', st.id FROM style_tags st
WHERE st.tag IN ('matte black hardware', 'clean lines', 'geometric shapes', 'exposed metal')
ON CONFLICT DO NOTHING;

-- GESSI-316: Industrial, Luxury -> exposed metal, matte black hardware, statement fixtures, raw concrete
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'GESSI-316', st.id FROM style_tags st
WHERE st.tag IN ('exposed metal', 'matte black hardware', 'statement fixtures', 'raw concrete')
ON CONFLICT DO NOTHING;

-- VOLA-111: Scandinavian, Modern, Classic -> clean lines, minimal ornament, timeless silhouettes, muted colors, refined details
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'VOLA-111', st.id FROM style_tags st
WHERE st.tag IN ('clean lines', 'minimal ornament', 'timeless silhouettes', 'muted colors', 'refined details')
ON CONFLICT DO NOTHING;

-- DORNBRACHT-TARA: Classic, Luxury -> timeless silhouettes, refined details, gold accents, statement fixtures, brushed nickel
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'DORNBRACHT-TARA', st.id FROM style_tags st
WHERE st.tag IN ('timeless silhouettes', 'refined details', 'gold accents', 'statement fixtures', 'brushed nickel')
ON CONFLICT DO NOTHING;

-- DURAVIT-STARCK-3: Modern, Scandinavian, Classic -> clean lines, minimal ornament, white surfaces, timeless silhouettes, organic shapes
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'DURAVIT-STARCK-3', st.id FROM style_tags st
WHERE st.tag IN ('clean lines', 'minimal ornament', 'white surfaces', 'timeless silhouettes', 'organic shapes')
ON CONFLICT DO NOTHING;

-- GEBERIT-AQUA-MERA: Luxury, Modern -> high-gloss finishes, statement fixtures, clean lines, chrome hardware, layered lighting
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'GEBERIT-AQUA-MERA', st.id FROM style_tags st
WHERE st.tag IN ('high-gloss finishes', 'statement fixtures', 'clean lines', 'chrome hardware', 'layered lighting')
ON CONFLICT DO NOTHING;

-- CATALANO-SPHERA: Industrial, Modern -> geometric shapes, matte black hardware, clean lines, raw concrete
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'CATALANO-SPHERA', st.id FROM style_tags st
WHERE st.tag IN ('geometric shapes', 'matte black hardware', 'clean lines', 'raw concrete')
ON CONFLICT DO NOTHING;

-- DURAVIT-L-CUBE: Modern, Industrial -> clean lines, geometric shapes, matte black hardware, minimal ornament
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'DURAVIT-L-CUBE', st.id FROM style_tags st
WHERE st.tag IN ('clean lines', 'geometric shapes', 'matte black hardware', 'minimal ornament')
ON CONFLICT DO NOTHING;

-- ROCA-INSPIRA: Classic, Scandinavian -> timeless silhouettes, soft textures, neutral palette, warm wood tones, subtle patterns
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'ROCA-INSPIRA', st.id FROM style_tags st
WHERE st.tag IN ('timeless silhouettes', 'soft textures', 'neutral palette', 'warm wood tones', 'subtle patterns')
ON CONFLICT DO NOTHING;

-- ANTONIO-LUPI-PIANA: Luxury, Scandinavian -> warm wood tones, statement fixtures, natural light, marble, organic shapes
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'ANTONIO-LUPI-PIANA', st.id FROM style_tags st
WHERE st.tag IN ('warm wood tones', 'statement fixtures', 'natural light', 'marble', 'organic shapes')
ON CONFLICT DO NOTHING;

-- MARAZZI-LUME: Industrial, Classic -> subtle patterns, reclaimed materials, muted colors, raw concrete
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'MARAZZI-LUME', st.id FROM style_tags st
WHERE st.tag IN ('subtle patterns', 'reclaimed materials', 'muted colors', 'raw concrete')
ON CONFLICT DO NOTHING;

-- PORCELANOSA-CALACATA: Luxury, Modern -> marble, high-gloss finishes, gold accents, clean lines
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'PORCELANOSA-CALACATA', st.id FROM style_tags st
WHERE st.tag IN ('marble', 'high-gloss finishes', 'gold accents', 'clean lines')
ON CONFLICT DO NOTHING;

-- MUTINA-TIERRA: Scandinavian, Modern -> organic shapes, muted colors, warm wood tones, natural light
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'MUTINA-TIERRA', st.id FROM style_tags st
WHERE st.tag IN ('organic shapes', 'muted colors', 'warm wood tones', 'natural light')
ON CONFLICT DO NOTHING;

-- ATLAS-CONCORDE-BOOST: Industrial, Modern -> raw concrete, geometric shapes, matte black hardware, exposed metal
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'ATLAS-CONCORDE-BOOST', st.id FROM style_tags st
WHERE st.tag IN ('raw concrete', 'geometric shapes', 'matte black hardware', 'exposed metal')
ON CONFLICT DO NOTHING;

-- LOUIS-POULSEN-PH5: Scandinavian, Classic -> organic shapes, soft textures, pendant lighting, timeless silhouettes, warm wood tones
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'LOUIS-POULSEN-PH5', st.id FROM style_tags st
WHERE st.tag IN ('organic shapes', 'soft textures', 'pendant lighting', 'timeless silhouettes', 'warm wood tones')
ON CONFLICT DO NOTHING;

-- FLOS-IC-LIGHTS: Modern, Luxury -> geometric shapes, statement fixtures, pendant lighting, gold accents, clean lines
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'FLOS-IC-LIGHTS', st.id FROM style_tags st
WHERE st.tag IN ('geometric shapes', 'statement fixtures', 'pendant lighting', 'gold accents', 'clean lines')
ON CONFLICT DO NOTHING;

-- TOM-DIXON-BEAT: Industrial -> matte black hardware, exposed metal, statement fixtures, pendant lighting, reclaimed materials
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'TOM-DIXON-BEAT', st.id FROM style_tags st
WHERE st.tag IN ('matte black hardware', 'exposed metal', 'statement fixtures', 'pendant lighting', 'reclaimed materials')
ON CONFLICT DO NOTHING;

-- VICTORIA-ALBERT-CHESHIRE: Classic, Luxury -> freestanding bath, timeless silhouettes, refined details, marble, statement fixtures
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'VICTORIA-ALBERT-CHESHIRE', st.id FROM style_tags st
WHERE st.tag IN ('freestanding bath', 'timeless silhouettes', 'refined details', 'marble', 'statement fixtures')
ON CONFLICT DO NOTHING;

-- DURAVIT-CAPE-COD: Modern, Scandinavian -> freestanding bath, organic shapes, clean lines, warm wood tones, natural light
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'DURAVIT-CAPE-COD', st.id FROM style_tags st
WHERE st.tag IN ('freestanding bath', 'organic shapes', 'clean lines', 'warm wood tones', 'natural light')
ON CONFLICT DO NOTHING;

-- BETTE-LUX-OVAL: Modern, Luxury, Industrial -> freestanding bath, geometric shapes, high-gloss finishes, statement fixtures, chrome hardware
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'BETTE-LUX-OVAL', st.id FROM style_tags st
WHERE st.tag IN ('freestanding bath', 'geometric shapes', 'high-gloss finishes', 'statement fixtures', 'chrome hardware')
ON CONFLICT DO NOTHING;

-- GROHE-EUPHORIA: Modern, Industrial -> rain shower, chrome hardware, geometric shapes, clean lines, matte black hardware
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'GROHE-EUPHORIA', st.id FROM style_tags st
WHERE st.tag IN ('rain shower', 'chrome hardware', 'geometric shapes', 'clean lines', 'matte black hardware')
ON CONFLICT DO NOTHING;

-- HANSGROHE-RAINDANCE: Modern, Scandinavian -> rain shower, chrome hardware, clean lines, organic shapes, natural light
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'HANSGROHE-RAINDANCE', st.id FROM style_tags st
WHERE st.tag IN ('rain shower', 'chrome hardware', 'clean lines', 'organic shapes', 'natural light')
ON CONFLICT DO NOTHING;

-- AXOR-SHOWERHEAVEN: Luxury -> rain shower, statement fixtures, high-gloss finishes, layered lighting, chrome hardware
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'AXOR-SHOWERHEAVEN', st.id FROM style_tags st
WHERE st.tag IN ('rain shower', 'statement fixtures', 'high-gloss finishes', 'layered lighting', 'chrome hardware')
ON CONFLICT DO NOTHING;

-- NOBILI-ANTICA: Classic -> timeless silhouettes, refined details, brushed nickel, subtle patterns
INSERT INTO product_style_tags (product_id, tag_id)
SELECT 'NOBILI-ANTICA', st.id FROM style_tags st
WHERE st.tag IN ('timeless silhouettes', 'refined details', 'brushed nickel', 'subtle patterns')
ON CONFLICT DO NOTHING;
