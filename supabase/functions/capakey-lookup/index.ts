import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEOPUNT_BASE = "https://geo.api.vlaanderen.be/geolocation";
const CAPAKEY_BASE = "https://geo.api.vlaanderen.be/capakey/v2";

interface GeopuntLocation {
  FormattedAddress?: string;
  Location?: {
    X_Lambert72?: number;
    Y_Lambert72?: number;
    Lat_WGS84?: number;
    Lon_WGS84?: number;
  };
}

interface GeopuntResponse {
  LocationResult?: GeopuntLocation[];
}

interface CapakeyParcel {
  capakey?: string;
  perceelnummer?: string;
  adres?: string[];
  municipalityName?: string;
  result?: { succes?: boolean; errorMessage?: string };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const address = body?.address;
    if (!address || typeof address !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Missing or invalid 'address' parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmed = address.trim();
    if (trimmed.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "Address must be at least 2 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Geocoding: address → Lambert72 coordinates
    const geocodingUrl = `${GEOPUNT_BASE}/v1/Location?q=${encodeURIComponent(trimmed)}&c=1`;
    const geoRes = await fetch(geocodingUrl);
    if (!geoRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Address lookup service temporarily unavailable. Try again later.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geoData: GeopuntResponse = await geoRes.json();
    const first = geoData?.LocationResult?.[0]?.Location;
    const x = first?.X_Lambert72;
    const y = first?.Y_Lambert72;

    if (x == null || y == null || typeof x !== "number" || typeof y !== "number") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Adres niet gevonden in Vlaanderen. Vul Capakey handmatig in.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Capakey API: coordinates → parcel (capakey)
    const capakeyUrl = `${CAPAKEY_BASE}/parcel?x=${x}&y=${y}&srs=31370`;
    const capaRes = await fetch(capakeyUrl);
    if (!capaRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Capakey opzoeken mislukt. Vul Capakey handmatig in.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const capaData: CapakeyParcel = await capaRes.json();
    if (capaData?.result?.succes === false && capaData.result.errorMessage) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Perceel niet gevonden voor dit adres. Vul Capakey handmatig in.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const capakey = capaData?.capakey;
    if (!capakey || typeof capakey !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Geen Capakey gevonden voor dit adres. Vul handmatig in.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        capakey,
        perceelnummer: capaData.perceelnummer ?? "",
        adres: Array.isArray(capaData.adres) ? capaData.adres.join(", ") : "",
        municipalityName: capaData.municipalityName ?? "",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[capakey-lookup] Error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Er is een fout opgetreden. Probeer opnieuw of vul Capakey handmatig in.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
