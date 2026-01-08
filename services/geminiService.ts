
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectSpec, Estimate, RenovationStyle, BudgetTier, FixtureType, MaterialConfig } from "../types";
import { PRODUCT_CATALOG } from "./productCatalog";

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

export const analyzeBathroomInput = async (base64Image: string, mimeType: string = "image/jpeg"): Promise<ProjectSpec> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const model = "gemini-3-pro-preview"; 

  const systemInstruction = `
    You are an expert architectural surveyor for Renisol Bouwgroep. 
    Analyze the bathroom photo/sketch to extract structural details.
    1. DIMENSIONS: Estimate Width/Length (m). 
    2. SHAPE: Identify if the room is RECTANGLE or L_SHAPE.
    3. FIXTURES: Find Windows, Doors, Toilets, Sinks. 
    4. COORDINATES: Map them to relative X/Y (0-100).
    Return strict JSON ONLY.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: "Extract room geometry and structural elements." }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roomType: { type: Type.STRING },
            layoutShape: { type: Type.STRING, enum: ["RECTANGLE", "L_SHAPE", "SQUARE"] },
            estimatedWidthMeters: { type: Type.NUMBER },
            estimatedLengthMeters: { type: Type.NUMBER },
            ceilingHeightMeters: { type: Type.NUMBER },
            totalAreaM2: { type: Type.NUMBER },
            existingFixtures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: Object.values(FixtureType) },
                  description: { type: Type.STRING },
                  fixed: { type: Type.BOOLEAN },
                  positionX: { type: Type.NUMBER },
                  positionY: { type: Type.NUMBER }
                },
                required: ["type", "positionX", "positionY"]
              }
            }
          },
          required: ["estimatedWidthMeters", "estimatedLengthMeters", "existingFixtures"]
        }
      }
    });

    if (response.text) return JSON.parse(cleanJson(response.text));
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

  const structuralElements = spec.existingFixtures
    .filter(f => f.type === FixtureType.WINDOW || f.type === FixtureType.DOOR)
    .map(f => `${f.type} at ${f.positionX}%X, ${f.positionY}%Y`)
    .join(", ");

  const prompt = `
    INSTRUCTION: Architectural Demolition Rendering.
    INPUT: Bathroom photo.
    PRESERVE: Exact room geometry, walls, floor, ceiling, and structural items (${structuralElements}).
    REMOVE: Every piece of furniture, plumbing fixture, toilet, sink, mirror, and decoration.
    RESULT: A photorealistic, empty room shell with neutral base textures (plaster/concrete).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } }, { text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Empty shell failed");
  } catch (error) {
    return base64Image;
  }
};

export const calculateRenovationCost = async (spec: ProjectSpec, tier: BudgetTier, style: RenovationStyle, materials: MaterialConfig): Promise<Estimate> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const model = "gemini-3-pro-preview";

  const systemInstruction = `
    You are a professional renovation estimator for Renisol. 
    Generate a price indication for a bathroom renovation based on a mood and specific materials.
    
    CATALOG: ${JSON.stringify(PRODUCT_CATALOG)}.
    AREA: ${spec.estimatedWidthMeters * spec.estimatedLengthMeters} m2.
    STYLE: ${style}.
    USER CHOICES: ${JSON.stringify(materials)}.

    RULES:
    1. Match the chosen product names to catalog entries for pricing.
    2. Add standard European installation labor ($3500 - $6000 base).
    3. Include tiling, plumbing, and electrical labor.
    4. Provide strict JSON.
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
            lineItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  unitPrice: { type: Type.NUMBER },
                  totalPrice: { type: Type.NUMBER },
                  brand: { type: Type.STRING }
                }
              }
            },
            subtotal: { type: Type.NUMBER },
            tax: { type: Type.NUMBER },
            grandTotal: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["grandTotal", "lineItems"]
        }
      }
    });

    if (response.text) return JSON.parse(cleanJson(response.text));
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

export const generateRenovationRender = async (spec: ProjectSpec, style: RenovationStyle, materials: MaterialConfig, base64Shell: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const model = "gemini-3-pro-image-preview";

  const prompt = `
    TASK: Architectural Visualization for Renisol Bouwgroep.
    SHELL: Use the provided empty bathroom shell for perspective and geometry.
    DESIGN: Style must be ${style}.
    MATERIALS: 
    - Floor/Wall: ${materials.floorTile}
    - Faucets: ${materials.faucetFinish}
    - Toilet: ${materials.toiletType}
    - Vanity: ${materials.vanityType}
    - Lighting: ${materials.lightingType}
    BRAND AESTHETICS: Grohe, Duravit, and Gessi.
    QUALITY: High-end architectural photography, cinematic lighting, 8k resolution.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ inlineData: { mimeType: "image/jpeg", data: base64Shell.split(',')[1] } }, { text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Render failed");
  } catch (error) {
    throw error;
  }
};
