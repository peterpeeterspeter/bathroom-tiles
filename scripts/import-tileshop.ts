/**
 * Import TileShop products from tileshop-all-products-images.json into Supabase.
 *
 * Usage:
 *   npx tsx scripts/import-tileshop.ts [path-to-json]
 *
 * Environment (from .env or shell):
 *   SUPABASE_URL or VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (required for inserts; never commit)
 *
 * Default JSON path: data/tileshop-all-products-images.json
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import { readFile } from "fs/promises";
import { join } from "path";

dotenv.config({ path: join(process.cwd(), ".env"), override: true });

const BATCH_SIZE = 25;

interface TileShopProduct {
  name: string;
  price_per_sqft: number;
  image_url: string;
  product_url: string;
  dimensions?: string | null;
  material?: string | null;
  finish?: string | null;
  color?: string | null;
  brand?: string | null;
  shape?: string | null;
  applications?: string[];
  images?: { url: string; type: string }[];
}

function extractId(product: TileShopProduct): string | null {
  const url = product.product_url || "";
  const m = url.match(/-(\d+)$/);
  return m ? m[1] : null;
}

function isNonTile(product: TileShopProduct): boolean {
  const name = (product.name || "").toLowerCase();
  return name.includes("engineered wood flooring") && !name.includes("tile");
}

function derivePriceTier(pricePerSqft: number): "budget" | "mid" | "premium" {
  if (pricePerSqft <= 15) return "budget";
  if (pricePerSqft <= 40) return "mid";
  return "premium";
}

/** Prefer render-type image for catalog/display; fallback to first photo. */
function pickRenderOrPrimaryUrl(
  images: { url: string; type: string }[] | undefined,
  fallback: string
): string {
  if (!images?.length) return fallback;
  const render = images.find((i) => i.type === "render" || i.type === "installed");
  const photo = images.find((i) => i.type === "photo");
  return (render || photo || images[0])?.url || fallback;
}

function mapToProduct(
  raw: TileShopProduct,
  id: string,
  displayOrder: number
): Record<string, unknown> {
  const price = raw.price_per_sqft || 0;
  const priceLow = Math.round(price * 0.92 * 100) / 100;
  const priceHigh = Math.round(price * 1.08 * 100) / 100;
  const descParts = [raw.material, raw.shape].filter(Boolean);
  const description = descParts.length > 0 ? descParts.join(", ") : undefined;
  const imageUrls = (raw.images?.map((i) => i.url).filter(Boolean) || []).slice(0, 10);
  const primaryImage =
    raw.image_url || pickRenderOrPrimaryUrl(raw.images, imageUrls[0] ?? "");

  return {
    id: `TILESHOP-${id}`,
    brand: raw.brand || "TileShop",
    name: raw.name,
    category: "Tile",
    price: Math.round(price * 100) / 100,
    price_low: priceLow,
    price_high: priceHigh,
    currency: "USD",
    image_url: primaryImage,
    images: imageUrls.length > 0 ? imageUrls : undefined,
    dimensions: raw.dimensions || undefined,
    product_url: raw.product_url || undefined,
    applications: raw.applications?.length ? raw.applications : undefined,
    material: raw.material || undefined,
    finish: raw.finish || undefined,
    shape: raw.shape || undefined,
    origin: "tileshop.com",
    is_active: true,
    display_order: displayOrder,
    price_tier: derivePriceTier(price),
    source: "bathroom-tiles",
    description: description || undefined,
  };
}

async function main() {
  const jsonPath =
    process.argv[2] ||
    join(process.cwd(), "data", "tileshop-all-products-images.json");

  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Missing env: SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  console.log("Reading", jsonPath, "...");
  const json = await readFile(jsonPath, "utf-8");
  const rawProducts: TileShopProduct[] = JSON.parse(json);

  const products: Array<{ raw: TileShopProduct; row: Record<string, unknown> }> =
    [];
  let order = 9; // After existing US tiles (1–8)
  for (const raw of rawProducts) {
    if (isNonTile(raw)) {
      console.log("Skipping non-tile:", raw.name);
      continue;
    }
    const id = extractId(raw);
    if (!id) {
      console.log("Skipping (no numeric ID):", raw.name);
      continue;
    }
    products.push({ raw, row: mapToProduct(raw, id, order++) });
  }

  console.log(`Importing ${products.length} tiles...`);

  const supabase = createClient(url, serviceKey, {
    global: { fetch: fetch as typeof globalThis.fetch },
  });

  // Pre-flight: verify connection
  const { error: testError } = await supabase.from("products").select("id").limit(1);
  if (testError) {
    console.error("Connection test failed:", testError.message);
    if ((testError as any).cause) console.error("Cause:", (testError as any).cause);
    process.exit(1);
  }
  console.log("Connected to Supabase OK");

  let imported = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE).map((p) => p.row);
    const { error } = await supabase.from("products").upsert(batch, {
      onConflict: "id",
    });
    if (error) {
      const errMsg = error?.cause ?? error?.message ?? String(error);
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, errMsg);
      if (failed === 0 && i === 0) console.error("First error details:", error);
      failed += batch.length;
    } else {
      imported += batch.length;
      console.log(`Imported ${imported}/${products.length}`);
    }
  }

  console.log(`Done. Imported: ${imported}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
