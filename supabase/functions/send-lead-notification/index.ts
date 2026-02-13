const escapeHtml = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ACTION_LABELS: Record<string, string> = {
  replace: "Vervangen",
  keep: "Behouden",
  add: "Toevoegen",
  remove: "Verwijderen",
};

const ACTION_COLORS: Record<string, string> = {
  replace: "#e74c3c",
  keep: "#27ae60",
  add: "#3498db",
  remove: "#95a5a6",
};

const CATEGORY_LABELS: Record<string, string> = {
  Bathtub: "Ligbad",
  Shower: "Douche",
  Toilet: "Toilet",
  Vanity: "Wastafelmeubel",
  Mirror: "Spiegel",
  Faucet: "Kraan",
  Tile: "Tegels",
  Lighting: "Verlichting",
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
            <td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${CATEGORY_LABELS[category] || category}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${detail.brand} ${detail.name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${detail.price_tier || "-"}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">EUR ${detail.price_low || "?"} - ${detail.price_high || "?"}</td>
          </tr>`
          )
          .join("")
      : '<tr><td colspan="4" style="padding:8px;color:#999">Geen producten geselecteerd</td></tr>';

    const productActionsHtml = payload.productActions
      ? Object.entries(payload.productActions)
          .map(([category, action]: [string, any]) => {
            const label = ACTION_LABELS[action] || action;
            const color = ACTION_COLORS[action] || "#666";
            const catLabel = CATEGORY_LABELS[category] || category;
            return `<span style="display:inline-block;margin:2px 4px;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold;background:${color}15;color:${color};border:1px solid ${color}30">${catLabel}: ${label}</span>`;
          })
          .join("")
      : "";

    let imagesHtml = "";
    if (payload.originalPhotoUrl) {
      imagesHtml += `<p><a href="${payload.originalPhotoUrl}" style="color:#0d9488;font-weight:bold;text-decoration:none">Bekijk originele foto &rarr;</a></p>`;
    }
    if (payload.renderImageUrl) {
      imagesHtml += `<p><a href="${payload.renderImageUrl}" style="color:#0d9488;font-weight:bold;text-decoration:none">Bekijk AI render &rarr;</a></p>`;
    }

    const timelineLabels: Record<string, string> = {
      "1_month": "Binnen 1 maand",
      "1_3_months": "Binnen 1-3 maanden",
      "3_6_months": "Binnen 3-6 maanden",
      exploring: "Aan het verkennen",
    };

    const complexityLabels: Record<string, string> = {
      eenvoudig: "Eenvoudig",
      gemiddeld: "Gemiddeld",
      complex: "Complex",
    };

    const complexityColors: Record<string, string> = {
      eenvoudig: "#27ae60",
      gemiddeld: "#f39c12",
      complex: "#e74c3c",
    };

    const scoreColor = (payload.leadScore || 0) >= 70 ? "#27ae60" : (payload.leadScore || 0) >= 40 ? "#f39c12" : "#e74c3c";

    const styleTagsHtml = payload.styleTags?.length
      ? payload.styleTags.map((tag: string) =>
          `<span style="display:inline-block;margin:2px;padding:3px 8px;border-radius:10px;font-size:11px;background:#0d948815;color:#0d9488;border:1px solid #0d948830">${tag}</span>`
        ).join("")
      : "";

    const expertHtml = payload.expertAnalysis
      ? `
        ${payload.expertAnalysis.currentState ? `<p style="margin:4px 0;font-size:13px;color:#444"><strong>Huidige staat:</strong> ${payload.expertAnalysis.currentState}</p>` : ""}
        ${payload.expertAnalysis.conditionScore != null ? `<p style="margin:4px 0;font-size:13px;color:#444"><strong>Conditiescore:</strong> ${payload.expertAnalysis.conditionScore}/10</p>` : ""}
        ${payload.expertAnalysis.keepElements?.length ? `<p style="margin:4px 0;font-size:13px;color:#444"><strong>Behouden:</strong> ${payload.expertAnalysis.keepElements.join(", ")}</p>` : ""}
        ${payload.expertAnalysis.opportunities?.length ? `<p style="margin:4px 0;font-size:13px;color:#444"><strong>Kansen:</strong> ${payload.expertAnalysis.opportunities.join(", ")}</p>` : ""}
        ${payload.expertAnalysis.recommendations?.length ? `<p style="margin:4px 0;font-size:13px;color:#444"><strong>Aanbevelingen:</strong> ${payload.expertAnalysis.recommendations.join(", ")}</p>` : ""}
        ${payload.expertAnalysis.layoutAdvice ? `<p style="margin:4px 0;font-size:13px;color:#444"><strong>Indelingsadvies:</strong> ${payload.expertAnalysis.layoutAdvice}</p>` : ""}
      `
      : "";

    const emailHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff">
        <div style="background:#0d9488;color:#fff;padding:28px 24px;text-align:center">
          <h1 style="margin:0;font-size:26px;letter-spacing:1px">De Badkamer</h1>
          <p style="margin:6px 0 0;font-size:13px;color:#b2dfdb;text-transform:uppercase;letter-spacing:2px">Nieuw Lead — AI Planner</p>
        </div>

        <div style="padding:24px;background:#f8fffe;border-bottom:1px solid #e0f2f1">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <h2 style="color:#0d9488;font-size:20px;margin:0 0 4px">${payload.name}</h2>
              <p style="margin:0;color:#666;font-size:14px">${payload.postcode} &bull; Score: <strong style="color:${scoreColor}">${payload.leadScore || 0}/100</strong></p>
            </div>
            ${payload.estimatedComplexity ? `<span style="display:inline-block;padding:6px 14px;border-radius:16px;font-size:12px;font-weight:bold;background:${complexityColors[payload.estimatedComplexity] || '#666'}15;color:${complexityColors[payload.estimatedComplexity] || '#666'};border:1px solid ${complexityColors[payload.estimatedComplexity] || '#666'}30">${complexityLabels[payload.estimatedComplexity] || payload.estimatedComplexity}</span>` : ""}
          </div>
        </div>

        <div style="padding:20px 24px;border-bottom:1px solid #eee">
          <h3 style="color:#333;font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Contactgegevens</h3>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:5px 0;font-weight:bold;width:130px;color:#555;font-size:13px">E-mail:</td><td style="font-size:13px"><a href="mailto:${payload.email}" style="color:#0d9488">${payload.email}</a></td></tr>
            <tr><td style="padding:5px 0;font-weight:bold;color:#555;font-size:13px">Telefoon:</td><td style="font-size:13px"><a href="tel:${payload.phone}" style="color:#0d9488">${payload.phone}</a></td></tr>
            <tr><td style="padding:5px 0;font-weight:bold;color:#555;font-size:13px">Postcode:</td><td style="font-size:13px">${payload.postcode}</td></tr>
            ${payload.preferredTimeline ? `<tr><td style="padding:5px 0;font-weight:bold;color:#555;font-size:13px">Planning:</td><td style="font-size:13px">${timelineLabels[payload.preferredTimeline] || payload.preferredTimeline}</td></tr>` : ""}
          </table>
        </div>

        ${payload.moodDescription || payload.roomNotes ? `
        <div style="padding:20px 24px;border-bottom:1px solid #eee">
          <h3 style="color:#333;font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Klant in eigen woorden</h3>
          ${payload.moodDescription ? `
            <div style="margin-bottom:12px">
              <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#0d9488;text-transform:uppercase;letter-spacing:1px">Stijlwensen</p>
              <div style="background:#f0fdfa;border-left:3px solid #0d9488;padding:10px 14px;border-radius:0 8px 8px 0">
                <p style="margin:0;font-size:13px;color:#333;line-height:1.5;font-style:italic">"${escapeHtml(payload.moodDescription)}"</p>
              </div>
            </div>
          ` : ""}
          ${payload.roomNotes ? `
            <div>
              <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#0d9488;text-transform:uppercase;letter-spacing:1px">Opmerkingen over de ruimte</p>
              <div style="background:#fef9f0;border-left:3px solid #f39c12;padding:10px 14px;border-radius:0 8px 8px 0">
                <p style="margin:0;font-size:13px;color:#333;line-height:1.5;font-style:italic">"${escapeHtml(payload.roomNotes)}"</p>
              </div>
            </div>
          ` : ""}
        </div>
        ` : ""}

        <div style="padding:20px 24px;border-bottom:1px solid #eee">
          <h3 style="color:#333;font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Stijlprofiel</h3>
          <p style="margin:0 0 8px;font-size:13px;color:#444"><strong>${payload.styleName || "Niet geselecteerd"}</strong></p>
          ${payload.styleSummary ? `<p style="color:#666;font-size:13px;margin:0 0 10px;line-height:1.5">${payload.styleSummary}</p>` : ""}
          ${styleTagsHtml ? `<div style="margin-top:8px">${styleTagsHtml}</div>` : ""}
          ${payload.inspirationImageCount > 0 ? `<p style="margin:8px 0 0;font-size:12px;color:#999">${payload.inspirationImageCount} inspiratiebeeld(en) ge\u00fcpload</p>` : ""}
        </div>

        ${expertHtml ? `
        <div style="padding:20px 24px;border-bottom:1px solid #eee">
          <h3 style="color:#333;font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:800">AI Expert Analyse</h3>
          ${expertHtml}
        </div>
        ` : ""}

        <div style="padding:20px 24px;border-bottom:1px solid #eee">
          <h3 style="color:#333;font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Ruimte</h3>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:5px 0;font-weight:bold;width:130px;color:#555;font-size:13px">Afmetingen:</td>
              <td style="font-size:13px">${payload.roomWidth || "?"}m x ${payload.roomLength || "?"}m = ${payload.roomArea || "?"} m&sup2;</td>
            </tr>
            ${payload.ceilingHeight ? `<tr><td style="padding:5px 0;font-weight:bold;color:#555;font-size:13px">Plafondhoogte:</td><td style="font-size:13px">${payload.ceilingHeight}m</td></tr>` : ""}
          </table>
        </div>

        ${productActionsHtml ? `
        <div style="padding:20px 24px;border-bottom:1px solid #eee">
          <h3 style="color:#333;font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Scope — Vervangen / Behouden</h3>
          <div style="line-height:2">${productActionsHtml}</div>
        </div>
        ` : ""}

        <div style="padding:20px 24px;border-bottom:1px solid #eee">
          <h3 style="color:#333;font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Gekozen producten</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <tr style="background:#f0f0f0">
              <th style="padding:8px;text-align:left">Categorie</th>
              <th style="padding:8px;text-align:left">Product</th>
              <th style="padding:8px;text-align:left">Tier</th>
              <th style="padding:8px;text-align:left">Prijs</th>
            </tr>
            ${productsHtml}
          </table>
        </div>

        <div style="padding:20px 24px;border-bottom:1px solid #eee">
          <h3 style="color:#333;font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Geschatte investering</h3>
          <p style="margin:0;font-size:24px;font-weight:bold;color:#0d9488">EUR ${payload.estimateLow || "?"} &mdash; EUR ${payload.estimateHigh || "?"}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#999">Inclusief producten, arbeid en materiaal</p>
        </div>

        ${imagesHtml ? `
        <div style="padding:20px 24px;border-bottom:1px solid #eee">
          <h3 style="color:#333;font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Afbeeldingen</h3>
          ${imagesHtml}
        </div>
        ` : ""}

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
        from: "De Badkamer <onboarding@resend.dev>",
        to: ["peterpeeterspeter@gmail.com"],
        subject: `Nieuw Lead: ${payload.name} \u2014 ${payload.postcode} \u2014 Score ${payload.leadScore || 0} \u2014 EUR ${payload.estimateLow || "?"}+`,
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
