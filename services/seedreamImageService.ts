import { DatabaseProduct, StyleProfile, ProjectSpec, Fixture, WallSpec, CameraSpec } from "../types";

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

const WALL_LABELS = ['far wall (wall 0)', 'right wall (wall 1)', 'behind camera (wall 2)', 'left wall (wall 3)'];
const WALL_SHORT = ['far', 'right', 'behind camera', 'left'];

const CATEGORY_TO_FIXTURE: Record<string, string> = {
  Vanity: 'SINK', Bathtub: 'BATHTUB', Shower: 'SHOWER', Toilet: 'TOILET',
  Faucet: 'SINK', Mirror: 'SINK', Lighting: 'SINK',
};

const buildCameraLine = (camera?: CameraSpec): string => {
  if (!camera) return '';
  const pos = camera.position.toLowerCase().replace('_', ' ');
  const wall = WALL_SHORT[camera.facingFromWall] || `wall ${camera.facingFromWall}`;
  const lens = camera.lensFeel.toLowerCase().replace('_', ' ');
  return `Camera: ${pos}, facing from ${wall}, ${lens} lens`;
};

const buildWallLines = (walls?: WallSpec[], plumbingWall?: number): string[] => {
  if (!walls || walls.length === 0) return [];
  const out: string[] = [];
  for (const w of walls) {
    const label = WALL_LABELS[w.wallIndex] || `wall ${w.wallIndex}`;
    const parts: string[] = [];
    parts.push(w.visible ? 'visible' : 'not visible');
    if (w.hasPlumbing) parts.push('plumbing');
    if (w.wallIndex === plumbingWall) parts.push('primary plumbing wall');
    for (const a of (w.anchors || [])) {
      parts.push(a.elementType.toLowerCase());
    }
    if (w.features) parts.push(w.features);
    out.push(`- ${label}: ${parts.join(', ')}`);
  }
  return out;
};

const buildFixtureLines = (fixtures?: Fixture[]): string[] => {
  if (!fixtures || fixtures.length === 0) return [];
  return fixtures.map(f => {
    const wall = f.wallIndex !== undefined ? ` on ${WALL_SHORT[f.wallIndex] || 'wall ' + f.wallIndex} wall` : '';
    const cond = f.condition && f.condition !== 'UNKNOWN' ? `, ${f.condition.toLowerCase()}` : '';
    return `- ${f.type}${wall}${cond}`;
  });
};

const getPlacementInstruction = (spec: ProjectSpec | undefined, category: string): string => {
  if (!spec?.existingFixtures) return `Place at plumbing-compatible position nearest original ${category.toLowerCase()} function zone.`;
  const fixtureType = CATEGORY_TO_FIXTURE[category];
  if (!fixtureType) return `Place at plumbing-compatible position nearest original ${category.toLowerCase()} function zone.`;
  const fixture = spec.existingFixtures.find(f => f.type === fixtureType);
  if (!fixture) return `Place at plumbing-compatible position nearest original ${category.toLowerCase()} function zone.`;
  const wallLabel = fixture.wallIndex !== undefined ? WALL_SHORT[fixture.wallIndex] || `wall ${fixture.wallIndex}` : '';
  if (wallLabel) return `Place at existing plumbing-compatible position on ${wallLabel} wall, nearest original ${category.toLowerCase()} function zone.`;
  return `Place at plumbing-compatible position nearest original ${category.toLowerCase()} function zone.`;
};

