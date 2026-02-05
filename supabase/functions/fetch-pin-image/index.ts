import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function uint8ToBase64(bytes: Uint8Array): string {
  const CHUNK = 0x8000;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    parts.push(String.fromCharCode(...bytes.subarray(i, i + CHUNK)));
  }
  return btoa(parts.join(""));
}

function extractImageUrl(html: string): string | null {
  const patterns = [
    /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    /<meta\s+content="([^"]+)"\s+property="og:image"/i,
    /<meta\s+name="og:image"\s+content="([^"]+)"/i,
    /"image_large_url"\s*:\s*"([^"]+)"/,
    /"images"[\s\S]*?"orig"[\s\S]*?"url"\s*:\s*"([^"]+)"/,
    /"imageSpec_orig"\s*:\s*\{\s*"url"\s*:\s*"([^"]+)"/,
    /data-test-id="pin-closeup-image"[^>]*src="([^"]+)"/i,
    /<img[^>]+src="(https:\/\/i\.pinimg\.com\/[^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      let url = match[1].replace(/\\u002F/g, "/").replace(/\\\//g, "/");
      if (url.includes("pinimg.com")) return url;
    }
  }

  const pinimgMatch = html.match(/https:\/\/i\.pinimg\.com\/[^\s"'\\]+/);
  if (pinimgMatch) return pinimgMatch[0];

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return errorResponse("Missing or invalid 'url' parameter", 400);
    }

    const isPinterest = /pinterest\.(com|co\.\w+)|pin\.it/i.test(url);
    if (!isPinterest) {
      return errorResponse("URL must be a Pinterest link", 400);
    }

    const userAgents = [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ];

    let imageUrl: string | null = null;

    for (const ua of userAgents) {
      if (imageUrl) break;

      try {
        const pageResponse = await fetch(url, {
          headers: {
            "User-Agent": ua,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
          redirect: "follow",
        });

        if (!pageResponse.ok) continue;

        const html = await pageResponse.text();
        imageUrl = extractImageUrl(html);
      } catch {
        continue;
      }
    }

    if (!imageUrl) {
      return errorResponse("Could not extract image from Pinterest page. Try uploading the image directly instead.", 422);
    }

    const imgResponse = await fetch(imageUrl, {
      headers: {
        "Accept": "image/*",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!imgResponse.ok) {
      return errorResponse("Failed to fetch the image. Try uploading the image directly instead.", 502);
    }

    const contentType = imgResponse.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imgResponse.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const base64 = uint8ToBase64(uint8);

    return new Response(
      JSON.stringify({
        image_url: imageUrl,
        base64,
        mime_type: contentType,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return errorResponse("Internal error: " + String(err), 500);
  }
});
