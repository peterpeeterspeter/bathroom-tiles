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

    const pageResponse = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept": "text/html",
      },
      redirect: "follow",
    });

    if (!pageResponse.ok) {
      return errorResponse("Failed to fetch Pinterest page", 502);
    }

    const html = await pageResponse.text();

    let imageUrl: string | null = null;

    const ogMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
      || html.match(/content="([^"]+)"\s+(?:property|name)="og:image"/i);
    if (ogMatch) {
      imageUrl = ogMatch[1];
    }

    if (!imageUrl) {
      const imgMatch = html.match(/"images":\s*\{[^}]*"orig":\s*\{\s*"url":\s*"([^"]+)"/);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }
    }

    if (!imageUrl) {
      return errorResponse("Could not extract image from Pinterest page", 422);
    }

    const imgResponse = await fetch(imageUrl, {
      headers: { "Accept": "image/*" },
    });

    if (!imgResponse.ok) {
      return errorResponse("Failed to fetch image", 502);
    }

    const contentType = imgResponse.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imgResponse.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    let binary = "";
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const base64 = btoa(binary);

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
