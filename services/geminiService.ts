import { GoogleGenAI, Type } from "@google/genai";
import { ProjectSpec, Estimate, BudgetTier, FixtureType, MaterialConfig, StyleProfile, DatabaseProduct } from "../types";

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

export const generateEmptySpace = async (base64Image: string, spec: ProjectSpec): Promise<string> => {
  const ai = createClient();
  const model = "gemini-3-pro-image-preview";
  const mimeType = getMimeType(base64Image);

  const prompt = `Remove all furniture, fixtures, and sanitary ware from this bathroom photo. This includes toilets, sinks, vanities, mirrors, cabinets, and decorative items.

Fill the cleared areas naturally:
- Floors: raw grey concrete screed
- Walls: rough white plaster

Keep the room's structure exactly as-is: preserve the perspective, all window frames, door frames, ceiling beams, and the original lighting direction.

The result should look like a stripped-back empty shell ready for renovation.`;

  const attempt = async (): Promise<string> => {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ inlineData: { mimeType, data: base64Image.split(',')[1] } }, { text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("No image returned from empty shell generation");
  };

  try {
    return await attempt();
  } catch (firstError) {
    console.warn("Empty shell generation failed, retrying...", firstError);
    try {
      return await attempt();
    } catch (retryError) {
      console.error("Empty shell generation failed after retry:", retryError);
      throw new Error("Kon de ruimte niet leegmaken voor visualisatie. Probeer een andere foto met beter licht of een breder perspectief.");
    }
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
  products: DatabaseProduct[]
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

const fetchImageAsBase64 = async (url: string): Promise<{ data: string; mimeType: string } | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({ data: base64, mimeType });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const generateRenovationRender = async (
  spec: ProjectSpec,
  styleProfile: StyleProfile,
  materials: MaterialConfig,
  base64Shell: string,
  products: DatabaseProduct[]
): Promise<string> => {
  const ai = createClient();
  const model = "gemini-3-pro-image-preview";
  const mimeType = getMimeType(base64Shell);

  const sinkLocation = spec.existingFixtures.find(f => f.type === FixtureType.SINK);
  const sinkCoords = sinkLocation ? `X:${sinkLocation.positionX}%, Y:${sinkLocation.positionY}%` : "standard position";

  const getProductImageUrl = (name: string): string => {
    return products.find(p => p.name === name)?.image_url || "";
  };

  const styleDesc = styleProfile.summary;
  const topTags = styleProfile.tags.slice(0, 8).map(t => t.tag).join(', ');

  const materialEntries = [
    { label: 'Floor/Wall Tile', name: materials.floorTile },
    { label: 'Faucets', name: materials.faucetFinish },
    { label: 'Toilet', name: materials.toiletType },
    { label: 'Vanity', name: materials.vanityType },
    { label: 'Lighting', name: materials.lightingType },
    ...(materials.bathtubType ? [{ label: 'Bathtub', name: materials.bathtubType }] : []),
    ...(materials.showerType ? [{ label: 'Shower', name: materials.showerType }] : []),
  ];

  const imageUrls = materialEntries
    .map(e => getProductImageUrl(e.name))
    .filter(url => url && url.startsWith('http'));

  const fetchedImages = await Promise.all(
    imageUrls.slice(0, 4).map(url => fetchImageAsBase64(url))
  );

  const inlineImageParts: any[] = fetchedImages
    .filter((img): img is { data: string; mimeType: string } => img !== null)
    .map(img => ({ inlineData: { mimeType: img.mimeType, data: img.data } }));

  const materialList = materialEntries.map(e => `- ${e.label}: ${e.name}`).join('\n');

  const prompt = `Transform this empty bathroom shell into a beautifully renovated bathroom using these specific products and style.

PRODUCTS TO INSTALL:
${materialList}

${inlineImageParts.length > 0 ? 'The reference product images above show the exact materials, fixtures, and finishes to use.' : ''}

DESIGN STYLE: ${styleDesc}
Key qualities: ${topTags}

PLACEMENT GUIDANCE:
- Apply ${materials.floorTile} as floor tiles and on wet-area walls (seamless, properly grouted)
- Install ${materials.vanityType} at ${sinkCoords}
- Position fixtures naturally based on the room layout

PHOTOGRAPHY STYLE:
- Professional interior photography, eye-level perspective
- Soft natural daylight from existing windows, warm color temperature
- Magazine-quality composition, clean and inviting atmosphere
- Sharp focus throughout, subtle depth of field on background

CONSTRAINTS:
- Do not add windows or doors that aren't in the original image
- Maintain the exact room geometry and perspective of the base image
- Keep all architectural elements (beams, niches, alcoves) intact`;

  const parts: any[] = [
    { inlineData: { mimeType, data: base64Shell.split(',')[1] } },
    ...inlineImageParts,
    { text: prompt },
  ];

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Render failed");
  } catch (error) {
    throw error;
  }
};
