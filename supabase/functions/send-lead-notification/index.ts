const escapeHtml = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const s = (val: unknown): string => {
  if (val == null) return "";
  return escapeHtml(String(val));
};

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

async function sendEmail(resendKey: string, emailData: { from: string; to: string[]; subject: string; html: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });
  return { ok: res.ok, result: await res.json() };
}

function buildInternalEmail(payload: any): string {
  const productsHtml = payload.products
    ? Object.entries(payload.products)
        .map(
          ([category, detail]: [string, any]) =>
            `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${CATEGORY_LABELS[category] || s(category)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${s(detail.brand)} ${s(detail.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${s(detail.price_tier) || "-"}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">EUR ${s(detail.price_low) || "?"} - ${s(detail.price_high) || "?"}</td>
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
        `<span style="display:inline-block;margin:2px;padding:3px 8px;border-radius:10px;font-size:11px;background:#0d948815;color:#0d9488;border:1px solid #0d948830">${s(tag)}</span>`
      ).join("")
    : "";

  const expertHtml = payload.expertAnalysis
    ? `
      ${payload.expertAnalysis.currentState ? `<p style="margin:4px 0;font-size:13px;color:#444"><strong>Huidige staat:</strong> ${s(payload.expertAnalysis.currentState)}</p>` : ""}
      ${payload.expertAnalysis.conditionScore != null ? `<p style="margin:4px 0;font-size:13px;color:#444"><strong>Conditiescore:</strong> ${s(payload.expertAnalysis.conditionScore)}/10</p>` : ""}
      ${payload.expertAnalysis.keepElements?.length ? `<p style="margin:4px 0;font-size:13px;color:#444"><strong>Behouden:</strong> ${payload.expertAnalysis.keepElements.map(s).join(", ")}</p>` : ""}
      ${payload.expertAnalysis.opportunities?.length ? `<p style="margin:4px 0;font-size:13px;color:#444"><strong>Kansen:</strong> ${payload.expertAnalysis.opportunities.map(s).join(", ")}</p>` : ""}
      ${payload.expertAnalysis.recommendations?.length ? `<p style="margin:4px 0;font-size:13px;color:#444"><strong>Aanbevelingen:</strong> ${payload.expertAnalysis.recommendations.map(s).join(", ")}</p>` : ""}
      ${payload.expertAnalysis.layoutAdvice ? `<p style="margin:4px 0;font-size:13px;color:#444"><strong>Indelingsadvies:</strong> ${s(payload.expertAnalysis.layoutAdvice)}</p>` : ""}
    `
    : "";

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff">
      <div style="background:#0d9488;color:#fff;padding:28px 24px;text-align:center">
        <h1 style="margin:0;font-size:26px;letter-spacing:1px">De Badkamer</h1>
        <p style="margin:6px 0 0;font-size:13px;color:#b2dfdb;text-transform:uppercase;letter-spacing:2px">Nieuw Lead \u2014 AI Planner</p>
      </div>

      <div style="padding:24px;background:#f8fffe;border-bottom:1px solid #e0f2f1">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <h2 style="color:#0d9488;font-size:20px;margin:0 0 4px">${s(payload.name)}</h2>
            <p style="margin:0;color:#666;font-size:14px">${s(payload.postcode)} &bull; Score: <strong style="color:${scoreColor}">${payload.leadScore || 0}/100</strong></p>
          </div>
          ${payload.estimatedComplexity ? `<span style="display:inline-block;padding:6px 14px;border-radius:16px;font-size:12px;font-weight:bold;background:${complexityColors[payload.estimatedComplexity] || '#666'}15;color:${complexityColors[payload.estimatedComplexity] || '#666'};border:1px solid ${complexityColors[payload.estimatedComplexity] || '#666'}30">${complexityLabels[payload.estimatedComplexity] || s(payload.estimatedComplexity)}</span>` : ""}
        </div>
      </div>

      <div style="padding:20px 24px;border-bottom:1px solid #eee">
        <h3 style="color:#333;font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Contactgegevens</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:5px 0;font-weight:bold;width:130px;color:#555;font-size:13px">E-mail:</td><td style="font-size:13px"><a href="mailto:${s(payload.email)}" style="color:#0d9488">${s(payload.email)}</a></td></tr>
          <tr><td style="padding:5px 0;font-weight:bold;color:#555;font-size:13px">Telefoon:</td><td style="font-size:13px"><a href="tel:${s(payload.phone)}" style="color:#0d9488">${s(payload.phone)}</a></td></tr>
          <tr><td style="padding:5px 0;font-weight:bold;color:#555;font-size:13px">Postcode:</td><td style="font-size:13px">${s(payload.postcode)}</td></tr>
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
        <p style="margin:0 0 8px;font-size:13px;color:#444"><strong>${s(payload.styleName) || "Niet geselecteerd"}</strong></p>
        ${payload.styleSummary ? `<p style="color:#666;font-size:13px;margin:0 0 10px;line-height:1.5">${s(payload.styleSummary)}</p>` : ""}
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
        <h3 style="color:#333;font-size:15px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Scope \u2014 Vervangen / Behouden</h3>
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
}

function buildCustomerEmail(payload: any): string {
  const firstName = (payload.name || "").split(" ")[0] || payload.name || "klant";

  const customerProductsHtml = payload.products
    ? Object.entries(payload.products)
        .map(
          ([category, detail]: [string, any]) =>
            `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;color:#333">${CATEGORY_LABELS[category] || s(category)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#555">${s(detail.brand)} ${s(detail.name)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#555;text-align:right">\u20AC ${s(detail.price_low) || "?"} - ${s(detail.price_high) || "?"}</td>
        </tr>`
        )
        .join("")
    : "";

  const customerActionsHtml = payload.productActions
    ? Object.entries(payload.productActions)
        .map(([category, action]: [string, any]) => {
          const label = ACTION_LABELS[action] || action;
          const color = ACTION_COLORS[action] || "#666";
          const catLabel = CATEGORY_LABELS[category] || category;
          return `<span style="display:inline-block;margin:3px;padding:5px 12px;border-radius:20px;font-size:13px;font-weight:600;background:${color}10;color:${color};border:1px solid ${color}25">${catLabel}: ${label}</span>`;
        })
        .join("")
    : "";

  const styleTagsHtml = payload.styleTags?.length
    ? payload.styleTags.map((tag: string) =>
        `<span style="display:inline-block;margin:2px;padding:4px 10px;border-radius:14px;font-size:12px;background:#0d948810;color:#0d9488">${s(tag)}</span>`
      ).join("")
    : "";

  let expertAdviceHtml = "";
  if (payload.expertAnalysis) {
    const ea = payload.expertAnalysis;
    const adviceItems: string[] = [];
    if (ea.keepElements?.length) {
      adviceItems.push(`<div style="margin-bottom:12px"><p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:0.5px">Wat we behouden</p><p style="margin:0;font-size:14px;color:#444;line-height:1.6">${ea.keepElements.map(s).join(", ")}</p></div>`);
    }
    if (ea.opportunities?.length) {
      adviceItems.push(`<div style="margin-bottom:12px"><p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:0.5px">Kansen voor verbetering</p><p style="margin:0;font-size:14px;color:#444;line-height:1.6">${ea.opportunities.map(s).join(", ")}</p></div>`);
    }
    if (ea.recommendations?.length) {
      adviceItems.push(`<div style="margin-bottom:12px"><p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:0.5px">Onze aanbevelingen</p><p style="margin:0;font-size:14px;color:#444;line-height:1.6">${ea.recommendations.map(s).join(", ")}</p></div>`);
    }
    if (ea.layoutAdvice) {
      adviceItems.push(`<div style="margin-bottom:12px"><p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:0.5px">Indelingsadvies</p><p style="margin:0;font-size:14px;color:#444;line-height:1.6">${s(ea.layoutAdvice)}</p></div>`);
    }
    if (adviceItems.length) {
      expertAdviceHtml = adviceItems.join("");
    }
  }

  const complexityLabels: Record<string, string> = {
    eenvoudig: "Eenvoudig project",
    gemiddeld: "Gemiddeld project",
    complex: "Complex project",
  };

  const complexityDescriptions: Record<string, string> = {
    eenvoudig: "Uw badkamerrenovatie is relatief eenvoudig. Met de juiste vakman kan dit vlot verlopen.",
    gemiddeld: "Uw renovatie heeft een gemiddelde complexiteit. Een ervaren vakman zorgt voor een soepel verloop.",
    complex: "Uw project vereist specialistische kennis. We koppelen u aan een ervaren renovatie-expert.",
  };

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff">

      <div style="background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);color:#fff;padding:40px 32px;text-align:center">
        <h1 style="margin:0;font-size:28px;letter-spacing:1px;font-weight:800">De Badkamer</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#b2dfdb;letter-spacing:1px">VAKMANSCHAP IN RENOVATIE</p>
      </div>

      <div style="padding:32px 28px;background:#f8fffe;border-bottom:2px solid #e0f2f1">
        <h2 style="color:#333;font-size:22px;margin:0 0 12px;font-weight:800">Beste ${escapeHtml(firstName)},</h2>
        <p style="margin:0;font-size:15px;color:#555;line-height:1.7">
          Bedankt voor het gebruik van onze AI Badkamerplanner! Hieronder vindt u uw persoonlijke renovatiedossier met alle details van uw project.
        </p>
      </div>

      ${payload.renderImageUrl ? `
      <div style="padding:28px;text-align:center;background:#fff;border-bottom:1px solid #eee">
        <h3 style="color:#333;font-size:16px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Uw AI Renovatie-ontwerp</h3>
        <a href="${payload.renderImageUrl}" style="display:inline-block;text-decoration:none">
          <div style="background:#f0fdfa;border:2px solid #0d9488;border-radius:16px;padding:16px;display:inline-block">
            <p style="margin:0;color:#0d9488;font-size:14px;font-weight:700">Bekijk uw renovatie-ontwerp &rarr;</p>
            <p style="margin:4px 0 0;color:#999;font-size:12px">Klik om het volledige AI-gegenereerde ontwerp te bekijken</p>
          </div>
        </a>
        ${payload.originalPhotoUrl ? `<p style="margin:12px 0 0"><a href="${payload.originalPhotoUrl}" style="color:#0d9488;font-size:13px;text-decoration:none">Bekijk ook uw originele foto &rarr;</a></p>` : ""}
      </div>
      ` : ""}

      <div style="padding:24px 28px;border-bottom:1px solid #eee">
        <h3 style="color:#333;font-size:16px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Uw stijlkeuze</h3>
        <p style="margin:0 0 8px;font-size:16px;color:#0d9488;font-weight:700">${s(payload.styleName) || "Persoonlijke stijl"}</p>
        ${payload.styleSummary ? `<p style="color:#555;font-size:14px;margin:0 0 12px;line-height:1.6">${s(payload.styleSummary)}</p>` : ""}
        ${styleTagsHtml ? `<div style="margin-top:8px">${styleTagsHtml}</div>` : ""}
      </div>

      ${expertAdviceHtml ? `
      <div style="padding:24px 28px;border-bottom:1px solid #eee">
        <h3 style="color:#333;font-size:16px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Advies van onze AI-architect</h3>
        ${payload.expertAnalysis?.currentState ? `
          <div style="background:#f0fdfa;border-radius:12px;padding:14px 16px;margin-bottom:16px">
            <p style="margin:0;font-size:14px;color:#333;line-height:1.6">${s(payload.expertAnalysis.currentState)}</p>
          </div>
        ` : ""}
        ${expertAdviceHtml}
      </div>
      ` : ""}

      ${payload.estimatedComplexity ? `
      <div style="padding:24px 28px;border-bottom:1px solid #eee">
        <div style="background:#f8f9fa;border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:16px">
          <div>
            <p style="margin:0;font-size:15px;font-weight:700;color:#333">${complexityLabels[payload.estimatedComplexity] || payload.estimatedComplexity}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#666;line-height:1.5">${complexityDescriptions[payload.estimatedComplexity] || ""}</p>
          </div>
        </div>
      </div>
      ` : ""}

      <div style="padding:24px 28px;border-bottom:1px solid #eee">
        <h3 style="color:#333;font-size:16px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Uw badkamer</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:6px 0;font-weight:600;width:140px;color:#555;font-size:14px">Afmetingen:</td>
            <td style="font-size:14px;color:#333">${payload.roomWidth || "?"}m x ${payload.roomLength || "?"}m = ${payload.roomArea || "?"} m\u00B2</td>
          </tr>
          ${payload.ceilingHeight ? `<tr><td style="padding:6px 0;font-weight:600;color:#555;font-size:14px">Plafondhoogte:</td><td style="font-size:14px;color:#333">${payload.ceilingHeight}m</td></tr>` : ""}
        </table>
      </div>

      ${customerActionsHtml ? `
      <div style="padding:24px 28px;border-bottom:1px solid #eee">
        <h3 style="color:#333;font-size:16px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Uw renovatie-scope</h3>
        <div style="line-height:2.2">${customerActionsHtml}</div>
      </div>
      ` : ""}

      ${customerProductsHtml ? `
      <div style="padding:24px 28px;border-bottom:1px solid #eee">
        <h3 style="color:#333;font-size:16px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Geselecteerde producten</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="background:#f8f9fa">
            <th style="padding:10px 12px;text-align:left;font-weight:700;color:#333">Product</th>
            <th style="padding:10px 12px;text-align:left;font-weight:700;color:#333">Merk & Model</th>
            <th style="padding:10px 12px;text-align:right;font-weight:700;color:#333">Prijsindicatie</th>
          </tr>
          ${customerProductsHtml}
        </table>
      </div>
      ` : ""}

      <div style="padding:28px;text-align:center;background:#f8fffe;border-bottom:1px solid #eee">
        <h3 style="color:#333;font-size:16px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;font-weight:800">Geschatte investering</h3>
        <p style="margin:0;font-size:32px;font-weight:800;color:#0d9488">\u20AC ${payload.estimateLow || "?"} \u2014 \u20AC ${payload.estimateHigh || "?"}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#999">Inclusief producten, arbeid en materiaal (richtprijs)</p>
      </div>

      <div style="padding:32px 28px;text-align:center;background:#0d9488">
        <h3 style="color:#fff;font-size:18px;margin:0 0 12px;font-weight:800">Wat is de volgende stap?</h3>
        <p style="color:#b2dfdb;font-size:14px;line-height:1.6;margin:0 0 20px">
          Een ervaren renovatie-specialist in uw regio bekijkt uw dossier en neemt binnenkort contact met u op voor een vrijblijvend gesprek.
        </p>
        <a href="https://debadkamer.com/planner" style="display:inline-block;background:#fff;color:#0d9488;padding:14px 32px;border-radius:30px;font-size:14px;font-weight:800;text-decoration:none;text-transform:uppercase;letter-spacing:1px">Nog een ontwerp maken</a>
      </div>

      <div style="padding:24px 28px;text-align:center;background:#f8f9fa">
        <p style="margin:0 0 8px;font-size:13px;color:#666">Heeft u vragen? Neem gerust contact met ons op.</p>
        <p style="margin:0;font-size:12px;color:#999">
          DeBadkamer.com &mdash; Vakmanschap in renovatie
        </p>
        <p style="margin:8px 0 0;font-size:11px;color:#bbb">
          U ontvangt deze e-mail omdat u een renovatieplan heeft aangevraagd via onze AI Badkamerplanner.
        </p>
      </div>
    </div>
  `;
}

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

    const fromDomain = Deno.env.get("RESEND_FROM_DOMAIN");
    const fromAddress = fromDomain
      ? `De Badkamer <noreply@${fromDomain}>`
      : "De Badkamer <onboarding@resend.dev>";

    const internalHtml = buildInternalEmail(payload);
    const internalResult = await sendEmail(resendKey, {
      from: fromAddress,
      to: ["peterpeeterspeter@gmail.com"],
      subject: `Nieuw Lead: ${payload.name} \u2014 ${payload.postcode} \u2014 Score ${payload.leadScore || 0} \u2014 EUR ${payload.estimateLow || "?"}+`,
      html: internalHtml,
    });
    console.log("Internal email result:", JSON.stringify(internalResult));

    let customerResult = { ok: false, result: { message: "skipped" } as any };
    if (payload.email) {
      const customerHtml = buildCustomerEmail(payload);
      customerResult = await sendEmail(resendKey, {
        from: fromAddress,
        to: [payload.email],
        subject: `Uw renovatieplan \u2014 De Badkamer AI Planner`,
        html: customerHtml,
      });
      console.log("Customer email result:", JSON.stringify(customerResult));

      if (!customerResult.ok) {
        console.error("Customer email FAILED for", payload.email, "Error:", JSON.stringify(customerResult.result));
      }
    }

    return new Response(JSON.stringify({
      internal: internalResult.result,
      customer: customerResult.result,
      fromAddress,
      customerEmailOk: customerResult.ok,
    }), {
      status: internalResult.ok ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
