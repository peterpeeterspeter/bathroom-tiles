import { DatabaseProduct, StyleProfile, ProjectSpec } from "../types";
import { supabase } from "../lib/supabase";

export interface SeedreamRenderParams {
  bathroomImageUrl: string;
  inspirationImageUrls?: string[];
  styleProfile: StyleProfile;
  selectedProducts: DatabaseProduct[];
  productActions: Record<string, string>;
  productIdToSelectionCategory?: Record<string, string>;
  spec?: ProjectSpec;
  roomNotes?: string;
  projectId?: string;
}

interface RenderConfig {
  promptVersion: string;
  enhanceMode: 'standard' | 'fast';
  imageSize: string;
  maxProductImages: number;
  maxInspirationImages: number;
}

const DEFAULT_CONFIG: RenderConfig = {
  promptVersion: 'v3-flat',
  enhanceMode: 'standard',
  imageSize: 'auto_2K',
  maxProductImages: 7,
  maxInspirationImages: 1,
};

const FAL_ENDPOINT = "https://fal.run/fal-ai/bytedance/seedream/v5/lite/edit";

const TILE_SELECTION_CATEGORIES = ['WallTile', 'FloorTile'];

const getFalApiKey = (): string => {
  const key = process.env.FAL_KEY || process.env.FAL_API_KEY || '';
  if (key) return key;
  try {
    const viteKey = (import.meta as any).env?.VITE_FAL_KEY || (import.meta as any).env?.VITE_FAL_API_KEY;
    if (viteKey) return viteKey;
  } catch {}
  return '';
};

const toDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Seedream output image (${response.status})`);
  }
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  return `data:${blob.type || 'image/png'};base64,${base64}`;
};

const WALL_LABELS = ['far wall', 'right wall', 'wall behind camera', 'left wall'];

const SEP = '----------------------------------------------------';

const getPlacementHint = (spec: ProjectSpec | undefined, category: string): string => {
  if (!spec?.existingFixtures) return '';
  const typeMap: Record<string, string> = {
    Vanity: 'SINK', Bathtub: 'BATHTUB', Shower: 'SHOWER', Toilet: 'TOILET',
    Faucet: 'SINK', Mirror: 'SINK', Lighting: 'SINK',
  };
  const fixtureType = typeMap[category];
  if (!fixtureType) return '';
  const fixture = spec.existingFixtures.find(f => f.type === fixtureType);
  if (!fixture || fixture.wallIndex === undefined) return '';
  return WALL_LABELS[fixture.wallIndex] || '';
};

interface ProductFigure {
  figureIdx: number;
  product: DatabaseProduct;
  action: string;
  url: string;
}

const buildSeedreamPrompt = (
  params: Omit<SeedreamRenderParams, 'bathroomImageUrl'>,
  imageLayout: { inspirationCount: number; inspirationIdx: number; productFigures: ProductFigure[] }
): string => {
  const { styleProfile, productActions, spec, roomNotes } = params;
  const presetName = styleProfile.presetName || 'Modern';
  const topTags = styleProfile.tags.slice(0, 4).map(t => t.tag);
  const moodDescription = styleProfile.moodDescription || '';
  const productIdToCategory = params.productIdToSelectionCategory || {};
  const fixtureProducts = imageLayout.productFigures.filter(pf => !TILE_SELECTION_CATEGORIES.includes(productIdToCategory[pf.product.id] || ''));
  const wallTilePf = imageLayout.productFigures.find(pf => productIdToCategory[pf.product.id] === 'WallTile');
  const floorTilePf = imageLayout.productFigures.find(pf => productIdToCategory[pf.product.id] === 'FloorTile');

  const keepLine = '\nKeep ALL existing fixtures (vanity, bathtub, shower, toilet, faucet, mirror, lighting) unchanged. Only update floor and wall tiles.';

  let productLines = '';
  for (const pf of fixtureProducts) {
    const cat = pf.product.category;
    const imgNum = pf.figureIdx;
    const wallHint = getPlacementHint(spec, cat);
    const placeLine = pf.action === 'add'
      ? 'Install in most logical position.'
      : wallHint
        ? `Maintain same ${wallHint} position.`
        : 'Place in original position.';

    productLines += `\n\u2022 ${cat} = Image ${imgNum}\n  ${placeLine}\n  Scale realistically to room size.\n`;
  }

  const wallAction = productActions['WallTile'] || 'replace';
  const floorAction = productActions['FloorTile'] || 'replace';

  let materialLines = '';
  if (wallAction === 'keep' && floorAction === 'keep') {
    materialLines += `- KEEP existing wall and floor tiles EXACTLY as they appear in Image 1. Do NOT change them.\n`;
  } else if (wallAction === 'keep') {
    materialLines += `- KEEP existing wall tiles EXACTLY as they appear in Image 1. Do NOT change wall tiles.\n`;
    if (floorTilePf) {
      materialLines += `- Apply Image ${floorTilePf.figureIdx} as FLOOR tile throughout the bathroom floor. Replace floor tiles with this product.\n`;
    } else {
      const tileTags = topTags.filter(t => /tile|marble|stone|ceramic|zellige/i.test(t));
      materialLines += `- Replace floor tiles with ${tileTags.length > 0 ? tileTags.join(', ') : 'modern tiles matching the style'}.\n`;
    }
  } else if (floorAction === 'keep') {
    materialLines += `- KEEP existing floor tiles EXACTLY as they appear in Image 1. Do NOT change floor tiles.\n`;
    if (wallTilePf) {
      materialLines += `- Apply Image ${wallTilePf.figureIdx} as WALL tile throughout the bathroom walls. Replace wall tiles with this product.\n`;
    } else {
      const tileTags = topTags.filter(t => /tile|marble|stone|ceramic|zellige/i.test(t));
      materialLines += `- Replace wall tiles with ${tileTags.length > 0 ? tileTags.join(', ') : 'modern tiles matching the style'}.\n`;
    }
  } else if (wallTilePf && floorTilePf && wallTilePf.product.id !== floorTilePf.product.id) {
    materialLines += `- Apply Image ${wallTilePf.figureIdx} as WALL tile throughout the bathroom walls.\n`;
    materialLines += `- Apply Image ${floorTilePf.figureIdx} as FLOOR tile throughout the bathroom floor.\n`;
    materialLines += `- Replace existing tiles with these products. Keep all fixtures in place.\n`;
  } else if (wallTilePf || floorTilePf) {
    const tilePf = wallTilePf || floorTilePf;
    materialLines += `- Apply Image ${tilePf.figureIdx} as floor and wall tile throughout the bathroom.\n`;
    materialLines += `- Replace existing floor and wall tiles with this product. Keep all fixtures in place.\n`;
  } else {
    const tileTags = topTags.filter(t => /tile|marble|stone|ceramic|zellige/i.test(t));
    materialLines += `- Replace wall and floor tiles with ${tileTags.length > 0 ? tileTags.join(', ') : 'modern tiles matching the style'}.\n`;
  }
  const hasMarble = topTags.some(t => /marble/i.test(t));
  materialLines += `- ${hasMarble ? 'Warm off-white or marble-toned' : 'Smooth warm plaster on non-tiled'} walls.\n`;
  materialLines += `- Large-format neutral floor tiles.\n`;

  let moodLine = '';
  if (moodDescription.trim()) {
    moodLine = `\nUser wants: ${moodDescription.trim()}`;
  }

  let notesLine = '';
  if (roomNotes && roomNotes.trim()) {
    notesLine = `\nRoom notes: ${roomNotes.trim()}`;
  }

  let inspirationLine = '';
  if (imageLayout.inspirationCount > 0) {
    inspirationLine = `\nUse Image ${imageLayout.inspirationIdx} as additional style reference.`;
  }

  const prompt = `You are redesigning Image 1 while preserving its exact architecture.

