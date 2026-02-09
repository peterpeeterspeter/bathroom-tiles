import { supabase } from './supabase';
import { StyleProfile, DatabaseProduct, StylePreset } from '../types';

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
    .select('id, name, label_nl, description_nl, image_url, display_order')
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
    .select('id, brand, name, category, price, currency, image_url, origin, is_active, display_order')
    .eq('is_active', true)
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
