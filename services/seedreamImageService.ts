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

const buildSeedreamPrompt = (
  params: Omit<SeedreamRenderParams, 'bathroomImageUrl'>,
  imageLayout: { inspirationCount: number; productFigures: { figureIdx: number; product: DatabaseProduct; action: string }[] }
): string => {
  const { styleProfile, productActions, spec } = params;
  const presetName = styleProfile.presetName || 'Modern';
  const topTags = styleProfile.tags.slice(0, 4).map(t => t.tag);
  const fixtureProducts = imageLayout.productFigures.filter(pf => pf.product.category !== 'Tile');
  const tileProduct = imageLayout.productFigures.find(pf => pf.product.category === 'Tile');
  const keepCategories = ['Vanity', 'Bathtub', 'Shower', 'Toilet', 'Faucet', 'Mirror', 'Lighting']
    .filter(c => productActions[c] === 'keep');

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

    productLines += `
\u2022 ${cat} = Image ${imgNum}
  ${placeLine}
  Scale realistically to room size.
`;
  }

  let materialLines = '';
  if (tileProduct) {
    materialLines += `- Apply Image ${tileProduct.figureIdx} as feature wall tile behind vanity or bathtub.\n`;
  } else {
    const tileTags = topTags.filter(t => /tile|marble|stone|ceramic|zellige/i.test(t));
    if (tileTags.length > 0) {
      materialLines += `- Replace wall tiles with ${tileTags.join(', ')}.\n`;
    } else {
      materialLines += `- Replace wall tiles with modern tiles matching the style.\n`;
    }
  }
  const hasMarble = topTags.some(t => /marble/i.test(t));
  materialLines += `- ${hasMarble ? 'Warm off-white or marble-toned' : 'Smooth warm plaster on non-tiled'} walls.\n`;
  materialLines += `- Large-format neutral floor tiles.\n`;

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
Do not move or resize architectural elements.${keepCategories.length > 0 ? `\nKeep existing ${keepCategories.join(', ').toLowerCase()} unchanged.` : ''}

${SEP}

PRODUCT REPLACEMENTS

Use reference images exactly for design only:
${productLines}
Do not move fixtures to different walls.

${SEP}

STYLE REDESIGN (SURFACE LEVEL ONLY)

Apply the user\u2019s style preference as material and mood only.
Do NOT change layout.

Style direction:
${presetName}. ${topTags.join('. ')}.
Soft diffused 3000K lighting.
Minimal and calm atmosphere.

Material updates:
${materialLines}
Maximum 1 folded towel.
No plants. No artwork. No decorative clutter.

${SEP}

CRITICAL CONSTRAINTS

The result must clearly be the SAME bathroom as Image 1.
Only improved finishes and updated fixtures.
No layout redesign.
No perspective change.
No structural alteration.

Photorealistic.
Magazine-quality.
Return image only.`;

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
