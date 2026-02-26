CREATE TABLE IF NOT EXISTS render_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  project_id UUID,
  provider TEXT NOT NULL DEFAULT 'seedream',
  prompt_version TEXT NOT NULL,
  prompt_word_count INT,
  enhance_mode TEXT DEFAULT 'standard',
  image_size TEXT DEFAULT 'auto_2K',
  image_count INT,
  product_ref_count INT,
  product_categories TEXT[],
  inspiration_ref_count INT,
  has_mood_description BOOLEAN DEFAULT false,
  has_room_notes BOOLEAN DEFAULT false,
  success BOOLEAN NOT NULL,
  latency_ms INT,
  error_message TEXT,
  render_url TEXT,
  input_photo_url TEXT
);

ALTER TABLE render_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_render_logs" ON render_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_render_logs" ON render_logs FOR SELECT TO anon USING (true);

CREATE TABLE IF NOT EXISTS render_evals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  render_log_id UUID REFERENCES render_logs(id),
  geometry_score INT CHECK (geometry_score BETWEEN 1 AND 5),
  product_score INT CHECK (product_score BETWEEN 1 AND 5),
  style_score INT CHECK (style_score BETWEEN 1 AND 5),
  realism_score INT CHECK (realism_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE render_evals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_render_evals" ON render_evals FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_render_evals" ON render_evals FOR SELECT TO anon USING (true);
