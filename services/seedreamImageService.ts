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
  const { styleProfile, productActions, spec, roomNotes } = params;
  const hasInspiration = imageLayout.inspirationCount > 0;
  const presetName = styleProfile.presetName || 'Modern';
  const lines: string[] = [];

  const B = '\t•\t';
  const DIV = '\n\u2E3B\n';

  lines.push(`ROLE`);
  lines.push(`You are a professional architectural image editor specializing in high-fidelity bathroom renovations.`);
  lines.push(DIV);

  lines.push(`\u{1F512} NON-NEGOTIABLE LOCKS`);
  lines.push(`${B}IMAGE 1 is the single source of truth for room geometry and perspective.`);
  lines.push(`${B}Camera position, angle, lens distortion, wall boundaries, ceiling height, door and window positions must remain identical.`);
  lines.push(`${B}Do not move structural elements.`);
  lines.push(`${B}Do not add or remove walls, windows, or doors.`);
  lines.push(`${B}Only renovate finishes and fixtures.`);
  lines.push(``);
  lines.push(`If any instruction conflicts with IMAGE 1, follow IMAGE 1.`);
  lines.push(DIV);

  lines.push(`STEP 1 — STUDY THE EXISTING ROOM`);
  lines.push(``);
  lines.push(`Carefully analyze IMAGE 1.`);
  lines.push(`Identify:`);
  lines.push(`${B}Exact camera viewpoint`);
  lines.push(`${B}Wall layout`);
  lines.push(`${B}Floor layout`);
  lines.push(`${B}Plumbing wall`);
  lines.push(`${B}Natural light direction`);
  lines.push(`${B}Existing fixture placement`);
  lines.push(``);
  lines.push(`This viewpoint must remain unchanged.`);
  lines.push(DIV);

  lines.push(`STEP 2 — STRIP TO SHELL`);
  lines.push(``);
  lines.push(`Mentally remove:`);
  const removeList: string[] = ['Existing tiles', 'Decorative elements'];
  const categories = ['Vanity', 'Bathtub', 'Shower', 'Toilet', 'Faucet', 'Mirror', 'Lighting'];
  for (const cat of categories) {
    const action = productActions[cat] || 'replace';
    if (action !== 'keep') {
      removeList.push(`Existing ${cat.toLowerCase()}`);
    }
  }
  for (const item of removeList) {
    lines.push(`${B}${item}`);
  }
  lines.push(``);

  const keepItems: string[] = [];
  for (const cat of categories) {
    if (productActions[cat] === 'keep') keepItems.push(cat.toLowerCase());
  }
  lines.push(`Keep:`);
  lines.push(`${B}Same room shape`);
  lines.push(`${B}Same layout`);
  lines.push(`${B}Same plumbing locations`);
  lines.push(`${B}Same perspective`);
  if (keepItems.length > 0) {
    lines.push(`${B}Existing ${keepItems.join(', ')} exactly as in IMAGE 1`);
  }
  lines.push(DIV);

  lines.push(`STEP 3 — PLACE NEW FIXTURES (USE PRODUCT REFERENCES EXACTLY)`);
  lines.push(``);

  const fixtureProducts = imageLayout.productFigures.filter(pf => pf.product.category !== 'Tile');
  const tileProduct = imageLayout.productFigures.find(pf => pf.product.category === 'Tile');

  let productNum = 1;
  for (const pf of fixtureProducts) {
    const p = pf.product;
    const emoji = CATEGORY_EMOJI[p.category] || '';
    const placement = getFixturePlacement(spec, p.category);

    lines.push(`${emoji} PRODUCT ${productNum} — ${p.name}`);
    lines.push(``);
    lines.push(`Use PRODUCT ${productNum} exactly as reference:`);
    if (placement) {
      lines.push(`${placement}`);
    } else if (pf.action === 'add') {
      lines.push(`Install in the most logical location based on room layout in IMAGE 1.`);
    } else {
      lines.push(`Place where the original ${p.category.toLowerCase()} existed in IMAGE 1.`);
    }
    lines.push(`Maintain realistic scale and plumbing alignment.`);
    lines.push(``);
    lines.push(`Do not change room proportions to fit it — scale correctly.`);
    lines.push(``);
    productNum++;
  }

  const removeCategories: string[] = [];
  for (const cat of [...categories, 'Tile']) {
    const action = productActions[cat] || 'replace';
    const hasProductFigure = imageLayout.productFigures.some(pf => pf.product.category === cat);
    if (hasProductFigure || action === 'keep') continue;
    if (action === 'remove') {
      removeCategories.push(cat.toLowerCase());
    }
  }
  lines.push(DIV);

  lines.push(`STEP 4 — APPLY MATERIALS`);
  lines.push(``);

  const topTags = styleProfile.tags.slice(0, 8).map(t => t.tag);
  if (tileProduct) {
    const tp = tileProduct.product;
    const tileEmoji = CATEGORY_EMOJI['Tile'] || '';
    lines.push(`${tileEmoji} PRODUCT ${productNum} — ${tp.name}`);
    lines.push(``);
    lines.push(`Use PRODUCT ${productNum} exactly as reference:`);
    lines.push(`${B}Apply as feature wall behind vanity OR bathtub`);
    lines.push(`${B}Match the exact tile pattern, color, and texture from the product image`);
    lines.push(``);
    lines.push(`Do not change wall dimensions.`);
    lines.push(``);
  } else {
    const tileAction = productActions['Tile'] || 'replace';
    if (tileAction === 'replace') {
      const hasTileTags = topTags.some(t => /tile|marble|stone|ceramic|zellige/i.test(t));
      if (hasTileTags) {
        const tileTags = topTags.filter(t => /tile|marble|stone|ceramic|zellige|pattern|texture/i.test(t)).join(', ');
        lines.push(`Wall tiles: replace with ${tileTags || 'modern tiles matching the renovation style'}.`);
      } else {
        lines.push(`Wall tiles: replace with modern tiles matching the renovation style.`);
      }
      lines.push(`Do not change wall dimensions.`);
      lines.push(``);
    }
  }

  lines.push(`Other walls:`);
  const hasMarble = topTags.some(t => /marble/i.test(t));
  const hasNeutral = topTags.some(t => /neutral|warm|soft/i.test(t));
  if (hasMarble) {
    lines.push(`${B}Warm off-white or marble-toned finish`);
  } else if (hasNeutral) {
    lines.push(`${B}Warm off-white or neutral plaster finish`);
  } else {
    lines.push(`${B}Clean neutral finish matching the style direction`);
  }
  lines.push(``);
  lines.push(`Floor:`);
  lines.push(`${B}Large-format light stone or neutral tile`);
  lines.push(`${B}Minimal grout`);
  lines.push(``);

  if (removeCategories.length > 0) {
    lines.push(`Remove completely: ${removeCategories.join(', ')}. Fill the space seamlessly with matching wall/floor material.`);
    lines.push(``);
  }
  lines.push(DIV);

  lines.push(`STEP 5 — ${presetName.toUpperCase()} STYLE DIRECTION`);
  lines.push(``);

  lines.push(`Design principles:`);
  lines.push(`${B}${topTags.slice(0, 4).join(', ')}`);
  lines.push(`${B}Soft diffused lighting (3000K)`);
  lines.push(`${B}Clean lines, functional simplicity`);
  lines.push(`${B}No clutter`);
  lines.push(`${B}Max 1 folded towel`);
  lines.push(`${B}No decorative objects`);
  lines.push(`${B}No plants`);
  lines.push(`${B}No artwork`);
  lines.push(``);

  if (hasInspiration) {
    if (imageLayout.inspirationCount === 1) {
      lines.push(`Use the style visible in Figure 2 as additional aesthetic reference.`);
    } else {
      const figs = Array.from({ length: imageLayout.inspirationCount }, (_, i) => `Figure ${i + 2}`).join(', ');
      lines.push(`Use the styles visible in ${figs} as additional aesthetic references.`);
    }
    lines.push(``);
  }

  if (styleProfile.moodDescription) {
    lines.push(`Homeowner's vision: "${styleProfile.moodDescription}"`);
    lines.push(``);
  }
  if (roomNotes) {
    lines.push(`Homeowner notes: ${roomNotes}`);
    lines.push(``);
  }

  lines.push(`Atmosphere: calm, serene, high-end spa aesthetic.`);
  lines.push(DIV);

  lines.push(`STEP 6 — VERIFY BEFORE GENERATING`);
  lines.push(``);
  lines.push(`Confirm internally:`);
  const placedCategories = fixtureProducts.map(pf => pf.product.category.toLowerCase());
  lines.push(`${B}Perspective matches IMAGE 1 exactly`);
  lines.push(`${B}Walls, windows, doors unchanged`);
  if (placedCategories.length > 0) {
    lines.push(`${B}${placedCategories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' and ')} scaled realistically`);
  }
  lines.push(`${B}Tiles follow wall geometry correctly`);
  lines.push(`${B}No additional architectural changes`);
  lines.push(DIV);

  lines.push(`OUTPUT`);
  lines.push(``);
  lines.push(`Generate a photorealistic, magazine-quality ${presetName} bathroom renovation of IMAGE 1 using the specified products.`);
  lines.push(`Return IMAGE only.`);

  return lines.join('\n');
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
