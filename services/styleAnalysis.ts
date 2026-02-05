import { GoogleGenAI, Type } from "@google/genai";
import { StyleProfile, StyleTag } from "../types";

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

export async function analyzeStyleFromReferences(
  images: { base64: string; mimeType: string }[],
  tagVocabulary: string[]
): Promise<StyleProfile> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const model = "gemini-3-pro-preview";

  const vocabList = tagVocabulary.map(t => `"${t}"`).join(', ');

  const systemInstruction = `
    You are an interior design style analyst specializing in bathroom aesthetics.
    Your task: analyze reference images provided by a customer and extract a precise style profile that will guide their bathroom renovation design.

    CONTROLLED VOCABULARY:
    You MUST select tags exclusively from this list: [${vocabList}]
    Do not invent new tags. If a style element does not match any tag, skip it.

    WEIGHTING RULES:
    - 1.0 = dominant, defining characteristic visible in all/most images
    - 0.7-0.9 = strong presence, clearly intentional design choice
    - 0.5-0.6 = moderate presence, supporting element
    - 0.3-0.4 = subtle hint, minor accent
    - Below 0.3 = do not include

    ANALYSIS APPROACH:
    Look at these specific design dimensions across all images:
    1. Color palette: dominant colors, accent colors, contrast level
    2. Materials: stone, wood, metal, glass, ceramic - types and finishes
    3. Lines and forms: geometric vs organic, angular vs curved
    4. Spatial feel: minimal vs layered, open vs intimate, industrial vs warm
    5. Fixtures style: modern vs classic, chrome vs matte, wall-mounted vs freestanding

    SUMMARY:
    Write 1-2 sentences in Dutch describing the overall style direction.
    Be specific and evocative (e.g., "Strakke, minimalistische stijl met warme houttinten en matzwarte accenten" rather than "Moderne badkamer").
  `;

  const parts: any[] = images.map(img => ({
    inlineData: { mimeType: img.mimeType, data: img.base64 }
  }));
  parts.push({ text: `These are ${images.length} bathroom/interior reference image(s) selected by the customer as inspiration. Analyze the common style patterns across all images and extract the style profile.` });

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
            summary_nl: { type: Type.STRING },
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
        summary: raw.summary_nl || 'Stijlanalyse op basis van referentiebeelden.',
        source: 'ai_vision',
      };
    }
    throw new Error("Style analysis failed");
  } catch (error) {
    console.error("Style analysis error:", error);
    return {
      tags: tagVocabulary.slice(0, 5).map(tag => ({ tag, weight: 0.5 })),
      summary: 'Automatische stijlanalyse niet beschikbaar. Standaard profiel toegepast.',
      source: 'ai_vision',
    };
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
