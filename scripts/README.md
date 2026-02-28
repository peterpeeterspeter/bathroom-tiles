# Scripts

## import-tileshop

Imports TileShop products from `data/tileshop-all-products-images.json` into Supabase (`products` table with `source='bathroom-tiles'`).

**Before first run:** Apply the migration `supabase/migrations/20260228120000_add_tileshop_product_columns.sql` in Supabase SQL Editor (adds `dimensions`, `product_url`, `images` columns).

**Requirements:**
- `SUPABASE_URL` or `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (from Supabase dashboard → Settings → API)

**Usage:**
```bash
# With .env (recommended — do not commit .env with the service role key)
npm run import-tileshop

# Custom JSON path
npm run import-tileshop /path/to/tileshop.json

# Or set env inline
SUPABASE_SERVICE_ROLE_KEY=your-key npm run import-tileshop
```
