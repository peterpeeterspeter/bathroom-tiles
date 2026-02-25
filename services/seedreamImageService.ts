import { DatabaseProduct, StyleProfile } from "../types";

interface SeedreamRenderParams {
  bathroomImageUrl: string;
  prompt: string;
  styleProfile: StyleProfile;
  selectedProducts: DatabaseProduct[];
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
  basePrompt: string,
  selectedProducts: DatabaseProduct[]
): string => {
  const productLines = selectedProducts.slice(0, 8).map((product, index) =>
    `- Product ${index + 1}: ${product.brand} ${product.name} (${product.category})`
  ).join('\n');

  return `You are editing Figure 1 (the bathroom source photo).\n` +
    `Keep room geometry, wall openings, camera pose, perspective, and lens feel unchanged.\n` +
    `Use Figure 2+ as style/product references only.\n` +
    `If any instruction conflicts with Figure 1 geometry, prioritize Figure 1.\n` +
    `${productLines ? `Products to match:\n${productLines}\n` : ''}` +
    `Task:\n${basePrompt}`;
};

export const generateSeedreamRenovation = async ({
  bathroomImageUrl,
  prompt,
  styleProfile,
  selectedProducts,
}: SeedreamRenderParams): Promise<string> => {
  const apiKey = getFalApiKey();
  if (!apiKey) throw new Error('FAL_KEY is not configured');

  const imageUrls: string[] = [bathroomImageUrl];

  const styleUrl = (styleProfile.referenceImageUrls || []).find((url) => /^https?:\/\//.test(url));
  if (styleUrl) imageUrls.push(styleUrl);

  const productUrls = selectedProducts
    .map((product) => product.image_url)
    .filter((url): url is string => Boolean(url && /^https?:\/\//.test(url)))
    .slice(0, 8);
  imageUrls.push(...productUrls);

  const payload = {
    prompt: buildSeedreamPrompt(prompt, selectedProducts),
    image_urls: imageUrls,
    image_size: 'auto_2K',
    num_images: 1,
    max_images: 1,
    enable_safety_checker: true,
    enhance_prompt_mode: 'standard',
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

