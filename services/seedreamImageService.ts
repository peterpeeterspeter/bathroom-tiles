import { DatabaseProduct, StyleProfile, ProjectSpec } from "../types";

interface SeedreamRenderParams {
  bathroomImageUrl: string;
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

const CATEGORY_LABELS_NL: Record<string, string> = {
  Tile: 'tiles/wall finish',
  Vanity: 'vanity/sink cabinet',
  Toilet: 'toilet',
  Faucet: 'faucets',
  Shower: 'shower',
  Bathtub: 'bathtub',
  Mirror: 'mirror',
  Lighting: 'lighting',
};

const buildSeedreamPrompt = (
  params: Omit<SeedreamRenderParams, 'bathroomImageUrl'>,
  figureCount: number
): string => {
  const { styleProfile, selectedProducts, productActions, spec, roomNotes } = params;

  const figureRefs: string[] = [];
  let figureIdx = 2;
  for (const product of selectedProducts) {
    const action = productActions[product.category] || 'replace';
    if (action === 'keep' || action === 'remove') continue;
    const catLabel = CATEGORY_LABELS_NL[product.category] || product.category.toLowerCase();
    figureRefs.push(`Figure ${figureIdx}: ${product.brand} ${product.name} — use as reference for the new ${catLabel}`);
    figureIdx++;
  }

  const scopeParts: string[] = [];
  const categories = ['Tile', 'Vanity', 'Toilet', 'Faucet', 'Shower', 'Bathtub', 'Mirror', 'Lighting'];
  for (const cat of categories) {
    const action = productActions[cat] || 'replace';
    const catLabel = CATEGORY_LABELS_NL[cat] || cat.toLowerCase();
    if (action === 'keep') {
      scopeParts.push(`- ${catLabel}: KEEP unchanged`);
    } else if (action === 'remove') {
      scopeParts.push(`- ${catLabel}: REMOVE, fill space with wall/floor material`);
    } else if (action === 'add') {
      const product = selectedProducts.find(p => p.category === cat);
      scopeParts.push(`- ${catLabel}: ADD new ${product ? `(${product.brand} ${product.name})` : ''}`);
    } else {
      const product = selectedProducts.find(p => p.category === cat);
      scopeParts.push(`- ${catLabel}: REPLACE with ${product ? `${product.brand} ${product.name}` : 'modern alternative'}`);
    }
  }

  const presetDesc = styleProfile.presetName
    ? `${styleProfile.presetName}: ${styleProfile.summary}`
    : styleProfile.summary;
  const topTags = styleProfile.tags.slice(0, 6).map(t => t.tag).join(', ');

  const lines: string[] = [
    `Edit Figure 1 (the bathroom photo) into a photorealistic renovated version of the SAME room.`,
    ``,
    `RULES:`,
    `- Keep room geometry, walls, windows, doors, ceiling, camera angle, and perspective from Figure 1 UNCHANGED.`,
    `- Only replace fixtures, tiles, and finishes as specified below.`,
    `- Do NOT add windows, doors, or architectural features that are not in Figure 1.`,
    `- Do NOT add decorative objects (no plants, candles, art, bottles).`,
    ``,
  ];

  if (figureRefs.length > 0) {
    lines.push(`REFERENCE IMAGES:`);
    lines.push(`Figure 1: the original bathroom (ground truth)`);
    for (const ref of figureRefs) {
      lines.push(ref);
    }
    lines.push(`Match each product's color, shape, material, and finish from its reference Figure.`);
    lines.push(``);
  }

  lines.push(`RENOVATION SCOPE:`);
  lines.push(...scopeParts);
  lines.push(``);

  lines.push(`STYLE: ${presetDesc}`);
  lines.push(`Tags: ${topTags}`);
  if (styleProfile.moodDescription) {
    lines.push(`Vision: ${styleProfile.moodDescription.slice(0, 200)}`);
  }
  lines.push(``);

  lines.push(`Apply wall and floor materials matching the style. Warm natural lighting (3000K), soft shadows.`);
  lines.push(`Add 1-2 neutral towels on a rail. Photorealistic, magazine-quality result.`);

  if (roomNotes) {
    lines.push(`Homeowner notes: ${roomNotes.slice(0, 200)}`);
  }

  return lines.join('\n');
};

export const generateSeedreamRenovation = async (params: SeedreamRenderParams): Promise<string> => {
  const apiKey = getFalApiKey();
  if (!apiKey) throw new Error('FAL_KEY is not configured');

  const imageUrls: string[] = [params.bathroomImageUrl];

  const productUrls: string[] = [];
  for (const product of params.selectedProducts) {
    const action = params.productActions[product.category] || 'replace';
    if (action === 'keep' || action === 'remove') continue;

    const url = product.image_url || (product.images && product.images.length > 0 ? product.images[0] : null);
    if (url && /^https?:\/\//.test(url)) {
      productUrls.push(url);
    }
  }
  imageUrls.push(...productUrls.slice(0, 9));

  const prompt = buildSeedreamPrompt(
    {
      styleProfile: params.styleProfile,
      selectedProducts: params.selectedProducts,
      productActions: params.productActions,
      spec: params.spec,
      roomNotes: params.roomNotes,
    },
    imageUrls.length
  );

  console.log(`[Seedream] Sending ${imageUrls.length} images, prompt ${prompt.length} chars`);

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
