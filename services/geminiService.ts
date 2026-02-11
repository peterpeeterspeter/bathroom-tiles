import { GoogleGenAI, Type } from "@google/genai";
import { ProjectSpec, Estimate, BudgetTier, FixtureType, MaterialConfig, StyleProfile, DatabaseProduct, ProductAction, WallSpec, ShellAnchor, CameraSpec } from "../types";

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

const getDirectApiKey = (): string => {
  const key = process.env.GOOGLE_AI_API_KEY || '';
  if (key) return key;
  try {
    const viteKey = (import.meta as any).env?.VITE_GOOGLE_AI_API_KEY;
    if (viteKey) return viteKey;
  } catch {}
  return '';
};

const createClient = (useDirect = false) => {
  if (useDirect) {
    const directKey = getDirectApiKey();
    if (directKey) {
      return new GoogleGenAI({ apiKey: directKey });
    }
  }
  const baseUrl = getBaseUrl();
  return new GoogleGenAI({
    apiKey: getApiKey(),
    ...(baseUrl ? { httpOptions: { baseUrl } } : {}),
  });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(
  fn: (useDirect: boolean) => Promise<T>,
  maxRetries = 2,
  baseDelay = 3000,
  proxyOnly = false
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const useDirect = proxyOnly ? false : attempt > 0;
    try {
      return await fn(useDirect);
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || 0;
      const isRetryable = status === 429 || status === 503 || status === 500;
      if (!isRetryable || attempt === maxRetries) throw err;
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`API call failed (${status}), retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}${proxyOnly ? '' : ', switching to direct API'})...`);
      await sleep(delay);
    }
  }
  throw lastError;
}

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
  const model = "gemini-3-pro-preview";

  const systemInstruction = `You are a bathroom layout analyst. Return ONLY valid JSON matching the schema.
Do NOT invent elements that are not visible. If uncertain, set confidence < 0.6.

TASK:
1. CALIBRATE: Use a standard reference (door ~80cm wide, ~210cm tall; toilet depth ~70cm; standard tile 30x30 or 60x60) to estimate room scale.
2. CAMERA: Determine where the camera is positioned (which wall it faces FROM), angle (eye-level/elevated/corner), and lens feel (wide-angle/normal).
3. WALLS: For each visible wall (0=N, 1=E, 2=S, 3=W):
   - If it has a door or window: provide corner coordinates (tl, tr, br, bl) as x/y% in the photo frame.
   - Include door hinge side and swing direction if visible.
   - Note niches, beams, sloped ceiling areas.
   - Note visible plumbing indicators (pipes, fixture mounting points).
4. LIGHTING: Primary natural light direction relative to camera.
5. FIXTURES: Every fixture — type, which wall, position (x/y%), condition (GOOD/WORN/DAMAGED/UNKNOWN), confidence 0-1.
6. OCCLUSIONS: List what is NOT visible (e.g., "wall 0 not visible — behind camera").
7. PLUMBING: Identify the wall index with the most plumbing connections. Any demolition notes.`;

  try {
    const response = await withRetry(async (useDirect) => {
      const ai = createClient(useDirect);
      return ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { mimeType, data: base64Image } },
            { text: "Analyze this bathroom's layout, dimensions, and fixtures." }
          ]
        },
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimated_dimensions: {
              type: Type.OBJECT,
              properties: {
                width_m: { type: Type.NUMBER },
                length_m: { type: Type.NUMBER },
                ceiling_height_m: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER, description: "0-1 confidence in dimension estimate" }
              },
              required: ["width_m", "length_m"]
            },
            layout_type: { type: Type.STRING, enum: ["RECTANGLE", "L_SHAPE", "SQUARE", "SLOPED_CEILING"] },
            camera: {
              type: Type.OBJECT,
              properties: {
                position: { type: Type.STRING, enum: ["EYE_LEVEL", "ELEVATED", "CORNER", "LOW_ANGLE"] },
                facing_from_wall: { type: Type.NUMBER, description: "Which wall the camera faces FROM (0=N, 1=E, 2=S, 3=W)" },
                lens_feel: { type: Type.STRING, enum: ["WIDE_ANGLE", "NORMAL", "TELEPHOTO"] }
              },
              required: ["position", "facing_from_wall", "lens_feel"]
            },
            walls: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  wall_index: { type: Type.NUMBER, description: "0=N, 1=E, 2=S, 3=W" },
                  visible: { type: Type.BOOLEAN, description: "Whether this wall is visible in the photo" },
                  anchors: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        element_type: { type: Type.STRING, enum: ["DOOR", "WINDOW", "NICHE"] },
                        tl_x: { type: Type.NUMBER, description: "Top-left X% in photo frame" },
                        tl_y: { type: Type.NUMBER, description: "Top-left Y% in photo frame" },
                        tr_x: { type: Type.NUMBER, description: "Top-right X%" },
                        tr_y: { type: Type.NUMBER, description: "Top-right Y%" },
                        br_x: { type: Type.NUMBER, description: "Bottom-right X%" },
                        br_y: { type: Type.NUMBER, description: "Bottom-right Y%" },
                        bl_x: { type: Type.NUMBER, description: "Bottom-left X%" },
                        bl_y: { type: Type.NUMBER, description: "Bottom-left Y%" },
                        door_hinge_side: { type: Type.STRING, enum: ["LEFT", "RIGHT", "UNKNOWN"] },
                        door_swing: { type: Type.STRING, enum: ["INWARD", "OUTWARD", "UNKNOWN"] },
                        confidence: { type: Type.NUMBER, description: "0-1 confidence in this anchor" }
                      },
                      required: ["element_type", "tl_x", "tl_y", "tr_x", "tr_y", "br_x", "br_y", "bl_x", "bl_y", "confidence"]
                    }
                  },
                  has_plumbing: { type: Type.BOOLEAN, description: "Visible pipes or fixture mounting points" },
                  features: { type: Type.STRING, description: "Beam, niche, sloped ceiling, etc." }
                },
                required: ["wall_index", "visible"]
              }
            },
            primary_light_direction: {
              type: Type.STRING,
              enum: ["LEFT", "RIGHT", "FRONT", "BACK", "OVERHEAD", "MIXED"],
              description: "Dominant natural light direction relative to camera"
            },
            fixtures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  type: { type: Type.STRING, enum: Object.values(FixtureType) },
                  position_x_percent: { type: Type.NUMBER, description: "0-100 relative X position" },
                  position_y_percent: { type: Type.NUMBER, description: "0-100 relative Y position" },
                  wall_index: { type: Type.NUMBER, description: "Which wall (0-3) this fixture is on or nearest to" },
                  condition: { type: Type.STRING, enum: ["GOOD", "WORN", "DAMAGED", "UNKNOWN"] },
                  confidence: { type: Type.NUMBER, description: "0-1 confidence in this detection" }
                }
              }
            },
            plumbing_wall: {
              type: Type.NUMBER,
              description: "Primary wall with water supply/drainage (0=N, 1=E, 2=S, 3=W)"
            },
            occlusions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of what is NOT visible in the photo"
            },
            demolition_notes: { type: Type.STRING }
          },
          required: ["estimated_dimensions", "fixtures", "walls"]
        }
      }
    });
    });

    if (response.text) {
      const raw = JSON.parse(cleanJson(response.text));

      const camera: CameraSpec | undefined = raw.camera ? {
        position: raw.camera.position,
        facingFromWall: raw.camera.facing_from_wall,
        lensFeel: raw.camera.lens_feel
      } : undefined;

      const walls: WallSpec[] | undefined = raw.walls?.map((w: any) => ({
        wallIndex: w.wall_index,
        visible: w.visible ?? true,
        anchors: (w.anchors || []).map((a: any) => ({
          elementType: a.element_type,
          tl: { x: a.tl_x, y: a.tl_y },
          tr: { x: a.tr_x, y: a.tr_y },
          br: { x: a.br_x, y: a.br_y },
          bl: { x: a.bl_x, y: a.bl_y },
          doorHingeSide: a.door_hinge_side,
          doorSwing: a.door_swing,
          confidence: a.confidence ?? 0.5
        } as ShellAnchor)),
        hasPlumbing: w.has_plumbing ?? false,
        features: w.features
      } as WallSpec));

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
          positionY: f.position_y_percent,
          wallIndex: f.wall_index,
          condition: f.condition,
          confidence: f.confidence
        })),
        constraints: raw.demolition_notes ? [raw.demolition_notes] : [],
        camera,
        walls,
        primaryLightDirection: raw.primary_light_direction,
        plumbingWall: raw.plumbing_wall,
        occlusions: raw.occlusions
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
  const model = "gemini-3-pro-preview";

  const styleDesc = styleProfile.summary;
  const styleTags = styleProfile.tags.map(t => `${t.tag} (${t.weight})`).join(', ');
  const catalogForPrompt = products.map(p => ({
    id: p.id, brand: p.brand, name: p.name, category: p.category,
    price_low: p.price_low ?? p.price, price_high: p.price_high ?? p.price,
    price_tier: p.price_tier ?? 'mid', currency: p.currency,
    description: p.description || ''
  }));

  const tierGuidance = {
    [BudgetTier.BUDGET]: 'Budget tier: Select the most affordable products from the catalog. Minimize labor where possible (e.g., paint instead of tile on non-wet walls). Target the lowest reasonable total.',
    [BudgetTier.STANDARD]: 'Standard tier: Select mid-range products with good quality-price balance. Include all standard labor operations for a complete renovation.',
    [BudgetTier.PREMIUM]: 'Premium tier: Select the highest-quality products from the catalog. Include all labor operations plus finishing details (e.g., niche cuts, heated floor prep, premium grouting).',
  };

  const fixtureDetails = spec.existingFixtures
    .map(f => `${f.type}${f.condition ? ` (${f.condition})` : ''}${f.wallIndex !== undefined ? ` on wall ${f.wallIndex}` : ''}: ${f.description}`)
    .join(', ') || 'Unknown';

  const systemInstruction = `
    You are the De Badkamer Pricing Engine for the Netherlands/Belgium market.

    BUDGET TIER: ${tier}
    ${tierGuidance[tier]}

    ROOM DETAILS:
    - Dimensions: ${spec.estimatedWidthMeters}m × ${spec.estimatedLengthMeters}m = ${spec.totalAreaM2} m2
    - Ceiling height: ${spec.ceilingHeightMeters}m
    - Layout: ${spec.layoutShape}
    - Plumbing wall: ${spec.plumbingWall !== undefined ? `Wall ${spec.plumbingWall}` : 'Standard'}
    - Current state: ${spec.constraints.join(', ') || 'Standard condition, full demolition needed'}
    - Existing fixtures: ${fixtureDetails}

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
    1. Select materials from the catalog matching the user's style and budget tier. Products have price ranges (price_low to price_high) — use the midpoint for standard estimates, price_low for budget tier, price_high for premium tier.
    2. Calculate material quantities based on room dimensions (tiles in m2, fixtures in pieces).
    3. List all required labor operations using ONLY the rates from the labor table above. Consider:
       - Fixture condition affects demolition complexity (DAMAGED items may need extra care)
       - If fixtures move away from the plumbing wall, add PLUMBING_RELOCATION costs
       - Wall features (niches, beams) add labor for tiling cuts
    4. For each material, specify the correct unit (m2 for tiles, pcs for fixtures/faucets/lighting).
  `;

  try {
    const response = await withRetry(async (useDirect) => {
      const ai = createClient(useDirect);
      return ai.models.generateContent({
        model,
        contents: { parts: [{ text: "Generate the cost estimate JSON." }] },
        config: {
          systemInstruction,
          temperature: 0.1,
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

export { fetchRenderImagesForProducts as fetchProductImagesAsBase64 } from '../lib/productService';

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
  productImages: Map<string, { base64: string; mimeType: string }>,
  spec?: ProjectSpec
): Promise<string> => {
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
      text: "[INSPIRATION IMAGES — target aesthetic]"
    });
  }

  parts.push({
    inlineData: { mimeType: bathroomMimeType, data: bathroomBase64 }
  });
  parts.push({
    text: "[CURRENT BATHROOM — this is the room to renovate]"
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
      imageLabels.push(`Product ${imageIndex}: ${product.name} — category: ${product.category}`);
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
      scopeLines.push(`${nlLabel} — KEEP: Preserve this element EXACTLY as it appears in image 1. Same appearance, same material, same finish. May be repositioned if the layout requires it, but visual appearance stays identical.`);
    } else if (action === 'remove') {
      scopeLines.push(`${nlLabel} — REMOVE: Remove this element completely. Fill the space seamlessly with floor and wall material.`);
    } else if (action === 'add') {
      scopeLines.push(`${nlLabel} — ADD (${productImg || 'see reference'}): There is currently NO ${nlLabel.toLowerCase()} in this bathroom. Install the product from the reference photo in the most logical position.`);
    } else {
      if (productImg) {
        scopeLines.push(`${nlLabel} — REPLACE (${productImg}): Remove existing, install the product from the reference photo. Match color, shape, material, and finish EXACTLY.`);
      } else {
        scopeLines.push(`${nlLabel} — REPLACE: Replace with a modern, stylish alternative matching the design style.`);
      }
    }
  }

  const wallLabels = ['North', 'East', 'South', 'West'];

  let anchorLines = '';
  let occlusionLines: string[] = [];
  let spatialContext = '';

  if (spec) {
    anchorLines = (spec.walls || [])
      .filter(w => w.visible && w.anchors && w.anchors.length > 0)
      .flatMap(w => w.anchors.map(a =>
        `- ${a.elementType} on ${wallLabels[w.wallIndex] || `Wall ${w.wallIndex}`} wall: `
        + `corners [${a.tl.x}%,${a.tl.y}%] → [${a.br.x}%,${a.br.y}%]`
        + (a.doorHingeSide && a.doorHingeSide !== 'UNKNOWN' ? `, hinge ${a.doorHingeSide}` : '')
        + (a.confidence < 0.6 ? ' (low confidence — verify visually)' : '')
      )).join('\n');

    occlusionLines = spec.occlusions || [];

    const wallSummary = (spec.walls || [])
      .map(w => {
        const wParts = [wallLabels[w.wallIndex] || `Wall ${w.wallIndex}`];
        if (!w.visible) { wParts.push('NOT VISIBLE'); return wParts.join(': '); }
        const anchorTypes = (w.anchors || []).map(a => a.elementType);
        if (anchorTypes.includes('WINDOW')) wParts.push('WINDOW');
        if (anchorTypes.includes('DOOR')) wParts.push('DOOR');
        if (anchorTypes.includes('NICHE')) wParts.push('NICHE');
        if (w.hasPlumbing) wParts.push('plumbing');
        if (w.features) wParts.push(w.features);
        return wParts.join(': ');
      }).join(' | ');

    const fixtureSummary = spec.existingFixtures
      .map(f => `${f.type} at X:${f.positionX ?? '?'}% Y:${f.positionY ?? '?'}% (wall ${f.wallIndex ?? '?'}, ${f.condition ?? 'unknown'}${f.confidence !== undefined ? `, conf:${f.confidence}` : ''})`)
      .join('; ');

    const cameraDesc = spec.camera
      ? `${spec.camera.position} from ${wallLabels[spec.camera.facingFromWall] || `wall ${spec.camera.facingFromWall}`}, ${spec.camera.lensFeel} lens`
      : 'unknown';

    spatialContext = `
SPATIAL CONTEXT (from architectural analysis of this photo):
- Room: ${spec.estimatedWidthMeters}m x ${spec.estimatedLengthMeters}m, ceiling ${spec.ceilingHeightMeters}m
- Layout: ${spec.layoutShape}
- Camera: ${cameraDesc}
- Primary light: ${spec.primaryLightDirection ?? 'unknown'} direction
- Plumbing wall: ${wallLabels[spec.plumbingWall ?? 0] || '?'}
- Walls: ${wallSummary || 'not analyzed'}
- Existing fixtures: ${fixtureSummary || 'not analyzed'}
${occlusionLines.length > 0 ? `- Occlusions: ${occlusionLines.join('; ')}` : ''}

Use this as a GUIDE — verify against the actual photo. The photo is the ground truth.
`;
  }

  const prompt = `
Transform the bathroom in the photo into a fully renovated space.
You are a senior interior architect with complete creative freedom over the layout and design.

OUTPUT FORMAT:
Generate a single image containing a 2x2 grid of 4 DIFFERENT renovation variations.
Each quadrant shows one complete renovation of the same room:
- Top-left: Variation A
- Top-right: Variation B
- Bottom-left: Variation C
- Bottom-right: Variation D

ALL 4 variations must:
- Use the SAME camera angle, perspective, and room geometry from image 1
- Use the SAME products from the reference photos
- Respect ALL the same structural constraints below

Each variation DIFFERS in:
- Fixture arrangement within the same plumbing zone (not drastically relocated)
- Tile laying pattern or grout emphasis
- Lighting mood (e.g., brighter morning vs softer evening)
- Spatial composition (how the eye flows through the scene)

Separate quadrants with a thin 4px white border.
Each quadrant must be a COMPLETE, fully rendered bathroom — not a crop or partial view.
${spatialContext}
STEP 1 — STUDY THE EXISTING ROOM:
Analyze image 1 carefully. The architectural analysis detected these structural elements — verify them against the photo:
${anchorLines || '(no anchor data available — rely on visual analysis)'}
${occlusionLines.length > 0 ? `\nNot visible in this photo: ${occlusionLines.join(', ')}` : ''}

Confirm for yourself:
- The exact camera angle, height, and perspective
- The vanishing point and how walls recede
- Where the window(s) are and how light enters
- Where the door is
- The room proportions (which walls are longer, which shorter)
- Any architectural features (beams, niches, alcoves, sloped ceiling)
ALL of these remain IDENTICAL in the final image.

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

ABSOLUTE CONSTRAINTS (non-negotiable):
- Outer walls = IDENTICAL to the bathroom photo
- Window positions and sizes = IDENTICAL to the bathroom photo
- Door positions = IDENTICAL to the bathroom photo
- Ceiling beams, slopes = IDENTICAL to the bathroom photo
- Camera angle and perspective = IDENTICAL to the bathroom photo
- Do NOT add windows or doors not in the original photo
- KEPT items match their appearance in the original photo
- REPLACED items match their reference product photos exactly
${occlusionLines.length > 0 ? `- Occluded zones (${occlusionLines.join('; ')}): do NOT invent or render elements in areas not visible in image 1` : ''}
- All 4 grid quadrants share identical room geometry, camera angle, window/door positions, and product selections
- Each quadrant is a complete, unobstructed view — no overlaps, labels, or text on the image
- The final image should contain 4 professional interior photographs arranged in a 2x2 grid. Each quadrant should look like it belongs in a high-end design magazine — sharp, well-composed, inviting, and real. All 4 must show the SAME room from the SAME angle with the SAME products, but with meaningfully different layout and atmosphere choices.
`;

  parts.push({ text: prompt });

  try {
    const response = await withRetry(async (useDirect) => {
      const ai = createClient(useDirect);
      return ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: {
            imageSize: '4K',
          },
        },
      });
    }, 2, 8000, true);

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