PRIORITY ORDER:
1. Room geometry and camera fidelity (highest priority)
2. Product replacement accuracy
3. Style and material redesign (surface level only)

${SEP}

ARCHITECTURE LOCK (NON-NEGOTIABLE)

Image 1 defines:
- Camera position and lens distortion
- Wall positions and angles
- Ceiling height
- Window and door size and placement
- Floor layout

These must remain IDENTICAL.
Do not move or resize architectural elements.${keepLine}

${SEP}

REPLACEMENTS (tiles only)

Use reference images exactly for tile design only:
${productLines}
Do not move fixtures. Only replace floor and wall tiles.

${SEP}

STYLE: ${presetName}. ${topTags.join('. ')}.${moodLine}${inspirationLine}
Soft 3000K lighting. No clutter. No plants. No artwork.${notesLine}

Material updates:
${materialLines}
${SEP}

The result must clearly be the SAME bathroom as Image 1.
Only improved finishes and updated fixtures.
No layout redesign. No perspective change. No structural alteration.

Photorealistic. Magazine-quality. Return image only.`;

  const wordCount = prompt.split(/\s+/).filter(w => w.length > 0).length;
  console.log(`[Seedream][${DEFAULT_CONFIG.promptVersion}] Prompt word count: ${wordCount}`);

  return prompt;
};

const logRender = async (data: {
  projectId?: string;
  promptWordCount: number;
  imageCount: number;
  productRefCount: number;
  productCategories: string[];
  inspirationRefCount: number;
  hasMoodDescription: boolean;
  hasRoomNotes: boolean;
  success: boolean;
  latencyMs: number;
  errorMessage?: string;
  renderUrl?: string;
  inputPhotoUrl?: string;
}) => {
  try {
    await supabase.from('render_logs').insert({
      project_id: data.projectId || null,
      provider: 'seedream',
      prompt_version: DEFAULT_CONFIG.promptVersion,
      prompt_word_count: data.promptWordCount,
      enhance_mode: DEFAULT_CONFIG.enhanceMode,
      image_size: DEFAULT_CONFIG.imageSize,
      image_count: data.imageCount,
      product_ref_count: data.productRefCount,
      product_categories: data.productCategories,
      inspiration_ref_count: data.inspirationRefCount,
      has_mood_description: data.hasMoodDescription,
      has_room_notes: data.hasRoomNotes,
      success: data.success,
      latency_ms: data.latencyMs,
      error_message: data.errorMessage || null,
      render_url: data.renderUrl || null,
      input_photo_url: data.inputPhotoUrl || null,
    });
  } catch (e) {
    console.warn('[Seedream] Render log failed (non-blocking):', e);
  }
};

export const generateSeedreamRenovation = async (params: SeedreamRenderParams): Promise<string> => {
  const apiKey = getFalApiKey();
  if (!apiKey) throw new Error('FAL_KEY is not configured');
  const startTime = Date.now();

  const imageUrls: string[] = [params.bathroomImageUrl];

  const productIdToCategory = params.productIdToSelectionCategory || {};
  const eligibleProducts: { product: DatabaseProduct; action: string; url: string }[] = [];
  for (const product of params.selectedProducts) {
    const selectionCategory = productIdToCategory[product.id] || product.category;
    const action = params.productActions[selectionCategory] || 'replace';
    if (action === 'keep' || action === 'remove') continue;
    const url = product.image_url || (product.images && product.images.length > 0 ? product.images[0] : null);
    if (url && /^https?:\/\//.test(url)) {
      eligibleProducts.push({ product, action, url });
    }
  }

  eligibleProducts.sort((a, b) => {
    const catA = productIdToCategory[a.product.id] || a.product.category;
    const catB = productIdToCategory[b.product.id] || b.product.category;
    const idxA = TILE_SELECTION_CATEGORIES.indexOf(catA);
    const idxB = TILE_SELECTION_CATEGORIES.indexOf(catB);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });

  if (eligibleProducts.length > DEFAULT_CONFIG.maxProductImages) {
    eligibleProducts.splice(DEFAULT_CONFIG.maxProductImages);
  }

  const productFigures: ProductFigure[] = [];
  let figureIdx = 2;
  for (const ep of eligibleProducts) {
    imageUrls.push(ep.url);
    productFigures.push({ figureIdx, product: ep.product, action: ep.action, url: ep.url });
    figureIdx++;
  }

  const inspirationUrls = (params.inspirationImageUrls || [])
    .filter(url => /^https?:\/\//.test(url))
    .slice(0, DEFAULT_CONFIG.maxInspirationImages);
  let inspirationIdx = 0;
  if (inspirationUrls.length > 0 && imageUrls.length < 10) {
    imageUrls.push(inspirationUrls[0]);
    inspirationIdx = imageUrls.length;
  }
  const cappedInspirationCount = inspirationIdx > 0 ? 1 : 0;

  if (imageUrls.length > 10) {
    imageUrls.splice(10);
  }

  const prompt = buildSeedreamPrompt(
    {
      inspirationImageUrls: params.inspirationImageUrls,
      styleProfile: params.styleProfile,
      selectedProducts: params.selectedProducts,
      productActions: params.productActions,
      spec: params.spec,
      roomNotes: params.roomNotes,
    },
    { inspirationCount: cappedInspirationCount, inspirationIdx, productFigures }
  );

  const productCategories = productFigures.map(pf => pf.product.category);
  const promptWordCount = prompt.split(/\s+/).filter(w => w.length > 0).length;

  console.log(`[Seedream] Sending ${imageUrls.length} images (1 room, ${productFigures.length} products, ${cappedInspirationCount} inspiration), prompt ${promptWordCount} words / ${prompt.length} chars`);

  const payload = {
    prompt,
    image_urls: imageUrls,
    image_size: DEFAULT_CONFIG.imageSize,
    num_images: 1,
    max_images: 1,
    enable_safety_checker: true,
    enhance_prompt_mode: DEFAULT_CONFIG.enhanceMode,
  };

  let renderUrl: string | undefined;
  try {
    const response = await fetch(FAL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Seedream edit failed (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    const outputUrl = json?.images?.[0]?.url;
    if (!outputUrl) {
      throw new Error('Seedream edit returned no image URL');
    }

    renderUrl = outputUrl;
    const latencyMs = Date.now() - startTime;

    logRender({
      projectId: params.projectId,
      promptWordCount,
      imageCount: imageUrls.length,
      productRefCount: productFigures.length,
      productCategories,
      inspirationRefCount: cappedInspirationCount,
      hasMoodDescription: !!(params.styleProfile.moodDescription),
      hasRoomNotes: !!(params.roomNotes),
      success: true,
      latencyMs,
      renderUrl: outputUrl,
      inputPhotoUrl: params.bathroomImageUrl,
    });

    return toDataUrl(outputUrl);
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;

    logRender({
      projectId: params.projectId,
      promptWordCount,
      imageCount: imageUrls.length,
      productRefCount: productFigures.length,
      productCategories,
      inspirationRefCount: cappedInspirationCount,
      hasMoodDescription: !!(params.styleProfile.moodDescription),
      hasRoomNotes: !!(params.roomNotes),
      success: false,
      latencyMs,
      errorMessage: error.message,
      inputPhotoUrl: params.bathroomImageUrl,
    });

    throw error;
  }
};
