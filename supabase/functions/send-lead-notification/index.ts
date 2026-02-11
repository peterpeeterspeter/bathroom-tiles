import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productsHtml = payload.products
      ? Object.entries(payload.products)
          .map(
            ([category, detail]: [string, any]) =>
              `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${category}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${detail.brand} ${detail.name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${detail.price_tier || "-"}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">EUR ${detail.price_low || "?"} - ${detail.price_high || "?"}</td>
          </tr>`
          )
          .join("")
      : '<tr><td colspan="4">Geen producten geselecteerd</td></tr>';

    let imagesHtml = "";
    if (payload.originalPhotoUrl) {
      imagesHtml += `<p><a href="${payload.originalPhotoUrl}" style="color:#0066cc">Bekijk originele foto</a></p>`;
    }
    if (payload.renderImageUrl) {
      imagesHtml += `<p><a href="${payload.renderImageUrl}" style="color:#0066cc">Bekijk AI render</a></p>`;
    }

    const timelineLabels: Record<string, string> = {
      "1_month": "Binnen 1 maand",
      "1_3_months": "Binnen 1-3 maanden",
      "3_6_months": "Binnen 3-6 maanden",
      exploring: "Aan het verkennen",
    };

    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#000;color:#fff;padding:24px;text-align:center">
          <h1 style="margin:0;font-size:24px">De Badkamer</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#999">NIEUW LEAD — AI PLANNER</p>
        </div>

        <div style="padding:24px;background:#f9f9f9">
          <h2 style="color:#333;font-size:18px;margin:0 0 16px">Contactgegevens</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;font-weight:bold;width:120px">Naam:</td><td>${payload.name}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold">E-mail:</td><td><a href="mailto:${payload.email}">${payload.email}</a></td></tr>
            <tr><td style="padding:6px 0;font-weight:bold">Telefoon:</td><td><a href="tel:${payload.phone}">${payload.phone}</a></td></tr>
            <tr><td style="padding:6px 0;font-weight:bold">Postcode:</td><td>${payload.postcode}</td></tr>
            ${payload.preferredTimeline ? `<tr><td style="padding:6px 0;font-weight:bold">Planning:</td><td>${timelineLabels[payload.preferredTimeline] || payload.preferredTimeline}</td></tr>` : ""}
          </table>
        </div>

        <div style="padding:24px">
          <h2 style="color:#333;font-size:18px;margin:0 0 16px">Project Details</h2>

          <h3 style="font-size:14px;color:#666;margin:16px 0 8px">Stijl</h3>
          <p style="margin:0">${payload.styleName || "Niet geselecteerd"}</p>
          ${payload.styleSummary ? `<p style="color:#666;font-size:13px;margin:4px 0 0">${payload.styleSummary}</p>` : ""}

          <h3 style="font-size:14px;color:#666;margin:16px 0 8px">Ruimte</h3>
          <p style="margin:0">${payload.roomWidth || "?"}m x ${payload.roomLength || "?"}m = ${payload.roomArea || "?"} m&sup2;</p>

          <h3 style="font-size:14px;color:#666;margin:16px 0 8px">Productkeuzes</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <tr style="background:#f0f0f0">
              <th style="padding:8px;text-align:left">Categorie</th>
              <th style="padding:8px;text-align:left">Product</th>
              <th style="padding:8px;text-align:left">Tier</th>
              <th style="padding:8px;text-align:left">Prijs</th>
            </tr>
            ${productsHtml}
          </table>

          <h3 style="font-size:14px;color:#666;margin:16px 0 8px">Investering</h3>
          <p style="margin:0;font-size:20px;font-weight:bold">EUR ${payload.estimateLow || "?"} &mdash; EUR ${payload.estimateHigh || "?"}</p>

          <h3 style="font-size:14px;color:#666;margin:16px 0 8px">Lead Score</h3>
          <p style="margin:0;font-size:20px;font-weight:bold">${payload.leadScore || 0} / 100</p>

          ${imagesHtml ? `<h3 style="font-size:14px;color:#666;margin:16px 0 8px">Afbeeldingen</h3>${imagesHtml}` : ""}
        </div>

        <div style="padding:16px 24px;background:#f0f0f0;font-size:11px;color:#999;text-align:center">
          DeBadkamer.com &mdash; Automatische lead notificatie
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "De Badkamer <noreply@debadkamer.com>",
        to: ["peterpeeterspeter@gmail.com"],
        subject: `Nieuw Lead: ${payload.name} — ${payload.postcode} — EUR ${payload.estimateLow || "?"}+`,
        html: emailHtml,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: res.ok ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
