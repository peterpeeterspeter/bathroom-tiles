import { GoogleGenAI, Type } from "@google/genai";
import { ProjectSpec, Estimate, BudgetTier, FixtureType, MaterialConfig, StyleProfile, DatabaseProduct } from "../types";

const getApiKey = (): string => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.API_KEY) return process.env.API_KEY;
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  }
  try {
    const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (viteKey) return viteKey;
  } catch {}
  return '';
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
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const model = "gemini-3-pro-preview";

  const systemInstruction = `
    You are a spatial analysis AI for a Dutch/Belgian bathroom renovation company.
    Your job: extract accurate room dimensions and fixture inventory from a single bathroom photo.

    CALIBRATION STRATEGY:
    Use known reference objects visible in the photo to infer real-world scale:
    - Standard interior door: 201.5cm tall x 83cm wide (Dutch/Belgian norm)
    - Standard toilet: ~40cm wide x 70cm deep x 40cm seat height
    - Common tile sizes: 30x30cm, 30x60cm, 60x60cm
    - Standard bathtub: 170cm x 70cm
    - Ceiling height typical range: 240-260cm
    Identify which reference object you used and explain your reasoning.

    FIXTURE DETECTION:
    For each fixture, determine:
    - What it is and its mounting type (wall-hung vs floor-standing, built-in vs freestanding)
    - Approximate position in the room (as percentage coordinates: 0,0 = top-left corner, 100,100 = bottom-right)
    - Whether demolition/removal is needed for renovation

    DIMENSION ESTIMATION:
    - Estimate width and length to the nearest 0.1 meter
    - If only one wall is visible, use fixture sizes and perspective cues to estimate depth
    - Classify the room layout shape based on visible geometry
    - Default ceiling height to 2.4m if not determinable

    Be conservative with estimates. It is better to slightly underestimate room size than overestimate.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: "Analyze this bathroom photo. Identify the calibration reference object you are using, estimate the room dimensions in meters, classify the layout shape, and list every fixture with its type and approximate position." }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calibration_object: { type: Type.STRING, description: "The object used to infer scale (e.g. 'Standard Door 210cm')" },
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
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const model = "gemini-3-pro-image-preview";
  const mimeType = getMimeType(base64Image);

  const fixtureList = spec.existingFixtures.map(f => f.description).join(', ') || 'all sanitary fixtures and furniture';

  const prompt = `Edit this bathroom photo to show the room after complete demolition and stripping.

Remove the following items completely: ${fixtureList}. Also remove any mirrors, cabinets, shelving, towel racks, and decorative items.

Replace removed areas with:
- Floors: raw grey concrete screed, slightly rough texture
- Walls: bare white/grey plaster with subtle imperfections
- Expose any visible plumbing stub-outs where fixtures were removed

