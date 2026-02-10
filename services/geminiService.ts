import { GoogleGenAI, Type } from "@google/genai";
import { ProjectSpec, Estimate, BudgetTier, FixtureType, MaterialConfig, StyleProfile, DatabaseProduct, ProductAction } from "../types";

const getApiKey = (): string => {
  const key = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
  if (key) return key;
  try {
    const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (viteKey) return viteKey;
  } catch {}
  return '';
};

const getBaseUrl = (): string | undefined => {
  const url = process.env.GEMINI_BASE_URL || '';
  if (url) return url;
  try {
    const viteUrl = (import.meta as any).env?.VITE_GEMINI_BASE_URL;
    if (viteUrl) return viteUrl;
  } catch {}
  return undefined;
};

const createClient = () => {
  const baseUrl = getBaseUrl();
  return new GoogleGenAI({
    apiKey: getApiKey(),
    ...(baseUrl ? { httpOptions: { baseUrl } } : {}),
  });
};

const cleanJson = (text: string) => {
  if (!text) return "";
  const match = text.match(/```(?:json|JSON)?\s*([\s\S]*?)\s*```/);
  if (match) return match[1].trim();
  const firstOpen = text.indexOf('{');
  const lastClose = text.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1) return text.substring(firstOpen, lastClose + 1);
  return text.trim();
};

const getMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:(.*);base64,/);
  return match ? match[1] : "image/jpeg";
};

