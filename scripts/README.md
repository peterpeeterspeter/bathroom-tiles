# Scripts

## import-tileshop

Imports TileShop products from `data/tileshop-all-products-images.json` into Supabase (`products` table with `source='bathroom-tiles'`).

**Requirements:**
- `SUPABASE_URL` or `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (from Supabase dashboard → Settings → API)

**Usage:**
```bash
# Default path: data/tileshop-all-products-images.json
SUPABASE_SERVICE_ROLE_KEY=your-key npm run import-tileshop

# Custom JSON path
SUPABASE_SERVICE_ROLE_KEY=your-key npm run import-tileshop /path/to/tileshop.json
```

Or export vars in `.env` (do not commit `.env` with the service role key).
