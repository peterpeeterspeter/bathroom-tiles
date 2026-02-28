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
    .select('id, brand, name, category, price, currency, image_url, images, origin, is_active, display_order, price_low, price_high, price_tier, catalog_image_path, render_image_path, description, dimensions, product_url, applications, material, finish, shape')
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

const WALL_MATERIAL_LABELS: Record<string, string> = {
  Porcelain: 'Porcelain (large format)',
  Ceramic: 'Ceramic',
  Mosaic: 'Mosaic',
  Marble: 'Marble-look',
  Cement: 'Concrete-look',
  Slate: 'Slate',
  Travertine: 'Travertine',
  Glass: 'Glass',
  Limestone: 'Limestone',
};
const FLOOR_MATERIAL_LABELS: Record<string, string> = {
  Porcelain: 'Porcelain',
  Ceramic: 'Ceramic',
  Cement: 'Cement / encaustic',
  Marble: 'Natural stone',
  Slate: 'Natural stone',
  Travertine: 'Natural stone',
  Limestone: 'Natural stone',
};

function hasWall(apps: string[]): boolean {
  return apps.includes('Wall');
}
function hasFloor(apps: string[]): boolean {
  return apps.includes('Floor');
}
function isZelligeStyle(p: DatabaseProduct): boolean {
  const n = (p.name || '').toLowerCase();
  const s = (p.shape || '').toLowerCase();
  return /zellige|herringbone|chevron/.test(n) || ['chevron', 'herringbone', 'subway'].includes(s);
}

export function getProductsByApplication(products: ScoredProduct[]): { wall: ScoredProduct[]; floor: ScoredProduct[] } {
  const wall: ScoredProduct[] = [];
  const floor: ScoredProduct[] = [];
  for (const p of products) {
    const apps = (p.applications || []) as string[];
    if (hasWall(apps)) wall.push(p);
    if (hasFloor(apps)) floor.push(p);
  }
  return { wall, floor };
}

export type WallMaterialKey = string;
export type FloorMaterialKey = string;

export function getWallMaterialGroups(products: ScoredProduct[]): { key: string; label: string; count: number }[] {
  const wallProducts = products.filter((p) => hasWall((p.applications || []) as string[]));
  const byKey: Record<string, { label: string; count: number }> = {};
  for (const p of wallProducts) {
    if (isZelligeStyle(p)) {
      byKey['Zellige-style'] = { label: 'Zellige-style', count: (byKey['Zellige-style']?.count || 0) + 1 };
    } else if (p.material) {
      const label = WALL_MATERIAL_LABELS[p.material] || p.material;
      byKey[p.material] = { label, count: (byKey[p.material]?.count || 0) + 1 };
    }
  }
  return Object.entries(byKey)
    .map(([key, { label, count }]) => ({ key, label, count }))
    .sort((a, b) => b.count - a.count);
}

export function getFloorMaterialGroups(products: ScoredProduct[]): { key: string; label: string; count: number }[] {
  const floorProducts = products.filter((p) => hasFloor((p.applications || []) as string[]));
  const byKey: Record<string, { label: string; count: number }> = {};
  const naturalStoneMaterials = ['Marble', 'Slate', 'Travertine', 'Limestone'];
  for (const p of floorProducts) {
    if (!p.material) continue;
    const isNaturalStone = naturalStoneMaterials.includes(p.material);
    const key = isNaturalStone ? 'Natural stone' : p.material;
    const label = isNaturalStone ? 'Natural stone' : FLOOR_MATERIAL_LABELS[p.material] || p.material;
    byKey[key] = { label, count: (byKey[key]?.count || 0) + 1 };
  }
  return Object.entries(byKey)
    .map(([key, { label, count }]) => ({ key, label, count }))
    .sort((a, b) => b.count - a.count);
}

export function filterWallProductsByMaterial(products: ScoredProduct[], materialKey: string): ScoredProduct[] {
  const wallProducts = products.filter((p) => hasWall((p.applications || []) as string[]));
  if (!materialKey || materialKey === 'all') return wallProducts;
  if (materialKey === 'Zellige-style') {
    return wallProducts.filter(isZelligeStyle);
  }
  if (materialKey === 'Natural stone') {
    return wallProducts.filter((p) => ['Marble', 'Slate', 'Travertine', 'Limestone'].includes(p.material || ''));
  }
  return wallProducts.filter((p) => p.material === materialKey);
}

export function filterFloorProductsByMaterial(products: ScoredProduct[], materialKey: string): ScoredProduct[] {
  const floorProducts = products.filter((p) => hasFloor((p.applications || []) as string[]));
  if (!materialKey || materialKey === 'all') return floorProducts;
  if (materialKey === 'Natural stone') {
    return floorProducts.filter((p) => ['Marble', 'Slate', 'Travertine', 'Limestone'].includes(p.material || ''));
  }
  return floorProducts.filter((p) => p.material === materialKey);
}

export interface TileFacets {
  application?: 'floor' | 'wall' | 'both' | 'all';
  material?: string;
  finish?: string;
  priceTier?: string;
}

export function filterProductsByFacets<T extends DatabaseProduct>(products: T[], facets: TileFacets): T[] {
  if (!facets || Object.keys(facets).every(k => !(facets as any)[k] || (facets as any)[k] === 'all')) {
    return products;
  }
  return products.filter((p) => {
    if (facets.application && facets.application !== 'all') {
      const apps = (p.applications || []) as string[];
      const hasFloor = apps.includes('Floor');
      const hasWall = apps.includes('Wall');
      if (facets.application === 'floor' && !hasFloor) return false;
      if (facets.application === 'wall' && !hasWall) return false;
      if (facets.application === 'both' && (!hasFloor || !hasWall)) return false;
    }
    if (facets.material && facets.material !== 'all' && p.material !== facets.material) return false;
    if (facets.finish && facets.finish !== 'all' && p.finish !== facets.finish) return false;
    if (facets.priceTier && facets.priceTier !== 'all' && p.price_tier !== facets.priceTier) return false;
    return true;
  });
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