export const analyzeBathroomInput = async (base64Image: string, mimeType: string = "image/jpeg"): Promise<ProjectSpec> => {
  const ai = createClient();
  const model = "gemini-3-pro-preview";

  const systemInstruction = `You are a bathroom layout analyst for De Badkamer, a renovation company.

Analyze this bathroom photo and identify:
1. Room dimensions — estimate width and length in meters using visible reference objects (doors are ~80cm wide, standard toilets are ~70cm deep).
2. Room shape — rectangle, L-shape, or square.
3. All fixtures present — toilets, sinks, showers, bathtubs, radiators, windows, doors, and any obstacles.
4. Their approximate positions as percentages (0-100) of the room's width (X) and depth (Y).
5. Any demolition notes — what needs removal or special attention.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: "Analyze this bathroom's layout, dimensions, and fixtures." }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimated_dimensions: {
              type: Type.OBJECT,
              properties: {
                width_m: { type: Type.NUMBER },
                length_m: { type: Type.NUMBER },
                ceiling_height_m: { type: Type.NUMBER }
              },
              required: ["width_m", "length_m"]
            },
            layout_type: { type: Type.STRING, enum: ["RECTANGLE", "L_SHAPE", "SQUARE", "SLOPED_CEILING"] },
            fixtures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  type: { type: Type.STRING, enum: Object.values(FixtureType) },
                  position_x_percent: { type: Type.NUMBER, description: "0-100 relative X position" },
                  position_y_percent: { type: Type.NUMBER, description: "0-100 relative Y position" }
                }
              }
            },
            demolition_notes: { type: Type.STRING }
          },
          required: ["estimated_dimensions", "fixtures"]
        }
      }
    });

    if (response.text) {
      const raw = JSON.parse(cleanJson(response.text));
      return {
        roomType: "Bathroom",
        layoutShape: raw.layout_type === "SLOPED_CEILING" ? "RECTANGLE" : raw.layout_type,
        estimatedWidthMeters: raw.estimated_dimensions.width_m,
        estimatedLengthMeters: raw.estimated_dimensions.length_m,
        ceilingHeightMeters: raw.estimated_dimensions.ceiling_height_m || 2.4,
        totalAreaM2: Number((raw.estimated_dimensions.width_m * raw.estimated_dimensions.length_m).toFixed(2)),
        existingFixtures: raw.fixtures.map((f: any) => ({
          type: f.type || FixtureType.OBSTACLE,
          description: f.item,
          fixed: true,
          positionX: f.position_x_percent,
          positionY: f.position_y_percent
        })),
        constraints: raw.demolition_notes ? [raw.demolition_notes] : []
      };
    }
    throw new Error("Analysis failed");
  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      roomType: "Standard Bathroom", layoutShape: "RECTANGLE", estimatedWidthMeters: 2.5, estimatedLengthMeters: 3.0, ceilingHeightMeters: 2.4, totalAreaM2: 7.5,
      existingFixtures: [{ type: FixtureType.TOILET, description: "WC", fixed: true, positionX: 20, positionY: 0 }],
      constraints: []
    };
  }
};

const LABOR_RATE_TABLE = `
LABOR RATE TABLE (EUR, Netherlands 2025 market rates):
- DEMOLITION: €35/m2 (removal of existing fixtures, tiles, screed)
- PLUMBING_ROUGH: €85/point (per water connection point: sink, toilet, shower, bathtub)
- PLUMBING_RELOCATION: €150/point (moving existing water/drain connections)
- ELECTRICAL: €65/point (per electrical point: light, socket, heated mirror)
- WATERPROOFING: €25/m2 (wet area membrane application)
- TILING_FLOOR: €55/m2 (floor tile installation including adhesive)
- TILING_WALL: €60/m2 (wall tile installation including adhesive)
- SCREED: €30/m2 (floor leveling)
- FIXTURE_INSTALL_TOILET: €180/piece (wall-hung toilet installation)
- FIXTURE_INSTALL_SINK: €150/piece (vanity + sink installation)
- FIXTURE_INSTALL_SHOWER: €250/piece (shower enclosure + tray installation)
- FIXTURE_INSTALL_BATHTUB: €350/piece (bathtub installation)
- FIXTURE_INSTALL_FAUCET: €65/piece (faucet installation per unit)
- FIXTURE_INSTALL_LIGHTING: €45/piece (light fixture installation)
- PAINTING: €18/m2 (walls and ceiling, 2 coats)
- WASTE_DISPOSAL: €250/flat (container + disposal of demolition waste)

Use these rates exactly. Do NOT invent labor prices.`;

export const calculateRenovationCost = async (
  spec: ProjectSpec,
  tier: BudgetTier,
  styleProfile: StyleProfile,
  materials: MaterialConfig,
  products: DatabaseProduct[],
  productActions?: Record<string, string>
): Promise<Estimate> => {
  const ai = createClient();
  const model = "gemini-3-pro-preview";

  const styleDesc = styleProfile.summary;
  const styleTags = styleProfile.tags.map(t => `${t.tag} (${t.weight})`).join(', ');
  const catalogForPrompt = products.map(p => ({
    id: p.id, brand: p.brand, name: p.name, category: p.category,
    price: p.price, currency: p.currency, image_url: p.image_url
  }));

  const tierGuidance = {
    [BudgetTier.BUDGET]: 'Budget tier: Select the most affordable products from the catalog. Minimize labor where possible (e.g., paint instead of tile on non-wet walls). Target the lowest reasonable total.',
    [BudgetTier.STANDARD]: 'Standard tier: Select mid-range products with good quality-price balance. Include all standard labor operations for a complete renovation.',
    [BudgetTier.PREMIUM]: 'Premium tier: Select the highest-quality products from the catalog. Include all labor operations plus finishing details (e.g., niche cuts, heated floor prep, premium grouting).',
  };

  const systemInstruction = `
    You are the De Badkamer Pricing Engine for the Netherlands/Belgium market.

    BUDGET TIER: ${tier}
    ${tierGuidance[tier]}

    ROOM DETAILS:
    - Dimensions: ${spec.estimatedWidthMeters}m × ${spec.estimatedLengthMeters}m = ${spec.totalAreaM2} m2
    - Ceiling height: ${spec.ceilingHeightMeters}m
    - Current state: ${spec.constraints.join(', ') || 'Standard condition, full demolition needed'}
    - Existing fixtures: ${spec.existingFixtures.map(f => f.description).join(', ') || 'Unknown'}

    STYLE: ${styleDesc}
    Style tags: ${styleTags}

    PRODUCT CATALOG:
    ${JSON.stringify(catalogForPrompt)}

    USER MATERIAL PREFERENCES:
    ${JSON.stringify(materials)}

    ${productActions ? `RENOVATION SCOPE:
    The customer has chosen the following actions per category.
    Only include costs for items marked REPLACE or ADD. Items marked KEEP cost nothing (no material, no labor).
    Items marked REMOVE only incur demolition/removal labor cost.
    Categories not listed default to REPLACE.
${['Tile', 'Vanity', 'Toilet', 'Faucet', 'Shower', 'Bathtub', 'Lighting'].map(cat => `    - ${cat}: ${(productActions[cat] || 'replace').toUpperCase()}`).join('\n')}
    ` : ''}

    ${LABOR_RATE_TABLE}

    TASK:
    1. Select materials from the catalog matching the user's style and budget tier.
    2. Calculate material quantities based on room dimensions (tiles in m2, fixtures in pieces).
    3. List all required labor operations using ONLY the rates from the labor table above.
    4. For each material, specify the correct unit (m2 for tiles, pcs for fixtures/faucets/lighting).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: "Generate the cost estimate JSON." }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            materials: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sku: { type: Type.STRING },
                  name: { type: Type.STRING },
                  qty: { type: Type.NUMBER },
                  unit: { type: Type.STRING, description: "Unit of measure: m2, pcs, or set" },
                  unit_price: { type: Type.NUMBER },
                  total_price: { type: Type.NUMBER },
                  reason: { type: Type.STRING, description: "Why this SKU was selected" }
                }
              }
            },
            labor_operations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING },
                  description: { type: Type.STRING },
                  qty: { type: Type.NUMBER, description: "Quantity (m2, points, or pieces)" },
                  unit: { type: Type.STRING },
                  unit_rate: { type: Type.NUMBER },
                  cost: { type: Type.NUMBER }
                }
              }
            },
            summary_text: { type: Type.STRING }
          },
          required: ["materials", "labor_operations"]
        }
      }
    });

    if (response.text) {
      const raw = JSON.parse(cleanJson(response.text));

      const materialItems = raw.materials.map((m: any) => ({
        description: m.name,
        category: 'Materials' as const,
        amount: m.qty,
        unit: m.unit || 'pcs',
        unitPrice: m.unit_price,
        totalPrice: m.total_price,
        brand: m.sku?.split('-')[0] || ''
      }));

      const laborItems = raw.labor_operations.map((l: any) => ({
        description: l.description,
        category: 'Labor' as const,
        amount: l.qty || 1,
        unit: l.unit || 'service',
        unitPrice: l.unit_rate || l.cost,
        totalPrice: l.cost
      }));

      const allItems = [...materialItems, ...laborItems];
      const subtotal = allItems.reduce((acc: number, item: any) => acc + item.totalPrice, 0);

      return {
        lineItems: allItems,
        subtotal: subtotal,
        contingency: subtotal * 0.1,
        tax: subtotal * 0.21,
        grandTotal: subtotal * 1.31,
        currency: "EUR",
        summary: raw.summary_text || `Kostenraming op basis van ${tier} niveau.`
      };
    }
    throw new Error("Estimate failed");
  } catch (error) {
    const area = spec.estimatedWidthMeters * spec.estimatedLengthMeters || 6;
    const base = area * 1500;
    return {
      lineItems: [{ description: "Compleet Renovatiepakket", category: "Other", amount: 1, unit: "lot", unitPrice: base, totalPrice: base }],
      subtotal: base, tax: base * 0.21, grandTotal: base * 1.21, currency: "EUR", summary: "Prijsindicatie op basis van gemiddelde markttarieven.", contingency: base * 0.1
    };
  }
};

