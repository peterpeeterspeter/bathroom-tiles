import { DatabaseProduct, StyleProfile, ProjectSpec } from "../types";

export interface SeedreamRenderParams {
  bathroomImageUrl: string;
  inspirationImageUrls?: string[];
  styleProfile: StyleProfile;
  selectedProducts: DatabaseProduct[];
  productActions: Record<string, string>;
  spec?: ProjectSpec;
  roomNotes?: string;
}

const FAL_ENDPOINT = "https://fal.run/fal-ai/bytedance/seedream/v5/lite/edit";

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

const CATEGORY_EMOJI: Record<string, string> = {
  Vanity: '\u{1FAB5}', Bathtub: '\u{1F6C1}', Shower: '\u{1F6BF}', Toilet: '\u{1F6BD}',
  Faucet: '\u{1F6B0}', Mirror: '\u{1FA9E}', Tile: '\u{1F9F1}', Lighting: '\u{1F4A1}',
};

const WALL_LABELS = ['far wall', 'right wall', 'wall behind camera', 'left wall'];

const getFixturePlacement = (spec: ProjectSpec | undefined, category: string): string => {
  if (!spec?.existingFixtures) return '';
  const typeMap: Record<string, string> = {
    Vanity: 'SINK', Bathtub: 'BATHTUB', Shower: 'SHOWER', Toilet: 'TOILET',
    Faucet: 'SINK', Mirror: 'SINK', Lighting: 'SINK',
  };
  const fixtureType = typeMap[category];
  if (!fixtureType) return '';
  const fixture = spec.existingFixtures.find(f => f.type === fixtureType);
  if (!fixture) return '';
  const wallLabel = fixture.wallIndex !== undefined ? WALL_LABELS[fixture.wallIndex] || `wall ${fixture.wallIndex}` : '';
  if (wallLabel) return `Place where the original ${category.toLowerCase()} exists on the ${wallLabel} in IMAGE 1.`;
  return `Place where the original ${category.toLowerCase()} exists in IMAGE 1.`;
};

