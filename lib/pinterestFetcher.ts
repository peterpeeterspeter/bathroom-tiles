const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface PinImage {
  image_url: string;
  base64: string;
  mime_type: string;
}

export async function fetchPinterestImage(pinterestUrl: string): Promise<PinImage> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-pin-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: pinterestUrl }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Failed to fetch pin: ${response.status}`);
  }

  return response.json();
}

export function isPinterestUrl(url: string): boolean {
  return /pinterest\.(com|co\.\w+)|pin\.it/i.test(url);
}