const buildSeedreamPrompt = (
  params: Omit<SeedreamRenderParams, 'bathroomImageUrl'>,
  imageLayout: { inspirationCount: number; productFigures: { figureIdx: number; product: DatabaseProduct; action: string }[] }
): string => {
  const { styleProfile, productActions, spec, roomNotes } = params;
  const hasInspiration = imageLayout.inspirationCount > 0;
  const L: string[] = [];

  L.push(`ROLE`);
  L.push(`You are a professional architectural image editor specializing in high-fidelity bathroom renovations.`);
  L.push(``);

  L.push(`NON-NEGOTIABLE LOCKS`);
  L.push(`Priority: 1) Geometry/camera locks 2) Plumbing realism + fixture feasibility 3) Product fidelity 4) Materials/style mood`);
  L.push(`IMAGE 1 is the single source of truth for room geometry and perspective.`);
  L.push(`Camera position, angle, lens distortion, wall boundaries, ceiling height, door and window positions must remain identical.`);
  L.push(`Do not move structural elements. Do not add or remove walls, windows, or doors.`);
  L.push(`Only renovate finishes and fixtures.`);
  L.push(`If any instruction conflicts with IMAGE 1, follow IMAGE 1.`);
  L.push(`If an area is not visible in IMAGE 1, do not invent architectural details for it.`);
  L.push(``);

  L.push(`STEP 1 — STUDY THE EXISTING ROOM`);
  L.push(``);
  L.push(`Carefully analyze IMAGE 1. Identify camera viewpoint, wall layout, floor layout, plumbing wall, natural light direction, existing fixture placement.`);
  L.push(``);

  if (spec) {
    L.push(`Room analysis:`);
    const cameraLine = buildCameraLine(spec.camera);
    if (cameraLine) L.push(`- ${cameraLine}`);
    L.push(`- Dimensions: ${spec.estimatedWidthMeters}m × ${spec.estimatedLengthMeters}m, ${spec.ceilingHeightMeters}m ceiling, ${spec.layoutShape === 'L_SHAPE' ? 'L-shaped' : spec.layoutShape.toLowerCase()}`);
    if (spec.primaryLightDirection) L.push(`- Natural light: from ${spec.primaryLightDirection.toLowerCase()}`);
    if (spec.plumbingWall !== undefined) L.push(`- Primary plumbing: ${WALL_SHORT[spec.plumbingWall] || 'wall ' + spec.plumbingWall} wall`);

    const wallLines = buildWallLines(spec.walls, spec.plumbingWall);
    if (wallLines.length > 0) {
      L.push(`Walls:`);
      L.push(...wallLines);
    }

    const fixtureLines = buildFixtureLines(spec.existingFixtures);
    if (fixtureLines.length > 0) {
      L.push(`Existing fixtures:`);
      L.push(...fixtureLines);
    }

    if (spec.occlusions && spec.occlusions.length > 0) {
      L.push(`Occluded/not visible: ${spec.occlusions.join(', ')}`);
    }

    L.push(``);
  }

  L.push(`This viewpoint must remain unchanged.`);
  L.push(``);

  L.push(`STEP 2 — STRIP TO SHELL`);
  L.push(``);
  L.push(`Mentally remove:`);
  const removeList: string[] = ['Existing tiles', 'Decorative elements'];
  const categories = ['Vanity', 'Bathtub', 'Shower', 'Toilet', 'Faucet', 'Mirror', 'Lighting'];
  for (const cat of categories) {
    const action = productActions[cat] || 'replace';
    if (action !== 'keep') removeList.push(`Existing ${cat.toLowerCase()}`);
  }
  for (const item of removeList) L.push(`- ${item}`);
  L.push(``);

  const keepItems: string[] = [];
  for (const cat of categories) {
    if (productActions[cat] === 'keep') keepItems.push(cat.toLowerCase());
  }
  L.push(`Keep:`);
  L.push(`- Same room shape, layout, plumbing locations, perspective`);
  if (keepItems.length > 0) L.push(`- Existing ${keepItems.join(', ')} exactly as in IMAGE 1`);
  L.push(``);

  L.push(`STEP 3 — PLACE NEW FIXTURES (USE PRODUCT REFERENCES EXACTLY)`);
  L.push(``);

  let productNum = 1;
  for (const pf of imageLayout.productFigures) {
    const p = pf.product;
    const desc = p.description || '';
    const placement = getPlacementInstruction(spec, p.category);

    L.push(`PRODUCT ${productNum} — ${p.brand} ${p.name}`);
    L.push(``);
    L.push(`Use PRODUCT ${productNum} (Figure ${pf.figureIdx}) exactly as reference:`);
    if (desc) L.push(`${desc}`);
    L.push(`Match its exact color, shape, material, and finish.`);
    L.push(`${placement}`);
    L.push(`Maintain realistic scale and plumbing alignment. Do not change room proportions to fit — scale correctly.`);
    L.push(``);
    productNum++;
  }

  const textOnlyReplacements: string[] = [];
  const removeCategories: string[] = [];
  for (const cat of [...categories, 'Tile']) {
    const action = productActions[cat] || 'replace';
    const hasProductFigure = imageLayout.productFigures.some(pf => pf.product.category === cat);
    if (hasProductFigure || action === 'keep') continue;
    if (action === 'remove') {
      removeCategories.push(cat.toLowerCase());
    } else if (action === 'replace') {
      textOnlyReplacements.push(cat.toLowerCase());
    }
  }
  if (textOnlyReplacements.length > 0) {
    L.push(`Replace with modern alternatives matching the renovation style: ${textOnlyReplacements.join(', ')}.`);
    L.push(``);
  }

  L.push(`STEP 4 — APPLY MATERIALS AND FINISHES`);
  L.push(``);

  const tileProduct = imageLayout.productFigures.find(pf => pf.product.category === 'Tile');
  const topTags = styleProfile.tags.slice(0, 8).map(t => t.tag);
  if (tileProduct) {
    const tpIdx = imageLayout.productFigures.indexOf(tileProduct) + 1;
    const tp = tileProduct.product;
    L.push(`PRODUCT ${tpIdx} — ${tp.brand} ${tp.name}`);
    if (tp.description) L.push(`${tp.description}`);
    L.push(`Apply as feature wall behind vanity or wet zone only.`);
    L.push(`Do not change wall dimensions.`);
    L.push(``);
  } else {
    const tileAction = productActions['Tile'] || 'replace';
    if (tileAction === 'replace') {
      const tileTags = topTags.filter(t => /tile|marble|stone|ceramic|zellige|pattern|texture/i.test(t));
      if (tileTags.length > 0) {
        L.push(`Feature wall tiles (wet zone only): ${tileTags.join(', ')}.`);
      } else {
        L.push(`Feature wall tiles (wet zone only): modern tiles matching the renovation style.`);
      }
      L.push(`Do not change wall dimensions.`);
      L.push(``);
    }
  }

  L.push(`Other surfaces:`);
  const hasMarble = topTags.some(t => /marble/i.test(t));
  if (hasMarble) {
    L.push(`- Non-feature walls: warm off-white plaster, marble accents on wet zone only`);
  } else {
    L.push(`- Non-feature walls: warm off-white or neutral plaster finish`);
  }
  L.push(`- Floor: large-format light stone or neutral tile, minimal grout`);
  L.push(``);

  if (removeCategories.length > 0) {
    L.push(`Remove completely: ${removeCategories.join(', ')}. Fill space seamlessly with matching wall/floor material.`);
    L.push(``);
  }

  L.push(`STEP 5 — STYLE DIRECTION`);
  L.push(``);

  const presetName = styleProfile.presetName || 'Modern';
  L.push(`Primary style: ${presetName}`);
  L.push(`${styleProfile.summary}`);
  L.push(``);

  if (hasInspiration) {
    if (imageLayout.inspirationCount === 1) {
      L.push(`Use Figure 2 as additional aesthetic reference.`);
    } else {
      const figs = Array.from({ length: imageLayout.inspirationCount }, (_, i) => `Figure ${i + 2}`).join(', ');
      L.push(`Use ${figs} as additional aesthetic references.`);
    }
    L.push(``);
  }

  L.push(`Design principles:`);
  L.push(`- ${topTags.slice(0, 4).join(', ')}`);
  L.push(`- Soft diffused lighting (3000K)`);
  L.push(`- Clean lines, functional simplicity`);
  L.push(`- No clutter, max 1 folded towel`);
  L.push(`- No decorative objects, no plants, no artwork`);
  L.push(``);

  if (styleProfile.moodDescription) {
    L.push(`Homeowner accents (secondary to style direction): "${styleProfile.moodDescription}"`);
    L.push(``);
  }
  if (roomNotes) {
    L.push(`Homeowner notes: ${roomNotes}`);
    L.push(``);
  }

  L.push(`Atmosphere: calm, serene, high-end spa aesthetic.`);
  L.push(``);

  L.push(`STEP 6 — VERIFY BEFORE GENERATING`);
  L.push(``);
  L.push(`Confirm internally:`);
  L.push(`- Perspective matches IMAGE 1 exactly`);
  L.push(`- Walls, windows, doors unchanged`);
  L.push(`- All fixtures scaled realistically to room proportions`);
  L.push(`- Tiles follow wall geometry correctly`);
  L.push(`- No additional architectural changes`);
  L.push(`- No invented details in occluded areas`);
  L.push(``);

  L.push(`OUTPUT`);
  L.push(``);
  L.push(`Generate a photorealistic, magazine-quality ${presetName} bathroom renovation of IMAGE 1 using the specified products.`);
  L.push(`If all constraints cannot be satisfied simultaneously, prefer minimal faithful edit preserving IMAGE 1 geometry.`);
  L.push(`Return IMAGE only.`);

  if (imageLayout.productFigures.length > 0) {
    L.push(``);
    L.push(`IMAGE MAP`);
    L.push(`IMAGE 1 = bathroom photo`);
    for (let i = 0; i < imageLayout.productFigures.length; i++) {
      const pf = imageLayout.productFigures[i];
      L.push(`PRODUCT ${i + 1} = Figure ${pf.figureIdx} (${pf.product.brand} ${pf.product.name})`);
    }
  }

  return L.join('\n');
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