const buildSeedreamPrompt = (
  params: Omit<SeedreamRenderParams, 'bathroomImageUrl'>,
  imageLayout: { inspirationCount: number; productFigures: { figureIdx: number; product: DatabaseProduct; action: string }[] }
): string => {
  const { styleProfile, productActions, spec } = params;
  const presetName = styleProfile.presetName || 'Modern';
  const topTags = styleProfile.tags.slice(0, 6).map(t => t.tag);
  const categories = ['Vanity', 'Bathtub', 'Shower', 'Toilet', 'Faucet', 'Mirror', 'Lighting'];
  const fixtureProducts = imageLayout.productFigures.filter(pf => pf.product.category !== 'Tile');
  const tileProduct = imageLayout.productFigures.find(pf => pf.product.category === 'Tile');
  const D = '\n\u2E3B\n';
  const B = '\t\u2022\t';

  const removeItems = categories.filter(c => (productActions[c] || 'replace') !== 'keep');
  const keepItems = categories.filter(c => productActions[c] === 'keep');

  let prompt = `ROLE
You are a professional architectural image editor specializing in high-fidelity bathroom renovations.
${D}
\uD83D\uDD12 NON-NEGOTIABLE LOCKS
${B}IMAGE 1 is the single source of truth for room geometry and perspective.
${B}Camera position, angle, lens distortion, wall boundaries, ceiling height, door and window positions must remain identical.
${B}Do not move structural elements.
${B}Do not add or remove walls, windows, or doors.
${B}Only renovate finishes and fixtures.

If any instruction conflicts with IMAGE 1, follow IMAGE 1.
${D}
STEP 1 \u2014 STUDY THE EXISTING ROOM

Carefully analyze IMAGE 1.
Identify:
${B}Exact camera viewpoint
${B}Wall layout
${B}Floor layout
${B}Plumbing wall
${B}Natural light direction
${B}Existing fixture placement

This viewpoint must remain unchanged.
${D}
STEP 2 \u2014 STRIP TO SHELL

Mentally remove:
${B}Existing tiles
${removeItems.map(c => `${B}${c}`).join('\n')}
${B}Decorative elements

Keep:
${B}Same room shape
${B}Same layout
${B}Same plumbing locations
${B}Same perspective${keepItems.length > 0 ? `\n${B}Existing ${keepItems.join(', ').toLowerCase()} exactly as in IMAGE 1` : ''}
${D}
STEP 3 \u2014 PLACE NEW FIXTURES (USE PRODUCT REFERENCES EXACTLY)
`;

  let productNum = 1;
  for (const pf of fixtureProducts) {
    const p = pf.product;
    const emoji = CATEGORY_EMOJI[p.category] || '';
    const placement = getFixturePlacement(spec, p.category);
    const placementLine = placement
      ? placement
      : pf.action === 'add'
        ? `Place in the most logical location in IMAGE 1.`
        : `Place where original ${p.category.toLowerCase()} existed in IMAGE 1.`;

    prompt += `
${emoji} PRODUCT ${productNum} \u2014 ${p.name}

Use PRODUCT ${productNum} exactly as reference:
${B}${placementLine}
${B}Maintain realistic scale and plumbing alignment.

Do not change room proportions to fit it \u2014 scale correctly.
`;
    productNum++;
  }

  prompt += `${D}
STEP 4 \u2014 APPLY MATERIALS`;

  if (tileProduct) {
    prompt += `

\uD83E\uDDF1 PRODUCT ${productNum} \u2014 ${tileProduct.product.name}

Use PRODUCT ${productNum} exactly as reference:
${B}Apply as feature wall behind vanity OR bathtub
${B}Match exact tile pattern, color, and texture

Do not change wall dimensions.`;
  } else {
    const tileAction = productActions['Tile'] || 'replace';
    if (tileAction === 'replace') {
      const tileTags = topTags.filter(t => /tile|marble|stone|ceramic|zellige|pattern/i.test(t));
      prompt += `

Wall tiles: replace with ${tileTags.length > 0 ? tileTags.join(', ') : 'modern tiles matching the style'}.
Do not change wall dimensions.`;
    }
  }

  const hasMarble = topTags.some(t => /marble/i.test(t));
  prompt += `

Other walls:
${B}${hasMarble ? 'Warm off-white or marble-toned finish' : 'Warm off-white neutral plaster finish'}

Floor:
${B}Large-format light stone tile
${B}Minimal grout
${D}
STEP 5 \u2014 ${presetName.toUpperCase()} STYLE DIRECTION

Design principles:
${B}${topTags.slice(0, 3).join(', ')}
${B}Soft diffused lighting (3000K)
${B}Clean lines
${B}Functional simplicity
${B}No clutter
${B}Max 1 folded towel
${B}No decorative objects
${B}No plants
${B}No artwork

Atmosphere: calm, serene, high-end spa aesthetic.
${D}
STEP 6 \u2014 VERIFY BEFORE GENERATING

Confirm internally:
${B}Perspective matches IMAGE 1 exactly
${B}Walls, windows, doors unchanged
${B}${fixtureProducts.length > 0 ? fixtureProducts.map(pf => pf.product.category).join(' and ') + ' scaled realistically' : 'All fixtures scaled realistically'}
${B}Tiles follow wall geometry correctly
${B}No additional architectural changes
${D}
OUTPUT

Generate a photorealistic, magazine-quality ${presetName} bathroom renovation of IMAGE 1 using the specified products.
Return IMAGE only.`;

  const wordCount = prompt.split(/\s+/).filter(w => w.length > 0).length;
  console.log(`[Seedream] Prompt word count: ${wordCount}`);

  return prompt;
};

export const generateSeedreamRenovation = async (params: SeedreamRenderParams): Promise<string> => {
  const apiKey = getFalApiKey();
  if (!apiKey) throw new Error('FAL_KEY is not configured');

  const imageUrls: string[] = [params.bathroomImageUrl];

  const inspirationUrls = (params.inspirationImageUrls || []).filter(url => /^https?:\/\//.test(url)).slice(0, 3);
  imageUrls.push(...inspirationUrls);

  const cappedInspirationCount = inspirationUrls.length;
  const productFigures: { figureIdx: number; product: DatabaseProduct; action: string }[] = [];
  let figureIdx = 1 + cappedInspirationCount + 1;

  for (const product of params.selectedProducts) {
    const action = params.productActions[product.category] || 'replace';
    if (action === 'keep' || action === 'remove') continue;

    const url = product.image_url || (product.images && product.images.length > 0 ? product.images[0] : null);
    if (url && /^https?:\/\//.test(url)) {
      imageUrls.push(url);
      productFigures.push({ figureIdx, product, action });
      figureIdx++;
    }
  }

  if (imageUrls.length > 10) {
    const maxProducts = 10 - 1 - cappedInspirationCount;
    imageUrls.splice(10);
    productFigures.splice(maxProducts);
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
    { inspirationCount: cappedInspirationCount, productFigures }
  );

  console.log(`[Seedream] Sending ${imageUrls.length} images (1 bathroom, ${cappedInspirationCount} inspiration, ${productFigures.length} products), prompt ${prompt.length} chars`);

  const payload = {
    prompt,
    image_urls: imageUrls,
    image_size: 'auto_2K' as const,
    num_images: 1,
    max_images: 1,
    enable_safety_checker: true,
    enhance_prompt_mode: 'standard' as const,
  };

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

  return toDataUrl(outputUrl);
};