Critical constraints:
- Keep the exact same camera angle, perspective, and field of view
- Preserve all architectural elements: window frames, door frames, ceiling structure, and any structural beams
- Maintain the original lighting direction, color temperature, and shadow patterns
- The room should look like a real construction site mid-renovation, not a clean 3D render
- Do not add any new elements that were not in the original photo`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ inlineData: { mimeType, data: base64Image.split(',')[1] } }, { text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Empty shell failed");
  } catch (error) {
    return base64Image;
  }
};

export const calculateRenovationCost = async (
  spec: ProjectSpec,
  tier: BudgetTier,
  styleProfile: StyleProfile,
  materials: MaterialConfig,
  products: DatabaseProduct[]
): Promise<Estimate> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const model = "gemini-3-pro-preview";

  const styleDesc = styleProfile.summary;
  const styleTags = styleProfile.tags.map(t => `${t.tag} (${t.weight})`).join(', ');
  const catalogForPrompt = products.map(p => ({
    id: p.id, brand: p.brand, name: p.name, category: p.category,
    price: p.price, currency: p.currency, image_url: p.image_url
  }));

  const systemInstruction = `
    You are a bathroom renovation cost estimator for the Dutch/Belgian market.
    You produce realistic, itemized cost estimates by matching user requirements to catalog products and standard labor rates.

    ROOM SPECIFICATIONS:
    - Floor area: ${spec.totalAreaM2} m2
    - Dimensions: ${spec.estimatedWidthMeters}m x ${spec.estimatedLengthMeters}m, ceiling ${spec.ceilingHeightMeters}m
    - Wall area (estimated): ${((spec.estimatedWidthMeters + spec.estimatedLengthMeters) * 2 * spec.ceilingHeightMeters).toFixed(1)} m2
    - Current condition: ${spec.constraints.join('; ') || 'Standard condition, full demolition required'}
    - Existing fixtures to remove: ${spec.existingFixtures.map(f => f.description).join(', ') || 'Unknown'}

    USER STYLE PREFERENCES:
    ${styleDesc}
    Style tags: ${styleTags}

    USER MATERIAL SELECTIONS:
    ${Object.entries(materials).filter(([_, v]) => v && v !== 'AI_MATCH').map(([k, v]) => `- ${k}: ${v}`).join('\n    ') || 'No specific selections (use style-matched defaults from catalog)'}

    PRODUCT CATALOG (select from these only):
    ${JSON.stringify(catalogForPrompt)}

    LABOR RATE GUIDELINES (Dutch/Belgian market 2024-2025):
    - Demolition & waste removal: EUR 40-60/m2
    - Plumbing rough-in: EUR 800-1500 per bathroom
    - Electrical work: EUR 400-800 per bathroom
    - Waterproofing: EUR 30-50/m2
    - Floor tiling (supply excluded): EUR 45-65/m2
    - Wall tiling (supply excluded): EUR 50-70/m2
    - Fixture installation (toilet, sink, shower): EUR 150-300 per unit
    - Vanity/cabinet installation: EUR 200-400
    - Painting/finishing: EUR 15-25/m2

    RULES:
    1. Select materials from the catalog that best match the user's style and explicit selections
    2. Calculate material quantities realistically (tiles need ~10% waste factor, grout, adhesive, etc.)
    3. Use the unit_price from the catalog for materials. Multiply by quantity for total.
    4. Include all necessary labor operations for a complete renovation
    5. Labor costs should use the rate guidelines above, scaled to actual room size
    6. Every line item must have a clear reason explaining the selection
    7. Do not invent products not in the catalog. If no match exists, skip that category.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: `Generate a detailed, itemized cost estimate for renovating this ${spec.totalAreaM2}m2 bathroom. Select specific products from the catalog and include all labor operations needed for a complete renovation.` }] },
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
        category: 'Materials',
        amount: m.qty,
        unit: 'pcs/m2',
        unitPrice: m.unit_price,
        totalPrice: m.total_price,
        brand: m.sku.split('-')[0]
      }));

      const laborItems = raw.labor_operations.map((l: any) => ({
        description: l.description,
        category: 'Labor',
        amount: 1,
        unit: 'service',
        unitPrice: l.cost,
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
        summary: raw.summary_text || "Based on De Badkamer Pricing Engine logic."
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

export const generateRenovationRender = async (
  spec: ProjectSpec,
  styleProfile: StyleProfile,
  materials: MaterialConfig,
  base64Shell: string,
  products: DatabaseProduct[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const model = "gemini-3-pro-image-preview";
  const mimeType = getMimeType(base64Shell);

  const styleDesc = styleProfile.summary;
  const topTags = styleProfile.tags.slice(0, 8).map(t => t.tag).join(', ');

  const materialsList = [
    `Floor tiles: ${materials.floorTile}`,
    `Wall tiles: ${materials.wallTile !== materials.floorTile ? materials.wallTile : 'matching floor tiles on wet walls'}`,
    `Vanity/sink cabinet: ${materials.vanityType}`,
    `Faucets and hardware: ${materials.faucetFinish}`,
    `Toilet: ${materials.toiletType}`,
    `Lighting: ${materials.lightingType}`,
    materials.bathtubType ? `Bathtub: ${materials.bathtubType}` : null,
    materials.showerType ? `Shower: ${materials.showerType}` : null,
  ].filter(Boolean).join('\n');

  const sinkLocation = spec.existingFixtures.find(f => f.type === FixtureType.SINK);
  const toiletLocation = spec.existingFixtures.find(f => f.type === FixtureType.TOILET);
  const showerLocation = spec.existingFixtures.find(f => f.type === FixtureType.SHOWER);

  const layoutHints = [
    sinkLocation ? `Place vanity/sink roughly where the original sink was (${sinkLocation.positionX}% from left, ${sinkLocation.positionY}% from top)` : null,
    toiletLocation ? `Place toilet roughly where the original was (${toiletLocation.positionX}% from left, ${toiletLocation.positionY}% from top)` : null,
    showerLocation ? `Place shower roughly where the original was (${showerLocation.positionX}% from left, ${showerLocation.positionY}% from top)` : null,
  ].filter(Boolean).join('\n');

  const prompt = `Edit this empty bathroom shell to show the completed renovation.

Design style: ${styleDesc}
Key style characteristics: ${topTags}

Materials and fixtures to install:
${materialsList}

${layoutHints ? `Fixture placement guide:\n${layoutHints}` : 'Place fixtures in a logical, functional bathroom layout.'}

Room dimensions: approximately ${spec.estimatedWidthMeters}m x ${spec.estimatedLengthMeters}m.

Requirements:
- This should look like a professional architectural interior photograph, not a 3D render
- Natural, warm lighting as if photographed on a bright morning with soft indirect sunlight
- Tile grout lines should be visible and realistic
- Include small realistic details: a folded towel, a soap dispenser, a small plant
- Maintain the exact same camera perspective and room geometry as the input image
- Do not add windows, doors, or structural elements that are not in the original
- Walls should be tiled to approximately 120cm height in the wet zone, painted above
- The overall mood should feel luxurious but livable, like a high-end hotel bathroom`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ inlineData: { mimeType, data: base64Shell.split(',')[1] } }, { text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Render failed");
  } catch (error) {
    throw error;
  }
};
