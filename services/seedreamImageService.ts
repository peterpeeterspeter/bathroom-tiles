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

const buildSeedreamPrompt = (
  params: Omit<SeedreamRenderParams, 'bathroomImageUrl'>,
  imageLayout: { inspirationCount: number; productFigures: { figureIdx: number; product: DatabaseProduct; action: string }[] }
): string => {
  const { styleProfile, productActions, spec, roomNotes } = params;

  const hasInspiration = imageLayout.inspirationCount > 0;
  const hasProducts = imageLayout.productFigures.length > 0;

  const lines: string[] = [];

  lines.push(`Photorealistic interior renovation of Figure 1's bathroom. Shot on a medium format digital camera, natural window light, warm 3000K color temperature, soft directional shadows, architectural photography with shallow depth of field on foreground fixtures.`);
  lines.push(``);

  if (hasInspiration) {
    const inspEnd = 1 + imageLayout.inspirationCount;
    if (imageLayout.inspirationCount === 1) {
      lines.push(`Apply the style, material palette, and design language visible in Figure 2 to Figure 1's bathroom. Transform Figure 1 to match Figure 2's aesthetic while preserving Figure 1's exact room geometry, walls, windows, doors, ceiling, and camera perspective.`);
    } else {
      const figs = Array.from({ length: imageLayout.inspirationCount }, (_, i) => `Figure ${i + 2}`).join(', ');
      lines.push(`Apply the combined style, material palette, and design language visible in ${figs} to Figure 1's bathroom. Transform Figure 1 to match that aesthetic while preserving Figure 1's exact room geometry, walls, windows, doors, ceiling, and camera perspective.`);
    }
    lines.push(``);
  }

  if (hasProducts) {
    for (const pf of imageLayout.productFigures) {
      const catLabel = pf.product.category.toLowerCase();
      if (pf.action === 'add') {
        lines.push(`Install Figure ${pf.figureIdx} (${pf.product.brand} ${pf.product.name}) as the new ${catLabel} — match its exact color, shape, material, and finish.`);
      } else {
        lines.push(`Replace the existing ${catLabel} in Figure 1 with Figure ${pf.figureIdx} (${pf.product.brand} ${pf.product.name}) — match its exact color, shape, material, and finish.`);
      }
    }
    lines.push(``);
  }

  const categories = ['Tile', 'Vanity', 'Toilet', 'Faucet', 'Shower', 'Bathtub', 'Mirror', 'Lighting'];
  const keepItems: string[] = [];
  const removeItems: string[] = [];
  for (const cat of categories) {
    const action = productActions[cat] || 'replace';
    const hasProductFigure = imageLayout.productFigures.some(pf => pf.product.category === cat);
    if (hasProductFigure) continue;
    if (action === 'keep') {
      keepItems.push(cat.toLowerCase());
    } else if (action === 'remove') {
      removeItems.push(cat.toLowerCase());
    } else if (action === 'replace') {
      lines.push(`Replace the ${cat.toLowerCase()} with a modern alternative matching the renovation style.`);
    }
  }
  if (keepItems.length > 0) {
    lines.push(`Keep the existing ${keepItems.join(', ')} exactly as they appear in Figure 1.`);
  }
  if (removeItems.length > 0) {
    lines.push(`Remove the ${removeItems.join(', ')} and seamlessly fill the space with matching wall and floor material.`);
  }
  lines.push(``);

  const presetDesc = styleProfile.presetName
    ? `${styleProfile.presetName} style: ${styleProfile.summary}`
    : styleProfile.summary;
  const topTags = styleProfile.tags.slice(0, 8).map(t => t.tag).join(', ');
  lines.push(`Design direction: ${presetDesc}`);
  lines.push(`Material palette: ${topTags}.`);
  if (styleProfile.moodDescription) {
    lines.push(`Homeowner's vision: "${styleProfile.moodDescription.slice(0, 250)}"`);
  }
  lines.push(``);

  if (spec?.naturalDescription) {
    lines.push(`Room context: ${spec.naturalDescription.slice(0, 400)}`);
    lines.push(``);
  } else if (spec) {
    lines.push(`Room: approximately ${spec.estimatedWidthMeters}m × ${spec.estimatedLengthMeters}m, ${spec.ceilingHeightMeters}m ceiling, ${spec.layoutShape === 'L_SHAPE' ? 'L-shaped' : spec.layoutShape.toLowerCase()} layout.`);
    lines.push(``);
  }

  if (roomNotes) {
    lines.push(`Homeowner notes: ${roomNotes.slice(0, 200)}`);
    lines.push(``);
  }

  lines.push(`Constraints: preserve all walls, windows, doors, ceiling structure, and camera angle from Figure 1. Do not add architectural features not present in Figure 1. Do not add plants, candles, art, or decorative objects. Add 1-2 neutral towels on a rail. Magazine-quality interior photography.`);

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
