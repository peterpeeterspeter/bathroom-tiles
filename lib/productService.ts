import { supabase } from './supabase';
import { StyleProfile, DatabaseProduct, StylePreset, PriceTier } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const STORAGE_BUCKET = 'product-images';

let cachedProducts: DatabaseProduct[] | null = null;
let cachedPresets: StylePreset[] | null = null;
let cachedStyleTags: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

function isCacheValid(): boolean {
  return Date.now() - cacheTimestamp < CACHE_TTL;
}

export async function fetchStyleTags(): Promise<string[]> {
  if (cachedStyleTags && isCacheValid()) return cachedStyleTags;

  const { data } = await supabase
    .from('style_tags')
    .select('tag')
    .order('tag');

  cachedStyleTags = (data || []).map(r => r.tag);
  cacheTimestamp = Date.now();
  return cachedStyleTags;
}

const LOCAL_STYLE_IMAGES: Record<string, string> = {
  hotel: '/styles/hotel.jpg',
  hygge: '/styles/hygge.jpg',
  industrial: '/styles/industrial.jpg',
  minimalistic: '/styles/minimalistic.webp',
  'modern-classic': '/styles/modern-classic.jpg',
  modern_classic: '/styles/modern-classic.jpg',
  modernclassic: '/styles/modern-classic.jpg',
};

function resolveStyleImage(name: string, fallbackUrl: string): string {
  const key = name.toLowerCase().replace(/[\s_-]+/g, '');
  for (const [k, v] of Object.entries(LOCAL_STYLE_IMAGES)) {
    if (key === k.replace(/[\s_-]+/g, '')) return v;
  }
  return fallbackUrl;
}

export async function fetchStylePresets(): Promise<StylePreset[]> {
  if (cachedPresets && isCacheValid()) return cachedPresets;

  const { data: presets } = await supabase
    .from('style_presets')
    .select('id, name, label_nl, description_nl, label_en, description_en, image_url, display_order')
    .eq('is_active', true)
    .order('display_order');

  if (!presets || presets.length === 0) return [];

  const { data: presetTags } = await supabase
    .from('style_preset_tags')
    .select('preset_id, style_tags(tag)')
    .in('preset_id', presets.map(p => p.id));

  const tagsByPreset: Record<number, string[]> = {};
  for (const pt of presetTags || []) {
    const presetId = pt.preset_id;
    const tag = (pt.style_tags as any)?.tag;
    if (!tag) continue;
    if (!tagsByPreset[presetId]) tagsByPreset[presetId] = [];
    tagsByPreset[presetId].push(tag);
  }

  cachedPresets = presets.map(p => ({
    ...p,
    label_nl: (p as any).label_en || p.label_nl,
    description_nl: (p as any).description_en || p.description_nl,
    image_url: resolveStyleImage(p.name, p.image_url),
    tags: tagsByPreset[p.id] || [],
  }));
  cacheTimestamp = Date.now();
  return cachedPresets;
}

export async function fetchAllActiveProducts(): Promise<DatabaseProduct[]> {
  if (cachedProducts && isCacheValid()) return cachedProducts;

  const { data: products } = await supabase
    .from('products')
    .select('id, brand, name, category, price, currency, image_url, images, origin, is_active, display_order, price_low, price_high, price_tier, catalog_image_path, render_image_path, description')
    .eq('is_active', true)
    .eq('source', 'bathroom-tiles')
    .order('display_order');

  if (!products || products.length === 0) return [];

  const { data: productTags } = await supabase
    .from('product_style_tags')
    .select('product_id, style_tags(tag)')
    .in('product_id', products.map(p => p.id));

  const tagsByProduct: Record<string, string[]> = {};
  for (const pt of productTags || []) {
    const productId = pt.product_id;
    const tag = (pt.style_tags as any)?.tag;
    if (!tag) continue;
    if (!tagsByProduct[productId]) tagsByProduct[productId] = [];
    tagsByProduct[productId].push(tag);
  }

  cachedProducts = products.map(p => ({
    ...p,
    tags: tagsByProduct[p.id] || [],
  })) as DatabaseProduct[];
  cacheTimestamp = Date.now();
  return cachedProducts;
}

export interface ScoredProduct extends DatabaseProduct {
  score: number;
}

export async function fetchProductsForProfile(profile: StyleProfile): Promise<ScoredProduct[]> {
  const products = await fetchAllActiveProducts();
  const profileTagWeights = new Map(profile.tags.map(t => [t.tag, t.weight]));

  return products.map(product => {
    let score = 0;
    for (const tag of product.tags) {
      const weight = profileTagWeights.get(tag);
      if (weight !== undefined) {
        score += weight;
      }
    }
    return { ...product, score };
  }).sort((a, b) => b.score - a.score);
}

export function getProductsByCategory(products: ScoredProduct[]): Record<string, ScoredProduct[]> {
  const grouped: Record<string, ScoredProduct[]> = {};
  for (const product of products) {
    if (!grouped[product.category]) grouped[product.category] = [];
    grouped[product.category].push(product);
  }
  return grouped;
}

export async function fetchProductById(id: string): Promise<DatabaseProduct | null> {
  const products = await fetchAllActiveProducts();
  return products.find(p => p.id === id) || null;
}

export function getProductCatalogImageUrl(product: DatabaseProduct): string {
  if (product.catalog_image_path) {
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${product.catalog_image_path}`;
  }
  return product.image_url;
}

export function getProductRenderImageUrl(product: DatabaseProduct): string {
  if (product.render_image_path) {
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${product.render_image_path}`;
  }
  return product.image_url;
}

export async function fetchRenderImageAsBase64(
  product: DatabaseProduct
): Promise<{ base64: string; mimeType: string } | null> {
  const url = getProductRenderImageUrl(product);
  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    return { base64, mimeType: blob.type || 'image/jpeg' };
  } catch (err) {
    console.warn(`Failed to fetch render image for product ${product.id}:`, err);
    return null;
  }
}

export async function fetchRenderImagesForProducts(
  products: DatabaseProduct[]
): Promise<Map<string, { base64: string; mimeType: string }>> {
  const imageMap = new Map<string, { base64: string; mimeType: string }>();

  await Promise.all(
    products.map(async (product) => {
      const result = await fetchRenderImageAsBase64(product);
      if (result) {
        imageMap.set(product.id, result);
      }
    })
  );

  return imageMap;
}

export function getProductPriceDisplay(product: DatabaseProduct): string {
  const symbol = product.currency === 'USD' ? '$' : '€';
  if (product.price_low && product.price_high) {
    return `${symbol}${Math.round(product.price_low)} – ${symbol}${Math.round(product.price_high)}`;
  }
  return `${symbol}${Math.round(product.price)}`;
}
