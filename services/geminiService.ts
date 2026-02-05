import { GoogleGenAI, Type } from "@google/genai";
import { ProjectSpec, Estimate, BudgetTier, FixtureType, MaterialConfig, StyleProfile, DatabaseProduct } from "../types";

const getApiKey = (): string => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
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
    You are Renisol's Lead Architectural AI.
    Analyze the input image as a 3D spatial environment, not a 2D picture.

    TASK:
    1. ANCHOR REFERENCE: Identify a standard object (Door, Toilet, Tile size) to calibrate scale.
    2. GEOMETRY: Construct a wireframe model of the room.
    3. INVENTORY: Detect fixtures and their condition (e.g., "Toilet: Wall-hung, needs demolition").

    OUTPUT JSON:
    Return a strict JSON object with calibration logic and estimated dimensions.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: "Analyze structure and dimensions." }
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

  const prompt = `
    OPERATION: EDIT_IMAGE
    INPUT: Bathroom photo provided.
    MASK_LOGIC: AUTO_SEGMENT (Furniture, Sanitary Ware, Decor)

    INSTRUCTION:
    "Perform a virtual demolition.
    1. Erase all identified furniture, toilets, sinks, and mirrors.
    2. Infill the erased areas with 'raw grey concrete screed' on the floor and 'rough white plaster' on the walls.
    3. STRICTLY PRESERVE: The original perspective, window frames, door frames, and ceiling beams.
    4. LIGHTING: Keep the original natural light direction and shadows."
  `;

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
    You are the Renisol Pricing Engine.
    You do not guess prices. You map requirements to specific Catalog IDs and Labor Operations.

    CONTEXT:
    - Room Surface: ${spec.totalAreaM2} m2
    - Current State: ${spec.constraints.join(', ') || 'Standard demolition'}
    - User Style Profile: ${styleDesc}
    - Style Descriptors: ${styleTags}
    - Catalog: ${JSON.stringify(catalogForPrompt)}
    - User Material Config: ${JSON.stringify(materials)}

    TASK:
    1. Select Materials: Choose the best SKU from the Catalog that matches the User Style and Material Config.
    2. Define Labor: Based on the room state, list necessary labor codes (e.g., if 'waste_type' changed, add 'PLUMBING_RELOCATION').
    3. Calculate: Output precise line items.

    OUTPUT JSON:
    Return a strict JSON object with 'materials' and 'labor_operations'.
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
        summary: raw.summary_text || "Based on Renisol Pricing Engine logic."
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

  const sinkLocation = spec.existingFixtures.find(f => f.type === FixtureType.SINK);
  const sinkCoords = sinkLocation ? `X:${sinkLocation.positionX}%, Y:${sinkLocation.positionY}%` : "standard position";

  const getProductImage = (name: string): string => {
    return products.find(p => p.name === name)?.image_url || "";
  };

  const styleDesc = styleProfile.summary;
  const topTags = styleProfile.tags.slice(0, 8).map(t => t.tag).join(', ');

  const prompt = `
    TASK: Architectural Visualization (Renovation After-State)
    BASE_IMAGE: The provided empty shell image.

    REFERENCE_MATERIALS:
    - Floor/Wall: ${materials.floorTile} (Reference: ${getProductImage(materials.floorTile)})
    - Faucets: ${materials.faucetFinish} (Reference: ${getProductImage(materials.faucetFinish)})
    - Toilet: ${materials.toiletType} (Reference: ${getProductImage(materials.toiletType)})
    - Vanity: ${materials.vanityType} (Reference: ${getProductImage(materials.vanityType)})
    - Lighting: ${materials.lightingType} (Reference: ${getProductImage(materials.lightingType)})
    ${materials.bathtubType ? `- Bathtub: ${materials.bathtubType} (Reference: ${getProductImage(materials.bathtubType)})` : ''}
    ${materials.showerType ? `- Shower: ${materials.showerType} (Reference: ${getProductImage(materials.showerType)})` : ''}

    STYLE:
    Description: ${styleDesc}
    Key characteristics: ${topTags}

    PROMPT:
    "Apply the reference materials to the base room shell.
    - Apply ${materials.floorTile} to the floor and wet-area walls (seamless texture).
    - Place ${materials.vanityType} at ${sinkCoords}.
    - Render emphasizing these design qualities: ${topTags}.
    - Lighting: Cinematic, soft morning light, volumetric dust.
    - Quality: 8k, Unreal Engine 5, Raytraced Global Illumination.
    - Constraint: Do not hallucinate new windows. Keep geometry of BASE_IMAGE."
  `;

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
