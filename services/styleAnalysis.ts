import { GoogleGenAI, Type } from "@google/genai";
import { StyleProfile, StyleTag, ExpertAnalysis } from "../types";

const getApiKey = (): string => {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
  if (key) return key;
  try {
    const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_GOOGLE_AI_API_KEY;
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
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error('[StyleAnalysis] Missing API key. Set VITE_GEMINI_API_KEY or VITE_GOOGLE_AI_API_KEY in Vercel.');
    throw new Error('Style analysis is not configured.');
  }

  const baseUrl = getBaseUrl();
  return new GoogleGenAI({
    apiKey,
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

export async function analyzeStyleFromReferences(
  images: { base64: string; mimeType: string }[],
  tagVocabulary: string[]
): Promise<StyleProfile> {
  const ai = createClient();
  const model = "gemini-3-flash-preview";

  const vocabList = tagVocabulary.map(t => `"${t}"`).join(', ');

  const systemInstruction = `
    You are an interior design style analyst for Bathroom Tiles, a US tile-focused bathroom renovation company.
    Analyze the provided reference images and extract the dominant style characteristics for tile selection.

    CRITICAL: You must select tags ONLY from this controlled vocabulary:
    [${vocabList}]

    Assign a weight between 0.0 and 1.0 to each tag based on how prominently it appears in the images.
    Only include tags with weight >= 0.3.

    Provide a short English summary (1-2 sentences) describing the overall style for tile choices.
  `;

  const parts: any[] = images.map(img => ({
    inlineData: { mimeType: img.mimeType, data: img.base64 }
  }));
  parts.push({ text: "Analyze the style characteristics of these bathroom reference images for tile selection." });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tag: { type: Type.STRING },
                  weight: { type: Type.NUMBER }
                },
                required: ["tag", "weight"]
              }
            },
            summary_nl: { type: Type.STRING, description: "English summary (1-2 sentences)" },
          },
          required: ["tags", "summary_nl"]
        }
      }
    });

    if (response.text) {
      const raw = JSON.parse(cleanJson(response.text));
      const validTags = new Set(tagVocabulary);
      const tags: StyleTag[] = (raw.tags || [])
        .filter((t: any) => validTags.has(t.tag) && t.weight >= 0.3)
        .map((t: any) => ({ tag: t.tag, weight: Math.min(1, Math.max(0, t.weight)) }))
        .sort((a: StyleTag, b: StyleTag) => b.weight - a.weight);

      return {
        tags,
        summary: raw.summary_nl || 'Style analysis based on reference images.',
        source: 'ai_vision',
      };
    }
    throw new Error("Style analysis failed");
  } catch (error) {
    console.error("Style analysis error:", error);
    return {
      tags: tagVocabulary.slice(0, 5).map(tag => ({ tag, weight: 0.5 })),
      summary: 'Style analysis unavailable. Default profile applied.',
      source: 'ai_vision',
    };
  }
}

export interface ProjectContextInput {
  stylePreset?: { name: string; tags: string[]; description: string };
  referenceImages?: { base64: string; mimeType: string }[];
  bathroomPhoto: { base64: string; mimeType: string };
  dimensions: { widthM: number; lengthM: number; heightM: number };
  tagVocabulary: string[];
}

