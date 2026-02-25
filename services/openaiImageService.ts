import { DatabaseProduct, StyleProfile } from "../types";

const getMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:(.*);base64,/);
  return match ? match[1] : "image/jpeg";
};

const getOpenAIApiKey = (): string => {
  const key = process.env.OPENAI_API_KEY || '';
  if (key) return key;
  try {
    const viteKey = (import.meta as any).env?.VITE_OPENAI_API_KEY;
    if (viteKey) return viteKey;
  } catch {}
  return '';
};

const getOpenAIBaseUrl = (): string => {
  const url = process.env.OPENAI_BASE_URL || '';
  if (url) return url;
  try {
    const viteUrl = (import.meta as any).env?.VITE_OPENAI_BASE_URL;
    if (viteUrl) return viteUrl;
  } catch {}
  return 'https://api.openai.com/v1';
};

const getOpenAIImageModel = (): string => {
  return process.env.OPENAI_IMAGE_MODEL || (import.meta as any).env?.VITE_OPENAI_IMAGE_MODEL || 'gpt-image-1.5';
};

const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || getMimeType(dataUrl) });
};

interface OpenAIRenderParams {
  bathroomBase64: string;
  bathroomMimeType: string;
  prompt: string;
  styleProfile: StyleProfile;
  selectedProducts: DatabaseProduct[];
  productImages: Map<string, { base64: string; mimeType: string }>;
}

export const generateOpenAIRenovation = async ({
  bathroomBase64,
  bathroomMimeType,
  prompt,
  styleProfile,
  selectedProducts,
  productImages,
}: OpenAIRenderParams): Promise<string> => {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const form = new FormData();
  form.append('model', getOpenAIImageModel());
  form.append('prompt', prompt);
  form.append('quality', 'high');
  form.append('size', '1536x1024');
  form.append('output_format', 'jpeg');

  const originalDataUrl = `data:${bathroomMimeType};base64,${bathroomBase64}`;
  form.append('image', await dataUrlToFile(originalDataUrl, 'bathroom-original.jpg'));

  if (styleProfile.referenceImageUrls && styleProfile.referenceImageUrls.length > 0) {
    let refIndex = 0;
    for (const refUrl of styleProfile.referenceImageUrls) {
      if (!refUrl.startsWith('data:')) continue;
      refIndex += 1;
      form.append('image', await dataUrlToFile(refUrl, `style-reference-${refIndex}.jpg`));
    }
  }

  let productIndex = 0;
  for (const product of selectedProducts) {
    const imgData = productImages.get(product.id);
    if (!imgData) continue;
    productIndex += 1;
    const productDataUrl = `data:${imgData.mimeType};base64,${imgData.base64}`;
    form.append('image', await dataUrlToFile(productDataUrl, `product-${productIndex}.jpg`));
  }

  const response = await fetch(`${getOpenAIBaseUrl()}/images/edits`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI image edit failed (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI image edit returned no image');
  return `data:image/jpeg;base64,${b64}`;
};
