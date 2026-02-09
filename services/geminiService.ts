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
  const apiKey = getApiKey();
  console.log("Analysis - API Key configured:", apiKey ? "Yes" : "No");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    You are De Badkamer's Lead Architectural AI.
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
  const apiKey = getApiKey();
  console.log("Empty space generation - API Key configured:", apiKey ? "Yes" : "No");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image";
  const mimeType = getMimeType(base64Image);

  const prompt = `Edit this bathroom image to create an empty shell:

Remove all fixtures, furniture, and decorations (toilets, sinks, bathtubs, mirrors, cabinets, etc.)
Replace floor with raw grey concrete screed
Replace walls with rough white plaster
Keep the exact room geometry, windows, door frames, and ceiling structure unchanged
Maintain the original lighting and perspective`;

  console.log("Generating empty space with model:", model);

  try {
    const imageData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    console.log("Sending empty space request to Gemini API...");
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageData } },
          { text: prompt }
        ]
      }
    });

    console.log("Empty space response received");

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log("Empty space generated successfully");
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    console.warn("No empty space image in response, using original");
    return base64Image;
  } catch (error: any) {
    console.error("Empty space generation error:", error);
    console.warn("Falling back to original image");
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
  const apiKey = getApiKey();
  console.log("Cost calculation - API Key configured:", apiKey ? "Yes" : "No");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";

  const styleDesc = styleProfile.summary;
  const styleTags = styleProfile.tags.map(t => `${t.tag} (${t.weight})`).join(', ');
  const catalogForPrompt = products.map(p => ({
    id: p.id, brand: p.brand, name: p.name, category: p.category,
    price: p.price, currency: p.currency, image_url: p.image_url
  }));

  const systemInstruction = `
    You are the De Badkamer Pricing Engine.
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
  const apiKey = getApiKey();
  console.log("API Key configured:", apiKey ? "Yes" : "No");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image";
  const mimeType = getMimeType(base64Shell);

  const sinkLocation = spec.existingFixtures.find(f => f.type === FixtureType.SINK);
  const sinkCoords = sinkLocation ? `X:${sinkLocation.positionX}%, Y:${sinkLocation.positionY}%` : "standard position";

  const getProductImage = (name: string): string => {
    return products.find(p => p.name === name)?.image_url || "";
  };

  const styleDesc = styleProfile.summary;
  const topTags = styleProfile.tags.slice(0, 8).map(t => t.tag).join(', ');

  const prompt = `Transform this bathroom shell image into a fully renovated bathroom with these specifications:

MATERIALS:
- Floor/Wall tiles: ${materials.floorTile}
- Faucets: ${materials.faucetFinish}
- Toilet: ${materials.toiletType}
- Vanity: ${materials.vanityType}
- Lighting: ${materials.lightingType}
${materials.bathtubType ? `- Bathtub: ${materials.bathtubType}` : ''}
${materials.showerType ? `- Shower: ${materials.showerType}` : ''}

STYLE: ${styleDesc}
Key design elements: ${topTags}

Instructions:
- Keep the exact room geometry, windows, and ceiling structure
- Apply the specified materials and fixtures realistically
- Create photorealistic rendering with natural lighting
- Emphasize the ${topTags} aesthetic
- Place vanity at ${sinkCoords}`;

  console.log("Starting image generation with model:", model);
  console.log("Prompt length:", prompt.length);
  console.log("Image size:", base64Shell.length, "bytes");

  try {
    const imageData = base64Shell.includes(',') ? base64Shell.split(',')[1] : base64Shell;

    console.log("Sending request to Gemini API...");
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageData } },
          { text: prompt }
        ]
      }
    });

    console.log("Response received from Gemini API");
    console.log("Candidates:", response.candidates?.length || 0);

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log("Image generated successfully");
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    console.error("No image data in response");
    throw new Error("No image generated in response");
  } catch (error: any) {
    console.error("Image generation error:", error);
    console.error("Error details:", {
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText
    });
    throw new Error(`Image generation failed: ${error?.message || 'Unknown error'}`);
  }
};