export async function analyzeProjectContext(input: ProjectContextInput): Promise<StyleProfile> {
  const ai = createClient();
  const model = "gemini-3-flash-preview";

  const vocabList = input.tagVocabulary.map(t => `"${t}"`).join(', ');
  const area = (input.dimensions.widthM * input.dimensions.lengthM).toFixed(1);

  const hasPreset = !!input.stylePreset;
  const hasRefs = !!(input.referenceImages && input.referenceImages.length > 0);

  let styleContext = '';
  if (hasPreset) {
    styleContext += `The customer has chosen style "${input.stylePreset!.name}" (${input.stylePreset!.description}).\nStyle tags: ${input.stylePreset!.tags.join(', ')}.`;
  } else {
    styleContext += 'The customer has not chosen a specific style preference.';
  }
  if (!hasRefs && hasPreset) {
    styleContext += `\nThe customer has not uploaded inspiration images. Base your advice entirely on the "${input.stylePreset!.name}" profile.`;
  }

  const systemInstruction = `You are an experienced interior architect at Bathroom Tiles, a US company focused on bathroom tile renovations.

YOUR TASK:
Analyze the current bathroom photo step by step. Use any inspiration images and style preference as a guide. FOCUS ON TILE WORK — floor and wall tiles only. We do NOT replace fixtures (toilet, vanity, shower, bathtub, faucet, mirror, lighting).

CONTEXT:
${styleContext}
Dimensions: ${input.dimensions.widthM}m × ${input.dimensions.lengthM}m × ${input.dimensions.heightM}m (${area} m²).

US TILE COST CONTEXT (2026):
- Labor: $45-$75/hr
- Standard tiles: $30-$60/m², designer tiles: $65-$130/m²
- Porcelain large-format: $80-$150/m²
- Natural stone: $100-$200/m² (luxe, higher maintenance)
- Tile-only renovation (9m²): typical $4,000-$8,000
- Budget: from $2,500 | Premium: to $12,000+

WORKFLOW — follow these steps in order:

STEP 1 — CURRENT STATE (currentState)
Look at the photo. Describe briefly:
- Layout and size (does it match the given dimensions?)
- Materials you see (tiles, floor, wall finishes)
- Condition of existing tiles
- Strong points to preserve
- Weak points that need tile work

STEP 2 — CONDITION SCORE (condition_score)
Give a score 1-10:
1-3 = Dated, tile work needed urgently
4-5 = Functional but dated
6-7 = Fair condition, cosmetic tile update desired
8-10 = Good condition, premium tile upgrade desired

STEP 3 — KEEP ELEMENTS (keepElements)
Which elements are worth keeping? (e.g., good window frame, heated floor, recent plumbing)
Only list elements you ACTUALLY see in the photo. Empty list if none.

STEP 4 — OPPORTUNITIES (opportunities)
Name 3-4 concrete opportunities for THIS specific space.
Format per opportunity: "[What you see] → [The opportunity this offers]"

STEP 5 — RECOMMENDATIONS (recommendations)
Give 3-4 concrete TILE-focused recommendations (floor/wall tiles only):
- Match the customer's style preference
- Suit the space and dimensions
- Include indicative price range from the cost context above
- Do NOT recommend fixture replacement (vanity, toilet, shower, etc.)

STEP 6 — LAYOUT ADVICE (layoutAdvice)
Brief advice on the layout:
- Where are the existing connections (as far as visible)?
- Most practical arrangement given dimensions?
- Does plumbing need to move? (yes/no and why)

STEP 7 — COMPLEXITY (estimated_complexity)
Estimate complexity: "simple" (2-6 days), "moderate" (1-2 weeks), or "complex" (2-3+ weeks)

STEP 8 — STYLE TAGS (tags)
Select tags ONLY from this vocabulary: [${vocabList}]
Assign weight 0.0-1.0 based on how well the tag fits the DESIRED renovation. Only tags >= 0.3.

STEP 9 — SUMMARY (summary_nl)
Write a professional 2-3 sentence summary in English. Confident, practical, enthusiastic but realistic. Name the key transformation possible.

QUALITY RULES:
- Write EVERYTHING in English
- Be concrete and specific for THIS bathroom — not generic
- Focus on TILE recommendations only
- Avoid generic advice; specify colors, materials, walls`;

  const parts: any[] = [];

  if (hasRefs) {
    for (const img of input.referenceImages!) {
      parts.push({
        inlineData: { mimeType: img.mimeType, data: img.base64 }
      });
    }
    parts.push({ text: "[INSPIRATION IMAGES — this is the style the customer wants to achieve]" });
  }

  parts.push({
    inlineData: { mimeType: input.bathroomPhoto.mimeType, data: input.bathroomPhoto.base64 }
  });
  parts.push({ text: "[CURRENT BATHROOM PHOTO — this is the current state to be renovated]" });

  parts.push({ text: "Analyze the current bathroom step by step and give a professional tile-focused renovation recommendation based on all available information." });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentState: {
              type: Type.STRING,
              description: "Detailed description of the current bathroom based on the photo: layout, materials, condition, strengths and weaknesses. At least 4-6 sentences."
            },
            condition_score: {
              type: Type.INTEGER,
              description: "Condition score 1-10 (1-3 dated, 4-5 functional but dated, 6-7 fair, 8-10 good)"
            },
            keepElements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Elements worth keeping. Only what is actually visible in the photo."
            },
            opportunities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 concrete tile opportunities for this space. Format: '[What you see] → [The opportunity]'."
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 concrete TILE recommendations with price indication. Focus on floor/wall tiles only."
            },
            layoutAdvice: {
              type: Type.STRING,
              description: "Advice on layout: existing connections, practical arrangement, whether plumbing must move."
            },
            estimated_complexity: {
              type: Type.STRING,
              description: "Estimated complexity: 'simple' (2-6 days), 'moderate' (1-2 weeks), or 'complex' (2-3+ weeks)"
            },
            tags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tag: { type: Type.STRING },
                  weight: { type: Type.NUMBER }
                },
                required: ["tag", "weight"]
              },
              description: "Stijltags uit de gecontroleerde vocabulaire met gewichten (0.0-1.0), alleen tags >= 0.3"
            },
            summary_nl: {
              type: Type.STRING,
              description: "Professional 2-3 sentence summary in English. Confident, practical, enthusiastic but realistic."
            },
          },
          required: ["currentState", "condition_score", "keepElements", "opportunities", "recommendations", "layoutAdvice", "estimated_complexity", "tags", "summary_nl"]
        }
      }
    });

    if (response.text) {
      const raw = JSON.parse(cleanJson(response.text));
      const validTags = new Set(input.tagVocabulary);
      const tags: StyleTag[] = (raw.tags || [])
        .filter((t: any) => validTags.has(t.tag) && t.weight >= 0.3)
        .map((t: any) => ({ tag: t.tag, weight: Math.min(1, Math.max(0, t.weight)) }))
        .sort((a: StyleTag, b: StyleTag) => b.weight - a.weight);

      const rawComplexity = (raw.estimated_complexity || '').toLowerCase().trim();
      const complexityMap: Record<string, 'simple' | 'moderate' | 'complex'> = {
        simple: 'simple', eenvoudig: 'simple',
        moderate: 'moderate', gemiddeld: 'moderate',
        complex: 'complex',
      };
      const complexity: 'simple' | 'moderate' | 'complex' = complexityMap[rawComplexity] || 'moderate';

      const conditionScore = Math.max(1, Math.min(10, Math.round(Number(raw.condition_score) || 5)));

      const expertAnalysis: ExpertAnalysis = {
        currentState: raw.currentState || '',
        conditionScore,
        keepElements: raw.keepElements || [],
        opportunities: raw.opportunities || [],
        recommendations: raw.recommendations || [],
        layoutAdvice: raw.layoutAdvice || '',
        estimatedComplexity: complexity,
      };

      return {
        tags,
        summary: raw.summary_nl || 'Renovation recommendation based on your bathroom and style preference.',
        source: hasRefs ? 'combined' : (hasPreset ? 'preset' : 'ai_vision'),
        presetId: undefined,
        presetName: input.stylePreset?.name,
        expertAnalysis,
      };
    }
    throw new Error("Project context analysis failed");
  } catch (error) {
    console.error("Project context analysis error:", error);
    throw error;
  }
}

export function combineProfiles(preset: StyleProfile, vision: StyleProfile): StyleProfile {
  const tagMap = new Map<string, number>();

  for (const t of preset.tags) {
    tagMap.set(t.tag, t.weight * 0.6);
  }

  for (const t of vision.tags) {
    const existing = tagMap.get(t.tag);
    if (existing !== undefined) {
      tagMap.set(t.tag, (existing + t.weight) / 2);
    } else {
      tagMap.set(t.tag, t.weight);
    }
  }

  const tags: StyleTag[] = Array.from(tagMap.entries())
    .map(([tag, weight]) => ({ tag, weight }))
    .sort((a, b) => b.weight - a.weight);

  return {
    tags,
    summary: `${preset.summary} ${vision.summary}`.trim(),
    source: 'combined',
    presetId: preset.presetId,
    presetName: preset.presetName,
    referenceImageUrls: vision.referenceImageUrls,
  };
}

export function presetToProfile(preset: { id: number; name: string; label_nl: string; description_nl: string; tags: string[] }): StyleProfile {
  return {
    tags: preset.tags.map(tag => ({ tag, weight: 1.0 })),
    summary: preset.description_nl,
    source: 'preset',
    presetId: preset.id,
    presetName: preset.label_nl,
  };
}
