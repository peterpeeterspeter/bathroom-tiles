import { GoogleGenAI, Type } from "@google/genai";
import { StyleProfile, StyleTag } from "../types";

const createClient = () => {
  const apiKey = process.env.GOOGLE_AI_API_KEY || '';

  if (!apiKey) {
    console.error('[StyleAnalysis] Missing GOOGLE_AI_API_KEY.');
    throw new Error('Style analysis is not configured.');
  }

  return new GoogleGenAI({ apiKey });
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
    You are an interior design style analyst for De Badkamer, a premium bathroom renovation company.
    Analyze the provided reference images and extract the dominant style characteristics.

    CRITICAL: You must select tags ONLY from this controlled vocabulary:
    [${vocabList}]

    Assign a weight between 0.0 and 1.0 to each tag based on how prominently it appears in the images.
    Only include tags with weight >= 0.3.

    Provide a short Dutch summary (1-2 sentences) describing the overall style.
  `;

  const parts: any[] = images.map(img => ({
    inlineData: { mimeType: img.mimeType, data: img.base64 }
  }));
  parts.push({ text: "Analyze the style characteristics of these bathroom/interior reference images." });

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