export const fetchProductImagesAsBase64 = async (
  products: DatabaseProduct[]
): Promise<Map<string, { base64: string; mimeType: string }>> => {
  const imageMap = new Map<string, { base64: string; mimeType: string }>();

  await Promise.all(
    products.map(async (product) => {
      try {
        const response = await fetch(product.image_url);
        if (!response.ok) return;
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        imageMap.set(product.id, {
          base64,
          mimeType: blob.type || 'image/jpeg',
        });
      } catch (err) {
        console.warn(`Failed to fetch image for product ${product.id}:`, err);
      }
    })
  );

  return imageMap;
};

const CATEGORY_LABELS_NL: Record<string, string> = {
  Tile: 'Vloer & Wanden',
  Vanity: 'Wastafelmeubel',
  Toilet: 'Toilet',
  Faucet: 'Kranen',
  Shower: 'Douche',
  Bathtub: 'Bad',
  Lighting: 'Verlichting',
};

export const generateRenovation = async (
  bathroomBase64: string,
  bathroomMimeType: string,
  styleProfile: StyleProfile,
  productActions: Record<string, string>,
  selectedProducts: DatabaseProduct[],
  productImages: Map<string, { base64: string; mimeType: string }>
): Promise<string> => {
  const ai = createClient();
  const model = "gemini-3-pro-image-preview";

  const styleDesc = styleProfile.summary;
  const topTags = styleProfile.tags.slice(0, 8).map(t => t.tag).join(', ');
  const presetDesc = styleProfile.presetName
    ? `${styleProfile.presetName}: ${styleProfile.summary}`
    : styleProfile.summary;

  const parts: any[] = [];

  if (styleProfile.referenceImageUrls && styleProfile.referenceImageUrls.length > 0) {
    for (const refUrl of styleProfile.referenceImageUrls) {
      const match = refUrl.match(/^data:(.*);base64,(.*)$/);
      if (match) {
        parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
      }
    }
    parts.push({
      text: "[INSPIRATIEBEELDEN — dit is de stijl die de klant wil bereiken]"
    });
  }

  parts.push({
    inlineData: { mimeType: bathroomMimeType, data: bathroomBase64 }
  });
  parts.push({
    text: "[FOTO HUIDIGE BADKAMER — dit is de huidige staat die gerenoveerd moet worden]"
  });

  let imageIndex = 0;
  const imageLabels: string[] = [];

  for (const product of selectedProducts) {
    const imgData = productImages.get(product.id);
    if (imgData) {
      imageIndex++;
      parts.push({
        inlineData: { mimeType: imgData.mimeType, data: imgData.base64 }
      });
      const label = `[PRODUCT ${imageIndex}: ${product.name} (${product.category})]`;
      parts.push({ text: label });
      imageLabels.push(`Product ${imageIndex}: ${product.name} — categorie: ${product.category}`);
    }
  }

  const scopeLines: string[] = [];
  const categories = ['Tile', 'Vanity', 'Toilet', 'Faucet', 'Shower', 'Bathtub', 'Lighting'];

  for (const cat of categories) {
    const action = productActions[cat] || 'replace';
    const nlLabel = CATEGORY_LABELS_NL[cat] || cat;
    const product = selectedProducts.find(p => p.category === cat);
    const productImg = product ? imageLabels.find(l => l.includes(product.name)) : null;

    if (action === 'keep') {
      scopeLines.push(`${nlLabel} — BEHOUDEN: Bewaar het bestaande element EXACT zoals zichtbaar op de badkamerfoto. Zelfde uiterlijk, zelfde materiaal, zelfde staat. Mag verplaatst worden als de nieuwe indeling dat vereist, maar het uiterlijk blijft identiek.`);
    } else if (action === 'remove') {
      scopeLines.push(`${nlLabel} — VERWIJDEREN: Verwijder dit element volledig. Vul de vrijgekomen ruimte naadloos op met het vloer- en wandmateriaal.`);
    } else if (action === 'add') {
      scopeLines.push(`${nlLabel} — TOEVOEGEN (${productImg || 'zie referentie'}): Er is momenteel GEEN ${nlLabel.toLowerCase()} in deze badkamer. Installeer het product uit de bijgevoegde referentiefoto op de meest logische plek in de nieuwe indeling.`);
    } else {
      if (productImg) {
        scopeLines.push(`${nlLabel} — VERVANGEN (${productImg}): Verwijder het bestaande element en installeer het product uit de bijgevoegde referentiefoto. Match kleur, vorm, materiaal en afwerking EXACT.`);
      } else {
        scopeLines.push(`${nlLabel} — VERVANGEN: Vervang door een modern, stijlvol alternatief passend bij de ontwerpstijl.`);
      }
    }
  }

  const prompt = `
Transform the bathroom in the photo into a fully renovated space.
You are a senior interior architect with complete creative freedom over the layout and design.

STEP 1 — STUDY THE SHELL:
Analyze the bathroom photo. Identify ONLY the fixed structural elements:
- Outer walls and their positions
- Window(s): exact position, size, and how light enters
- Door(s): exact position and which way they open
- Ceiling height and any beams or slopes
- Where existing water supply and drainage likely connect (typically the wall where current fixtures are mounted)
THESE are your only constraints. Everything else — the interior layout, where fixtures go, the flow of the space — is yours to redesign.

STEP 2 — DESIGN THE LAYOUT:
Create the optimal bathroom layout for this space. Place fixtures where they make the most sense based on:
- Plumbing logic: toilets and showers need drainage — keep them near the wall where existing plumbing connects
- Flow: minimum 60cm free passage in front of every fixture
- Natural light: place the vanity mirror where it catches daylight if possible
- Privacy: toilet not directly visible from the door
- The customer's style preference
You may completely change the interior layout from the original photo. Move the toilet, swap sides, anything — as long as it makes spatial and plumbing sense.

STEP 3 — APPLY CHANGES:
The customer has specified what to replace and what to keep:

${scopeLines.join('\n\n')}

For REPLACED items: use the reference product photos as EXACT visual guide — match color, shape, material, and finish precisely.
For KEPT items: preserve their appearance EXACTLY as they look in the original bathroom photo. They may be repositioned in the new layout but their visual appearance stays identical.

STEP 4 — STYLE AND ATMOSPHERE:
Design style: ${presetDesc}
Qualities: ${topTags}

Light and mood:
- Natural daylight from existing window(s), same direction as the original photo
- Warm color temperature (3000K)
- Soft realistic shadows from all fixtures
- No hard spots or overexposure

Finishing:
- 1-2 neutral white or grey towels on a rail
- Realistic textures: wood grain, stone texture, metal sheen
- Chrome and glass show realistic reflections
- Consistent grout lines if tiles are used
- NOTHING else: no plants, candles, art, bottles, or decorative objects

FIXED CONSTRAINTS (non-negotiable):
- Outer walls = IDENTICAL to the bathroom photo
- Window positions and sizes = IDENTICAL to the bathroom photo
- Door positions = IDENTICAL to the bathroom photo
- Ceiling beams, slopes = IDENTICAL to the bathroom photo
- Camera angle and perspective = IDENTICAL to the bathroom photo
- Do NOT add windows or doors not in the original photo
- KEPT items match their appearance in the original photo
- REPLACED items match their reference product photos exactly
- Professional interior magazine photography quality
`;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          imageSize: '2K',
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image in render response");
  } catch (error) {
    console.error("Renovation render error:", error);
    throw error;
  }
};
